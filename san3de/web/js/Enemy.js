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
	this.indexAnimation = null;
	
	this.solid = true;
	this.rotate = false;
	
	this.allowAngledFaces = false;
	this.setTexture(textureCode, 4, 1/4, [0,1,2,1]);
};

Enemy.prototype.getFaceByDirection = function(direction){
	var face = 0;
	var angle = ((Math.radToDeg(direction) + 360) % 360) << 0;
	
	if (angle > 25 && angle < 335){
		face = ((angle / 50) << 0) + 1;
	}
	
	return face;
};

Enemy.prototype.setTexture = function(textureBaseCode, imageNum, imageSpeed, indexAnimation){
	this.textureCode = textureBaseCode;
	this.imgNum = imageNum;
	this.imgSpeed = imageSpeed;
	this.imageIndex = 0;
	this.indexAnimation = indexAnimation;
};

Enemy.prototype.getTexture = function(angle){
	var face, img;
	var xScale = 1;
	if (this.allowAngledFaces){
		face = this.getFaceByDirection(angle);
		dirFace = this.getFaceByDirection(this.direction);
		img = this.imageIndex << 0;
		
		face = (face + 12 - dirFace) % 8;
		if (face == 5){ face = 3; xScale = -1; }
		else if (face == 6){ face = 2; xScale = -1; }
		else if (face == 7){ face = 1; xScale = -1; }
	}else{
		face = "";
		img = this.indexAnimation[(this.imageIndex << 0)];
	}
	
	var obj = {
		texCode: this.textureCode + face + "_" + img,
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
