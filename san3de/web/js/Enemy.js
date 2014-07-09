function Enemy(/*Vec2*/ position, /*String*/ textureCode, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.imageIndex = 0;
	this.imgSpeed = 2;
	
	this.solid = true;
};

Enemy.prototype.getTexture = function(){
	var img = Math.floor(this.imageIndex);
	if (img == 0 || img == 2){
		return this.textureCode + "0";
	}else if (img == 1){
		return this.textureCode + "1";
	}else if (img == 3){
		return this.textureCode + "2";
	}else{
	}
};

Enemy.prototype.loop = function(deltaT){
	this.imageIndex += this.imgSpeed * deltaT;
	if (this.imageIndex >= 4) this.imageIndex = 0;
};
