function Enemy(/*Vec2*/ position, /*int*/ direction, /*String*/ textureCode, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.direction = Math.degToRad(direction);
	this.imageIndex = 0;
	this.imgSpeed = 0;
	this.imgNum = 0;
	this.visible = true;
	this.inMap = true;
	
	this.solid = true;
	this.rotate = false;
};

Enemy.prototype.getFaceByDirection = function(direction){
	var face = 0;
	var angle = ((Math.radToDeg(direction) + 360) % 360) << 0;
	
	if (angle > 25 && angle < 335){
		face = ((angle / 50) << 0) + 1;
	}
	
	return face;
};

Enemy.prototype.setTexture = function(textureBaseCode, imageNum, imageSpeed){
	this.textureCode = textureBaseCode;
	this.imgNum = imageNum;
	this.imgSpeed = imageSpeed;
	this.imageIndex = 0;
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

Enemy.prototype.isSolid = function(){
	return this.solid;
};

Enemy.prototype.loop = function(){
	if (this.imgSpeed > 0 && this.imgNum > 0){
		this.imageIndex += this.imgSpeed;
		if (this.imageIndex >= this.imgNum) this.imageIndex = 0;
	}

	if (this.rotate){
		this.direction += Math.PI2;
	}
};
