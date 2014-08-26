function Enemy(/*Vec2*/ position, /*int*/ direction, /*EnemyFactory*/ enemyInfo, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = null;
	this.mapManager = mapManager;
	this.enemy = enemyInfo;
	
	this.direction = Math.degToRad(direction);
	this.imageIndex = 0;
	this.imgSpeed = 0;
	this.imgNum = 0;
	this.visible = true;
	this.inMap = true;
	this.indexAnimation = null;
	
	this.solid = true;
	
	this.allowAngledFaces = false;
	this.animation = "stand";
	this.setTexture(enemyInfo[this.animation]);
};

Enemy.prototype.getFaceByDirection = function(direction){
	var face = 0;
	var angle = ((Math.radToDeg(direction) + 360) % 360) << 0;
	
	if (angle > 25 && angle < 335){
		face = ((angle / 50) << 0) + 1;
	}
	
	return face;
};

Enemy.prototype.changeAnimation = function(animationCode){
	this.animation = animationCode;
	if (!this.enemy[animationCode]) animationCode = "stand";
	this.setTexture(this.enemy[animationCode]);
};

Enemy.prototype.setTexture = function(textureInfo){
	this.textureCode = textureInfo.texCode;
	this.imgNum = textureInfo.animKeys.length;
	this.imgSpeed = textureInfo.speed;
	this.imageIndex = 0;
	this.indexAnimation = textureInfo.animKeys;
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

Enemy.prototype.step = function(){
	var p = this.mapManager.player.position;
	var xx = Math.abs(this.position.a - p.a);
	var yy = Math.abs(this.position.b - p.b);
		
	if (xx <= 5 && yy <= 5 && this.animation != "walk"){
		this.changeAnimation("walk");
	}else if (xx > 5 && yy > 5 && this.animation != "stand"){
		this.changeAnimation("stand");
	}
};

Enemy.prototype.loop = function(){
	if (this.imgSpeed > 0 && this.imgNum > 0){
		this.imageIndex += this.imgSpeed;
		if (this.imageIndex >= this.imgNum) this.imageIndex = 0;
	}

	this.step();
};
