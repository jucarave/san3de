function Enemy(/*Vec2*/ position, /*String*/ textureCode, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.direction = Math.PI_2;
	this.imageIndex = 0;
	this.imgSpeed = 2;
	
	this.solid = true;
	this.rotate = false;
};

Enemy.prototype.getFaceByDirection = function(direction){
	var face = 0;
	var angle = Math.floor((Math.radToDeg(direction) + 360) % 360);
	
	if (angle > 25 && angle < 335){
		face = Math.floor(angle / 50) + 1;
	}
	
	return face;
};

Enemy.prototype.getTexture = function(angle){
	var face = this.getFaceByDirection(angle);
	var dirFace = this.getFaceByDirection(this.direction);
	var xScale = 1;
	
	face = (face + 12 - dirFace) % 8;
	if (face == 5){ face = 3; xScale = -1; }
	else if (face == 6){ face = 2; xScale = -1; }
	else if (face == 7){ face = 1; xScale = -1; }
	
	var obj = {
		texCode: this.textureCode + face + "_" + this.imageIndex,
		xScale: xScale
	};
	
	return obj;
};

Enemy.prototype.loop = function(deltaT){
	if (this.rotate){
		this.direction += Math.PI * deltaT;
	}
};
