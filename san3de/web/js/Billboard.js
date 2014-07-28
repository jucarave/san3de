function Billboard(/*Vec2*/ position, /*String*/ textureCode, /*Array*/ params, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.imgIndex = 0;
	this.imgSpd = 0;
	this.imgNum = 0;
	this.visible = (textureCode != "none");
	this.actionType = null;
	this.inMap = true;
	
	this.params = null;
	this.toggleImg = null;
	this.toggleImgInd = 0;
	this.unlock = null;
	
	this.parseParams(params);
};

Billboard.prototype.parseParams = function(params){
	this.actionType = [];
	if (params && params.length > 0) for (var i=0,len=params.length;i<len;i++){
		var p = params[i].trim();
		if (p.indexOf("iN") == 0){ // Image Number (Allow animation)
			p = p.replace("iN", "");
			this.imgSpd = 1 / 3;
			this.imgNum = parseInt(p);
			this.imgIndex = Math.iRandom(this.imgNum);
		}else if (p == "iS0"){ // Image speed 0
			this.imgIndex = 0;
			this.imgSpd = 0;
		}else if (p == "vH"){ // Visibility hidden
			this.visible = false;
		}else if (p == "tV"){ // Toggle visibility on action
			this.actionType.push(p);
		}else if (p.indexOf("tI") == 0){ // Move between frames
			p = p.replace("tI", "");
			
			this.actionType.push("tI");
			this.toggleImg = new Uint8ClampedArray(p.split("_"));
		}else if (p.indexOf("cW_") == 0){ // Change Wall
			this.params = p.replace("cW_", "").split("_");
			for (var j=0;j<this.params.length;j++){
				this.params[j] = parseInt(this.params[j], 10);
			}
			
			this.actionType.push("cW");
		}else if (p.indexOf("uD_") == 0){ // Unlock Door
			var par = p.replace("uD_", "").split("_");
			for (var j=0;j<par.length;j++){
				par[j] = parseInt(par[j], 10);
			}
			
			this.unlock = vec2(par[0],par[1]);
			this.actionType.push("uD");
		}else if (p == "del"){ // Delete instance after action
			this.actionType.push("del");
		}
	}
};

Billboard.prototype.isSolid = function(){
	var tex = this.textureCode;
	if (this.imgNum > 0)
		tex += (this.imgIndex << 0);
	return this.mapManager.isTextureSolid(tex);
};

Billboard.prototype.active = function(){
	if (this.actionType == null) return;

	for (var i=0,len=this.actionType.length;i<len;i++){
		var at = this.actionType[i];
		if (at == "tV"){ this.visible = !this.visible; }else 
		if (at == "tI"){
			if (++this.toggleImgInd == this.toggleImg.length) this.toggleImgInd = 0;
			this.imgIndex = this.toggleImg[this.toggleImgInd];
		}else if (at == "cW"){
			this.mapManager.changeWall(this.params[0], this.params[1], this.params[2]);
		}else if (at == "uD"){
			var door = this.mapManager.getInstanceAt(this.unlock.a, this.unlock.b);
			if (door && door.locked){ door.locked = null; }
		}else if (at == "del"){
			this.inMap = false;
		}
	}
};

Billboard.prototype.getTexture = function(){
	var tex = this.textureCode;
	if (this.imgNum > 0)
		tex += (this.imgIndex << 0);
	return {texCode: tex, xScale: 1};
};

Billboard.prototype.loop = function(){
	if (this.visible && this.imgSpd > 0 && this.imgNum > 0){
		this.imgIndex += this.imgSpd;
		if (this.imgIndex >= this.imgNum) this.imgIndex = 0;
	}
};
