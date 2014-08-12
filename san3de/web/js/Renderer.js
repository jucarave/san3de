/*===================================================
	This class creates the pseudo3D perspective
	using raycasting, the process is divided in
	three parts: WallCasting, ObjectCasting,
	DoorCasting.
===================================================*/
function RaycastRender(/*ImageData*/ dataCanvas, /*Int*/ fieldOfVision, /*Int*/ baseHeight, /*Game*/ game){
	this.game = game;
	
	this.canvas = dataCanvas;
	
	// Creates 8Bit and 32Bit views of the ImageData, its faster to plot pixels on a 32Bit Array
	var bufD = new ArrayBuffer(dataCanvas.data.length);
	this.buf8 = new Uint8ClampedArray(bufD);
	this.buf32 = new Uint32Array(bufD);
	
	// Depending of the processor the game its currently running
	// The plotting function may vary from rgba to abgr
	this.buf32[1] = 0x0a0b0c0d;
	this.isLittleEndian = true;
	if (bufD[4] == 0x0a && bufD[5] == 0x0b && bufD[6] == 0x0c && bufD[7] == 0x0d)
		this.isLittleEndian = false;
	
	// Creates static data of common measures of angles
	this.size = vec2(dataCanvas.width, dataCanvas.height);
	this.fov = Math.degToRad(fieldOfVision / 2);
	this.angVar = Math.degToRad(fieldOfVision / this.size.a);
	this.fullFov = Math.degToRad(fieldOfVision);
	this.lineJ = this.size.a * 4;
	this.heightR = baseHeight;
	
	// Black fog of the canvas
	this.fog = null;
	
	// Variables for when the player is falling in a trap
	this.falling = false;
	
	this.baseHeight = 32;
	this.rBase = this.heightR / this.baseHeight;
	this.floorR = 90 / this.baseHeight;
	this.z = this.baseHeight;
	this.zAngle = 0;
	this.vspeed = 0;
	
	// Array of distances (one per column)
	this.matDist = new Array(this.size.a);
}

/*===================================================
	Calculate the int alpha value using the 
	distance and the setted fog
===================================================*/
RaycastRender.prototype.getAlphaByDistance = function(/*float*/ distance){
	var alpha = 255;
	if (this.fog != null){
		if (distance > this.fog.b){
			alpha = 0;
		}else if (distance > this.fog.a){
			var rel = ((distance - this.fog.a) / (this.fog.b - this.fog.a)) * 255;
			alpha = 255 - rel;
		}
	}
	
	return (alpha << 0);
};

/*===================================================
	Sets the fog minimum and maximum distance
===================================================*/
RaycastRender.prototype.setFog = function(start, end){
	this.fog = vec2(start, end);
};

/*===================================================
	If the player is falling through a trap, then
	move all the walls up
===================================================*/
RaycastRender.prototype.fall = function(){
	if (!this.falling) return;
	
	this.vspeed -= 60;
	this.z += this.vspeed;
	
	if (this.z < -this.size.b) this.falling = false;
};

/*===================================================
	Plot a pixel in the 32Bit Array in the current
	Endian format.
===================================================*/
RaycastRender.prototype.plot = function(/*Int*/ x, /*Int*/ y, /*Array*/ color, /*Int*/ alpha){
	if (alpha === null) alpha = 255;
	
	if (this.isLittleEndian){
		// ABGR
		this.buf32[y * this.size.a + x] = (alpha << 24) | (color[2] << 16) | (color[1] << 8) | color[0];
	}else{
		// RGBA
		this.buf32[y * this.size.a + x] = (color[0] << 24) | (color[1] << 16) | (color[2] << 8) | alpha;
	}
};

/*===================================================
	Copy a line of a texture into a column of 
	the renderer
===================================================*/
RaycastRender.prototype.fillLine = function(/*Int*/ x, /*Int*/ y1, /*Int*/ y2, /*Int*/ tx, /*Texture*/ texture, /*ColorArray*/ colorHolder, /*Int*/ alpha){
	var size = y2 - y1;
	var aC = Colors.alphaC;	// Pixels of this color wont be draw
	tx = (tx) << 0;
	
	var sy = 0;				// First vertical position of the renderer
	var ey = this.size.b;	// It can't go beyond the size of the renderer
	var draw = false;		// Was this line drew?
	var drawL = 0;			// Drawed pixels
	var skipL = 0;			// Skiped pixels
	
	if (y2 > ey) y2 = ey;
	
	if (y1 > 0) sy = y1;
	if (y2 < ey) ey = y2;
	var hb = this.size.b / 2;
	
	var ty, ind, c;
	for (var i=sy;i<ey;i++){
		// Get the vertical position of the texture
		ty = ((i - y1) / size * (texture.height - 1)) << 0;
		if (ty < texture.offsetT || ty >= texture.offsetB){
			skipL++; 
			continue;
		}
		ty -= texture.offsetT;
		
		// Calculate the index of the texture to get its color
		ind = tx + (ty * texture.innerW);
		c = colorHolder[texture.texData[ind]];
		
		// If there is no color, then throw an error
		if (!c) throw tx + " _ " + ty + " _ " + ind + " _ " + texture.name;
		if (aC[0] == c[0] && aC[1] == c[1] && aC[2] == c[2]){
			skipL++; 
			continue; 
		}
			
		drawL++;
		this.plot(x, i, c, alpha);
	}
	
	draw = (drawL > skipL);
	return draw;
};

/*===================================================
	This is the WallCasting function, it cast rays
	along all the field of view of the player,
	it also calls the Object and Door casting
===================================================*/
RaycastRender.prototype.raycast = function(/*MapManager*/ mapManager){
	var map = mapManager.map;				// Map Data
	var floor = mapManager.floor;			// Floor tiles
	var ceil = mapManager.ceil;				// Ceil tiles
	var p = mapManager.player.position;		// Position of the player
	var d = mapManager.player.direction;	// Direction (Radians) of the player
	
	var ang = d + this.fov;					// First angle to be casted
	var last = 0;							// Orientation of the last Ray (1: Horizontal, 2: Vertical)
	var lastTex = null;						// Last texture that was draw
	
	this.z = mapManager.player.z;
	
	var sizeH = (this.size.b / 2) << 0;
	var floorText = null;
	var ceilText = null;
	
	this.lookUpDown(mapManager.game);
	
	for (var i=0;i<this.size.a;i++){
		var vAng = vec2(Math.cos(ang), -Math.sin(ang));	// Orientation of the casted angle
		var rayA = p.clone();							// Position of the horizontal ray
		var rayB = p.clone();							// Position of the vertical ray
		var jumA = vec2(1,1);							// Jumps of the horizontal ray
		var jumB = vec2(1,1);							// Jumps of the vertical ray
		var dist = vec2(-1,-1);							// Distance of both rays
		var rayP = null;								// Position of the found wall
		var mDist = -1;									// Distance of the found wall
		var tan = Math.tan(ang);						// Tangent of the casted angle
		var hit = false;								// Had both rays hit?
		var foundA = false, foundB = false;				// Had any of the rays hit?
		var wx, wy;										// Map x, y
		var line = 0;									// Size of the wall
		var angB = Math.abs(d - ang);					// Beta angle (to correct the eyefish)
		var cosB = Math.cos(angB);						// Cosine of the beta angle (used mostly in floorCasting)
		var tex, texA, texB;							// Horizontal, Vertical and found texture
		var tx;											// Horizontal position in the texture
		var colorH = null;								// Determines if the colors are normal or shadowed
		
		// Fix the ray position
		// Horizontal
		if (vAng.a > 0){
			rayA.a = (1 + rayA.a) << 0;
		}else if (vAng.a < 0){
			rayA.a = ((rayA.a) << 0) - 0.001;
			jumA.a = -1;
		}
		
		// Vertical
		if (vAng.b > 0){
			rayB.b = (1 + rayB.b) << 0;
		}else if (vAng.b < 0){
			rayB.b = ((rayB.b) << 0) - 0.001;
			jumB.b = -1;
		}
		
		jumA.b = -jumA.a * tan;
		jumB.a = -jumB.b / tan;
		rayA.b = p.b - (rayA.a - p.a) * tan;
		rayB.a = p.a - (rayB.b - p.b) / tan;
		
		// Do the actual raycasting
		while (!hit){
			// Do until the horizontal ray hits a wall
			if (!foundA){
				wx = (rayA.a << 0);
				wy = (rayA.b << 0);
				if (map[wy] == undefined || map[wy][wx] != 0){
					// If there is a wall, then get its texture and distance
					rayA.a = Math.round(rayA.a);
					var xx = rayA.a - p.a;
					dist.a = Math.abs(xx / Math.cos(ang));
					if (map[wy]) texA = map[wy][wx];
					foundA = true;
				}else{
					rayA.sum(jumA);
				}
			}
			
			// Do until the vertical ray hits a wall
			if (!foundB){
				wx = (rayB.a << 0);
				wy = (rayB.b << 0);
				if (map[wy] == undefined || map[wy][wx] != 0){
					// If there is a wall, then get its texture and distance
					rayB.b = Math.round(rayB.b);
					var xx = rayB.b - p.b;
					dist.b = Math.abs(xx / Math.sin(ang));
					if (map[wy]) texB = map[wy][wx];
					foundB = true;
				}else{
					rayB.sum(jumB);
				}
			}
			
			hit = (foundA && foundB);
		}
		
		// Little hack (WIP) to adjust vertical lines of different 
		// color when both distances are close
		if (Math.abs(dist.a - dist.b) <= 0.01){
			if (last == 2 && texB == lastTex) dist.a = dist.b + 3;
			else if (last == 1 && texA == lastTex) dist.b = dist.a + 3;
		}
		
		// Get the final data after the raycast
		last = (dist.a < dist.b)? 1 : 2;
		mDist = (dist.a < dist.b)? dist.a : dist.b;
		rayP = (dist.a < dist.b)? rayA : rayB;
		texA = (dist.a < dist.b)? texA : texB;
		tex = this.game.getTexture(texA);
		if (!tex) continue;
		tx = (dist.a < dist.b)? (rayP.b * tex.width % tex.width) : (rayP.a * tex.width % tex.width);
		colorH = (dist.a < dist.b)? (Colors.textures) : (Colors.texturesShadow);
		lastTex = texA;
		
		// Solve the eyefish effect
		mDist *= cosB;
		
		// Calculate the height of the wall
		var sRLine = this.rBase * this.z;
		var rLine = sRLine / mDist;
		line = this.heightR / mDist;
		var height = this.z - 32;
		var y2 = Math.round((this.size.b / 2) + rLine / 2) + this.zAngle + height;
		var y1 = Math.round(y2 - line);
		this.matDist[i] = mDist;
		
		var alpha = this.getAlphaByDistance(mDist);
		
		// Copy the texture data into memory
		this.fillLine(i,y1,y2,tx,tex,colorH,alpha);
		
		// The first horline must be black
		var c = Colors.blackC;
		this.plot(i, 0, c, 255);
		
		var fry = y2;
		var alphaH = sizeH + this.zAngle + height;
		var rel = this.floorR * this.z / cosB;
		// Do the floor casting and drawing
		for (var f=fry;f<this.size.b;f++){
			var py = Math.abs(sizeH - f + this.zAngle + height);
			var floorD = (rel / py);
			var fx = (p.a + vAng.a * floorD);
			var fy = (p.b + vAng.b * floorD);
			
			var cx = (fx << 0);
			var cy = (fy << 0);
			if (!floor[cy]) continue;
			floorText = this.game.getTexture(floor[cy][cx]);
			
			if (!floorText){ continue; }
			
			var tfx = (fx * floorText.width % floorText.width) << 0;
			var tfy = (fy * floorText.height % floorText.height) << 0;
			var ind = tfx + (tfy * floorText.innerW);
			
			var cf = Colors.textures[floorText.texData[ind]];
			
			if (cf){
				var alp = 255;
				if (this.fog != null){
					if (f < alphaH){ alp = (alphaH - f) / sizeH * 255; }
					else if (f >= alphaH){ alp = (f - alphaH) / sizeH * 255; }
				}
				if (alp > 255) alp = 255;
			
				this.plot(i, f, cf, alp);
			}
		}
		
		var fry = y1 - 1;
		var z2 = 64 - this.z;
		rel = this.floorR * z2 / cosB;
		// Do the ceil casting and drawing
		for (var f=fry;f>=0;f--){
			var py = Math.abs(sizeH - f + this.zAngle + height);
			var floorD = (rel / py);
			var fx = (p.a + vAng.a * floorD);
			var fy = (p.b + vAng.b * floorD);
			
			var cx = (fx << 0);
			var cy = (fy << 0);
			if (!floor[cy]) continue;
			ceilText = this.game.getTexture(ceil[cy][cx]);
			
			if (!ceilText){ continue; }
			
			var tfx = (fx * ceilText.width % ceilText.width) << 0;
			var tfy = (fy * ceilText.height % ceilText.height) << 0;
			var ind = tfx + (tfy * ceilText.innerW);
			
			var cc = Colors.textures[ceilText.texData[ind]];
			
			if (cc){
				var alp = 255;
				if (this.fog != null){
					if (f < alphaH){ alp = (alphaH - f) / sizeH * 255; }
					else if (f >= alphaH){ alp = (f - alphaH) / sizeH * 255; }
				}
				if (alp > 255) alp = 255;
			
				this.plot(i, f, cc, alp);
			}
		}
		
		// Continue to the next ray
		ang -= this.angVar;
	}
	
	// Call the other castings
	var doors  = this.doorCasting(p, d, mapManager.doors);
	var instances = this.objectCasting(p, d, mapManager.instances);
	
	// Order and draw the instances
	this.renderInstances(instances, doors);
	
	// Copy the 8Bit buffer into the 8Bit data
	this.canvas.data.set(this.buf8);
};

/*===================================================
	Cast a ray between two position to get the
	horizontal position in the screen as well
	the size and distance of the object
===================================================*/
RaycastRender.prototype.castTo = function(/*Vec2*/ posA, /*Vec2*/ posB, /*float*/ lAng, /*float*/ rAng, /*float*/ dir){
	// Get the angle between the two objects
	var angle = Math.getAngle(posA, posB);
	var angB = Math.abs(dir - angle);
	
	// Get the distance from both view extremes to the angle
	var sl = Math.abs(Math.getShortAngle(angle, lAng));
	var sr = Math.abs(Math.getShortAngle(angle, rAng));
	
	// Avoid the problem of the 359+1=0 degrees
	angle += Math.PI2;
	lAng += Math.PI2;
	rAng += Math.PI2;
	
	// If the angle is close to the left extreme of the view,
	// then set the object at a negative position
	if (sl < sr){
		if (angle > lAng && angle < rAng) sl *= -1;
		else if (angle < lAng && angle < rAng && lAng > rAng) sl *= -1;
		else if (angle > lAng && angle > rAng && lAng > rAng) sl *= -1;
	}
	
	// Get the x position in the screen
	var x = (sl / this.fullFov) * this.size.a;
	if (x > 1000) return null; //If the object is too far, then don't draw it
	
	// Get the distance between the positions
	var dist = Math.getDistance(posA, posB);
	dist *= Math.cos(angB);
	
	// Get the scale of the object
	var scale = this.heightR / dist;
	
	// Get the zPosition scale of the object
	var sRLine = this.rBase * this.z;
	var rLine = sRLine / dist;
	
	x = Math.round(x);
	return {x: x, dist: dist, scale: scale, angle: angle, zScale: rLine};
};

/*===================================================
	Cast a ray to all the objects that are near
	and draw the ones that can be draw
===================================================*/
RaycastRender.prototype.objectCasting = function(/*Vec2*/ position, /*float*/ direction, /*Array*/ instances){
	// Get the extremes of the field of view
	var lAng = (direction + this.fov + Math.PI2) % Math.PI2;
	var rAng = (direction - this.fov + Math.PI2) % Math.PI2;
	
	// The instances that are going to be draw (far to near)
	var sortedIns = [];
	
	// Check all the instances in the map
	for (var i=0,len=instances.length;i<len;i++){
		var ins = instances[i];
		// If it's not visible then don't draw it
		if (!ins.visible) continue;
		
		var xx = Math.abs(ins.position.a - position.a);
		var yy = Math.abs(ins.position.b - position.b);
		
		// If its too far, then don't draw it
		if (xx > 10 || yy > 10) continue;
			
		// Cast a ray to the object
		var ray = this.castTo(position, ins.position, lAng, rAng, direction);
		if (!ray) continue;
		
		// Center the object in its position
		ray.x = Math.round(ray.x - ray.scale / 2);
		var sorI = {ins: ins, scale: ray.scale, dist: ray.dist, x: ray.x, angle: ray.angle, type: 0, zScale: ray.zScale};
		var added = false;
		
		// Find if there is a near distance, then put it behind
		for (var j=0,jlen=sortedIns.length;j<jlen;j++){
			if (ray.dist > sortedIns[j].dist){
				sortedIns.splice(j,0,sorI);
				j = jlen;
				added = true;
			}
		}
		
		if (!added){
			// Or just add it to the instances at the end
			sortedIns.push(sorI);
		}
	}
	
	return sortedIns;
};

/*===================================================
	Cast a ray to all the doors that are near and
	call for a draw to the ones that can
===================================================*/
RaycastRender.prototype.doorCasting = function(/*Vec2*/ position, /*float*/ direction, /*Array*/ doors){
	// Calculate the extremes of the field of view
	var lAng = (direction + this.fov + Math.PI2) % Math.PI2;
	var rAng = (direction - this.fov + Math.PI2) % Math.PI2;
	
	// Doors that are going to be draw (far to near)
	var sortedIns = [];
	
	for (var i=0,len=doors.length;i<len;i++){
		var ins = doors[i];
		
		var xx = Math.abs(ins.position.a - position.a);
		var yy = Math.abs(ins.position.b - position.b);
		
		// If it's too far or too near, don't draw it
		if (xx > 10 || yy > 10) continue;
		if (xx < 0.5 && yy < 0.5) continue;
		
		// Cast a ray to the left extreme of the door
		pos = ins.leftPos;
		var ray1 = this.castTo(position, pos, lAng, rAng, direction);
		if (!ray1) continue;
		
		// Cast a ray to the right extreme of the door
		pos = ins.rightPos;
		var ray2 = this.castTo(position, pos, lAng, rAng, direction);
		if (!ray2) continue;
		
		var sorI = {ins: ins, scale1: ray1.scale, dist: ray1.dist, x1: ray1.x, scale2: ray2.scale, dist2: ray2.dist, x2: ray2.x, type: 1, zScale1: ray1.zScale, zScale2: ray2.zScale};
		var added = false;
		
		// Check if there is any near door, then put it behind
		for (var j=0,jlen=sortedIns.length;j<jlen;j++){
			if (ray1.dist > sortedIns[j].dist){
				sortedIns.splice(j,0,sorI);
				j = jlen;
				added = true;
			}
		}
		
		// Or add it to the end
		if (!added){
			sortedIns.push(sorI);
		}
	}
	
	return sortedIns;
};

/*===================================================
	Draw all the doors that are on the field
	of vision.
===================================================*/
RaycastRender.prototype.drawDoor = function(ins){
	var hv = (this.size.b / 2);
	// Variables for position, texture position, and scale of the door.
	var xx, x1, x2, y1, y2, d, s, ss, dis, size, sc, tex, tx, color, j, ins, ol ,or, rel, texScale;
	color = Colors.textures;
	tex = this.game.textures[ins.ins.getTexture()];
	
	// Depending on the direction we are watching the door, we invert its values
	if (ins.x1 < ins.x2){
		x1 = ins.x1;
		x2 = ins.x2;
		d = (ins.scale1 < ins.scale2)? 1 : -1;
		s = ins.scale1;
		sZ = ins.zScale1;
		texScale = 1;
	}else{
		x1 = ins.x2;
		x2 = ins.x1;
		d = (ins.scale1 < ins.scale2)? -1 : 1;
		s = ins.scale2;
		sZ = ins.zScale2;
		texScale = -1;
	}
	
	// If the door is outside the screen, then don't draw it
	if ((x1 < 0 && x2 < 0) || (x1 > this.size.a && x2 > this.size.a)) return;
	
	// Get the scale variance between horizontal pixels
	dis = (ins.dist < ins.dist2)? ins.dist : ins.dist2;
	ss = Math.abs(ins.scale2 - ins.scale1) / (x2 - x1);
	zs = Math.abs(ins.zScale2 - ins.zScale1) / (x2 - x1);
	
	var alpha = this.getAlphaByDistance(dis);
	
	xx = 0;
	size = x2 - x1;
	
	if (x1 < 0){ 
		xx = -x1; 
		x1 = 0;
	}
	if (x2 > this.size.a) x2 = this.size.a;
	
	var height = this.z - 32;
	var sizeH = (this.size.b / 2) << 0;
	for (j=x1;j<x2;j++){
		xx++;
		if (dis <= this.matDist[j]){
			zSc = sZ + (zs * xx * d);
			sc = s + (ss * xx * d);
			
			// Get the vertical position of this line
			y2 = Math.round(hv + zSc / 2) + this.zAngle + height;
			y1 = Math.round(y2 - sc);
			
			// Get the texture line
			tx = ((xx / size) * tex.width) << 0;
			if (texScale == -1) tx = tex.width - tx - 1;
			if (tx < 0) tx = 0;
		
			// Copy the texture line into the Buffer
			this.fillLine(j,y1,y2,tx,tex,color,alpha);
		}
	}
};

/*===================================================
	Draw all the instances that are in the field
	of vision
===================================================*/
RaycastRender.prototype.drawInstance = function(ins){
	// Variables for getting the position, texture, and color of the instance
	var y1, y2, texInfo, tex, color, rel, ol, or, j, x, tx;	
		
	var height = this.z - 32;
	var sizeH = (this.size.b / 2) << 0;
	y2 = Math.round(sizeH + ins.zScale / 2) + this.zAngle + height;
	y1 = Math.round(y2 - ins.scale);
	
	// Get the texture of the instance
	texInfo = ins.ins.getTexture(ins.angle);
	if (texInfo.texCode == "none") return;
	tex = this.game.getBillboard(texInfo.texCode);
	color = Colors.billboards;
	
	rel = ins.scale / tex.h;
	
	var alpha = this.getAlphaByDistance(ins.dist);
	
	// If the instance is outside the view, then don't draw it
	if (Math.abs(ins.scale) >= 1000) return;
	if (ins.x + ins.scale < 0) return;
	else if (ins.x > this.size.a) return;
	
	for (j=0;j<ins.scale;j++){
		x = ins.x + j;
		
		if (x > 0 && x < this.size.a){
			if (ins.dist < this.matDist[x]){
				tx = (j / ins.scale * tex.width) << 0;
				
				// Adjust the texture with the scale of the object
				if (tx < tex.offsetL || tx >= tex.offsetR) continue;
				if (texInfo.xScale == -1) tx = tex.width - tx - tex.invOffR;
				else tx -= tex.offsetL;
				
				// Copy the line of the texture into memory
				this.fillLine(x,y1,y2,tx,tex,color,alpha);
			}
		}
	}
};
/*===================================================
	Order all the doors and instances and then
	draw them
===================================================*/
RaycastRender.prototype.renderInstances = function(instances, doors){
	// Order the instances and doors by distance
	for (var i=0,len=doors.length;i<len;i++){
		var added = false;
		for (var j=0,jlen=instances.length;j<jlen;j++){
			if (doors[i].dist > instances[j].dist){
				instances.splice(j,0,doors[i]);
				added = true;
				j = jlen;
			}
		}
		
		if (!added){ instances.push(doors[i]); }
	}
	
	// Draw the orderer instances according to their type
	for (var i=0,len=instances.length;i<len;i++){
		var ins = instances[i];
		if (ins.dist > 15 || ins.dist < 0.01) continue;
		if (ins.type == 0){ this.drawInstance(ins); }else 
		if (ins.type == 1){ this.drawDoor(ins); }
	}
};

/*===================================================
	Draws the Image data with the 3D view in a
	position
===================================================*/
RaycastRender.prototype.draw = function(/*Context*/ ctx, /*Vec2*/ position){
	ctx.putImageData(this.canvas, position.a, position.b);
};


/*===================================================
	Simulates a fake look up/down
===================================================*/
RaycastRender.prototype.lookUpDown = function(/*Game*/ game){
	if (game.keys[49]) this.zAngle += 3; else
	if (game.keys[50]) this.zAngle = 0; else
	if (game.keys[51]) this.zAngle -= 3;
	
	if (this.zAngle > 75) this.zAngle = 75;
	else if (this.zAngle < -75) this.zAngle = -75; 
};
