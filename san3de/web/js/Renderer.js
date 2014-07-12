function RaycastRender(/*ImageData*/ dataCanvas, /*Int*/ fieldOfVision, /*Int*/ baseHeight, /*Game*/ game){
	this.game = game;
	
	this.canvas = dataCanvas;
	
	var bufD = new ArrayBuffer(dataCanvas.data.length);
	this.buf8 = new Uint8ClampedArray(bufD);
	this.buf32 = new Uint32Array(bufD);
	
	this.buf32[1] = 0x0a0b0c0d;
	this.isLittleEndian = true;
	if (bufD[4] == 0x0a && bufD[5] == 0x0b && bufD[6] == 0x0c && bufD[7] == 0x0d)
		this.isLittleEndian = false;
	
	this.size = vec2(dataCanvas.width, dataCanvas.height);
	this.fov = Math.degToRad(fieldOfVision / 2);
	this.angVar = Math.degToRad(fieldOfVision / this.size.a);
	this.fullFov = Math.degToRad(fieldOfVision);
	this.lineJ = this.size.a * 4;
	this.heightR = baseHeight;
	
	this.falling = false;
	this.z = 0;
	this.vspeed = 0;
	
	this.matDist = new Array(this.size.a);
}

RaycastRender.prototype.fall = function(){
	if (!this.falling) return;
	
	this.vspeed -= 60;
	this.z += this.vspeed;
	
	if (this.z < -this.size.b) this.falling = false;
};

RaycastRender.prototype.plot = function(x, y, color){
	if (this.isLittleEndian){
		this.buf32[y * this.size.a + x] = (255 << 24) | (color[2] << 16) | (color[1] << 8) | color[0];
	}else{
		this.buf32[y * this.size.a + x] = (color[0] << 24) | (color[1] << 16) | (color[2] << 8) | 255;
	}
};

RaycastRender.prototype.fillLine = function(x, y1, y2, tx, texture, colorHolder, drawSky){
	var size = y2 - y1;
	var back = Colors.ceil;
	var aC = Colors.alphaC;
	tx = (tx) << 0;
	
	var sy = 0;
	var ey = this.size.b;
	
	if (y2 > ey) y2 = ey;
	
	y1 += this.z;
	y2 += this.z;
	if (!drawSky){
		if (y1 > 0) sy = y1;
		if (y2 < ey) ey = y2;
	}else if (y1 < 0){
		back = Colors.floor;
	}
	
	var ty, ind, c;
	for (var i=sy;i<ey;i++){
		if (i < y1 || i > y2){
			if (i - this.z > this.size.b) back = Colors.shadowF;
		
			this.plot(x, i, back);
		}else{
			back = Colors.floor;
			
			ty = ((i - y1) / size * (texture.height - 1)) << 0;
			ind = tx + (ty * texture.width) - texture.offsetY;
			if (ind < 0) continue;
			
			c = colorHolder[texture.texData[ind]]; 
			
			if (!c) throw texture.texData[ind];
			if (aC[0] == c[0] && aC[1] == c[1] && aC[2] == c[2]) continue;
				
			this.plot(x, i, c);
		}
	}
};

RaycastRender.prototype.raycast = function(/*MapManager*/ mapManager){
	var map = mapManager.map;
	var p = mapManager.player.position;
	var d = mapManager.player.direction;
	var pz = mapManager.player.z;
	
	var ang = d + this.fov;
	var last = 0;
	var lastTex = null;
	
	for (var i=0;i<this.size.a;i++){
		var vAng = vec2(Math.cos(ang), -Math.sin(ang));
		var rayP = null;
		var rayA = p.clone();
		var rayB = p.clone();
		var jumA = vec2(1,1);
		var jumB = vec2(1,1);
		var mDist = -1;
		var dist = vec2(-1,-1);
		var tan = Math.tan(ang);
		var hit = false;
		var foundA = false, foundB = false;
		var wx, wy;
		var line = 0;
		var angB = Math.abs(d - ang);
		var tex, texA, texB;
		var tx;
		var colorH = null;
		
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
		
		while (!hit){
			if (!foundA){
				wx = (rayA.a << 0);
				wy = (rayA.b << 0);
				if (map[wy] == undefined || map[wy][wx] != 0){
					rayA.a = Math.round(rayA.a);
					var xx = rayA.a - p.a;
					dist.a = Math.abs(xx / Math.cos(ang));
					if (map[wy]) texA = map[wy][wx];
					foundA = true;
				}else{
					rayA.sum(jumA);
				}
			}
			
			if (!foundB){
				wx = (rayB.a << 0);
				wy = (rayB.b << 0);
				if (map[wy] == undefined || map[wy][wx] != 0){
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
		
		if (Math.abs(dist.a - dist.b) <= 0.01){
			if (last == 2 && texB == lastTex) dist.a = dist.b + 3;
			else if (last == 1 && texA == lastTex) dist.b = dist.a + 3;
		}
		
		last = (dist.a < dist.b)? 1 : 2;
		mDist = (dist.a < dist.b)? dist.a : dist.b;
		rayP = (dist.a < dist.b)? rayA : rayB;
		texA = (dist.a < dist.b)? texA : texB;
		tex = this.game.getTexture(texA);
		if (!tex) continue;
		tx = (dist.a < dist.b)? (rayP.b * tex.width % tex.width) : (rayP.a * tex.width % tex.width);
		colorH = (dist.a < dist.b)? (Colors.textures) : (Colors.texturesShadow);
		lastTex = texA;
		
		mDist *= Math.cos(angB);
		
		line = this.heightR / mDist;
		var y1 = Math.round((this.size.b / 2) - line / 2);
		var y2 = Math.round(y1 + line);
		this.matDist[i] = mDist;
		
		this.fillLine(i,y1,y2,tx,tex,colorH,true);
		
		ang -= this.angVar;
	}
	
	this.objectCasting(p, d, mapManager.instances);
	this.doorCasting(p, d, mapManager.doors);
	
	this.canvas.data.set(this.buf8);
};

RaycastRender.prototype.castTo = function(posA, posB, lAng, rAng){
	var angle = Math.getAngle(posA, posB);
	
	var sl = Math.abs(Math.getShortAngle(angle, lAng));
	var sr = Math.abs(Math.getShortAngle(angle, rAng));
	
	angle += Math.PI2;
	lAng += Math.PI2;
	rAng += Math.PI2;
	
	if (sl < sr){
		if (angle > lAng && angle < rAng) sl *= -1;
		else if (angle < lAng && angle < rAng && lAng > rAng) sl *= -1;
		else if (angle > lAng && angle > rAng && lAng > rAng) sl *= -1;
	}
	
	var x = (sl / this.fullFov) * this.size.a;
	if (x > 1000) return null;
	
	var dist = Math.getDistance(posA, posB);
	
	var scale = this.heightR / dist;
	
	x = Math.round(x);
	return {x: x, dist: dist, scale: scale, angle: angle};
};

RaycastRender.prototype.objectCasting = function(/*Vec2*/ position, /*float*/ direction, /*Array*/ instances){
	var lAng = (direction + this.fov + Math.PI2) % Math.PI2;
	var rAng = (direction - this.fov + Math.PI2) % Math.PI2;
	
	var sortedIns = [];
	
	for (var i=0,len=instances.length;i<len;i++){
		var ins = instances[i];
		
		var xx = Math.abs(ins.position.a - position.a);
		var yy = Math.abs(ins.position.b - position.b);
		
		if (xx > 10 || yy > 10) continue;
			
		var ray = this.castTo(position, ins.position, lAng, rAng);
		if (!ray) continue;
		
		var sorI = {ins: ins, scale: ray.scale, dist: ray.dist, x: ray.x, angle: ray.angle};
		var added = false;
		
		for (var j=0,jlen=sortedIns.length;j<jlen;j++){
			if (ray.dist > sortedIns[j].dist){
				sortedIns.splice(j,0,sorI);
				j = jlen;
				added = true;
			}
		}
		
		if (!added){
			sortedIns.push(sorI);
		}
	}
	
	this.drawInstances(sortedIns);
};

RaycastRender.prototype.doorCasting = function(/*Vec2*/ position, /*float*/ direction, /*Array*/ doors){
	var lAng = (direction + this.fov + Math.PI2) % Math.PI2;
	var rAng = (direction - this.fov + Math.PI2) % Math.PI2;
	
	var sortedIns = [];
	
	for (var i=0,len=doors.length;i<len;i++){
		var ins = doors[i];
		
		var xx = Math.abs(ins.position.a - position.a);
		var yy = Math.abs(ins.position.b - position.b);
		
		if (xx > 10 || yy > 10) continue;
		
		pos = (ins.direction == "H")? vec2((ins.position.a << 0), ins.position.b) : vec2(ins.position.a, (ins.position.b << 0));
		var ray1 = this.castTo(position, pos, lAng, rAng);
		if (!ray1) continue;
		
		pos = (ins.direction == "H")? vec2((1 + ins.position.a) << 0, ins.position.b) : vec2(ins.position.a, (1 + ins.position.b) << 0);
		var ray2 = this.castTo(position, pos, lAng, rAng);
		if (!ray2) continue;
		
		var sorI = {ins: ins, scale1: ray1.scale, dist1: ray1.dist, x1: ray1.x, scale2: ray2.scale, dist2: ray2.dist, x2: ray2.x};
		var added = false;
		
		for (var j=0,jlen=sortedIns.length;j<jlen;j++){
			if (ray1.dist > sortedIns[j].dist1){
				sortedIns.splice(j,0,sorI);
				j = jlen;
				added = true;
			}
		}
		
		if (!added){
			sortedIns.push(sorI);
		}
	}
	
	this.drawDoors(sortedIns);
};

RaycastRender.prototype.drawDoors = function(instances){
	var hv = (this.size.b / 2);
	var xx, x1, x2, y1, y2, d, s, ss, dis, size, sc, tex, tx, color, j, ins, ol ,or, rel, texScale;
	color = Colors.textures;
	for (var i=0,len=instances.length;i<len;i++){
		ins = instances[i];
		tex = this.game.textures[ins.ins.getTexture()];
		
		if (ins.x1 < ins.x2){
			x1 = ins.x1;
			x2 = ins.x2;
			d = (ins.scale1 < ins.scale2)? 1 : -1;
			s = ins.scale1;
			texScale = 1;
		}else{
			x1 = ins.x2;
			x2 = ins.x1;
			d = (ins.scale1 < ins.scale2)? -1 : 1;
			s = ins.scale2;
			texScale = -1;
		}
		
		if ((x1 < 0 && x2 < 0) || (x1 > this.size.a && x2 > this.size.a)) continue;
		
		dis = (ins.dist1 < ins.dist2)? ins.dist1 : ins.dist2;
		ss = Math.abs(ins.scale2 - ins.scale1) / (x2 - x1);
		
		xx = 0;
		size = x2 - x1;
		rel = size / tex.height;
		
		if (x1 < 0){ 
			xx = -x1;
		}
		
		if (x1 < 0) x1 = 0;
		if (x2 > this.size.a) x2 = this.size.a;
		
		for (j=x1;j<x2;j++){
			xx++;
			if (dis <= this.matDist[j]){
				sc = s + (ss * xx * d);
				y1 = Math.round(hv - sc / 2);
				y2 = Math.round(y1 + sc);
				
				tx = ((xx / size) * tex.width) << 0;
				if (texScale == -1) tx = tex.width - tx - 1;
				if (tx < 0) tx = 0;
			
				this.fillLine(j,y1,y2,tx,tex,color,false);
			}
		}
	}
};

RaycastRender.prototype.drawInstances = function(instances){
	var ins, y1, y2, texInfo, tex, color, rel, ol, or, j, x, tx;	
	for (var i=0,len=instances.length;i<len;i++){
		ins = instances[i];
		
		y1 = Math.round((this.size.b / 2) - ins.scale / 2);
		y2 = Math.round(y1 + ins.scale);
		
		texInfo = ins.ins.getTexture(ins.angle);
		tex = this.game.getBillboard(texInfo.texCode);
		color = Colors.billboards;
		
		rel = ins.scale / tex.h;
		ol = ins.x + ((tex.offsetL > 0)? (tex.offsetL * rel) : 0);
		or = ins.x + ((tex.offsetR > 0)? (tex.offsetR * rel) : xScale);
		
		if (ins.x + ins.scale < 0) continue;
		else if (ins.x > this.size.a) continue;
		
		for (j=0;j<ins.scale;j++){
			x = ins.x + j;
			if (x < ol || x > or) continue;
			
			if (x > 0 && x < this.size.a){
				if (ins.dist < this.matDist[x]){
					tx = (j / ins.scale * tex.width) << 0;
					if (texInfo.xScale == -1) tx = tex.width - tx;
					
					this.fillLine(x,y1,y2,tx,tex,color,false);
					this.matDist[x] = ins.dist;
				}
			}
		}
	}
};

RaycastRender.prototype.draw = function(/*Context*/ ctx, /*Vec2*/ position){
	ctx.putImageData(this.canvas, position.a, position.b);
};
