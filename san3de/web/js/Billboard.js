function Billboard(/*Vec2*/ position, /*String*/ textureCode, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.solid = true;
};

Billboard.prototype.getTexture = function(){
	return this.textureCode;
};