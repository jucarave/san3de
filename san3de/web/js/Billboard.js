function Billboard(/*Vec2*/ position, /*String*/ textureCode, /*Array*/ params, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.solid = true;
	this.imgIndex = 0;
	this.imgSpd = 0;
	this.imgNum = 0;
	this.visible = true;
	this.actionType = null;
	
	this.parseParams(params);
};

Billboard.prototype.parseParams = function(params){
	if (params && params.length > 0) for (var i=0,len=params.length;i<len;i++){
		var p = params[i].trim();
		if (p.indexOf("iN") == 0){ //Image Number (Allow animation)
			p = p.replace("iN", "");
			this.imgSpd = 1 / 3;
			this.imgNum = parseInt(p);
			this.imgIndex = Math.iRandom(this.imgNum);
		}else if (p == "vH"){ //Visibility hidden
			this.visible = false;
		}else if (p == "tV"){ //Toggle visibility on action
			this.actionType = p;
		}
	}
};

Billboard.prototype.active = function(){
	if (this.actionType == null) return;
	
	if (this.actionType == "tV"){ this.visible = !this.visible; }
};

Billboard.prototype.getTexture = function(){
	var tex = this.textureCode;
	if (this.imgNum > 0)
		tex += (this.imgIndex << 0);
	return {texCode: tex, xScale: 1};
};

Billboard.prototype.loop = function(){
	if (this.imgSpd > 0 && this.imgNum > 0){
		this.imgIndex += this.imgSpd;
		if (this.imgIndex >= this.imgNum) this.imgIndex = 0;
	}
};
