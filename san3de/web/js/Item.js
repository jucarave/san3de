function Item(/*Vec2*/ position, /*String*/ textureCode, /*Array*/ params, /*MapManager*/ mapManager){
	this.position = position;
	this.textureCode = textureCode;
	this.mapManager = mapManager;
	
	this.imgIndex = 0;
	this.imgSpd = 0;
	this.imgNum = 0;
	this.visible = (textureCode != "none");
	
	this.amount = 0;
	this.item = null;
	
	this.inMap = true;
	
	this.parseParams(params);
}

Item.prototype.parseParams = function(/*Array*/ params){
	for (var i=0,len=params.length;i<len;i++){
		var p = params[i];
		
		if (p.indexOf("aM") == 0){
			this.amount = parseInt(p.replace("aM", ""), 10);
		}else if (p.indexOf("iF") == 0){
			var itemCode = p.replace("iF", "");
			this.item = ItemFactory.getItem(itemCode);
		}
	}
};

Item.prototype.active = function(){
	if (!this.inMap) return;
	
	this.mapManager.addItem(this.item, this.amount);
	this.inMap = false;
};

Item.prototype.isSolid = function(){
	var tex = this.textureCode;
	if (this.imgNum > 0)
		tex += (this.imgIndex << 0);
	return this.mapManager.isTextureSolid(tex);
};

Item.prototype.getTexture = function(){
	var tex = this.textureCode;
	
	if (this.imgNum > 0)
		tex += (this.imgIndex << 0);
	return {texCode: tex, xScale: 1};
};

Item.prototype.loop = function(){
	if (this.visible && this.imgSpd > 0 && this.imgNum > 0){
		this.imgIndex += this.imgSpd;
		if (this.imgIndex >= this.imgNum) this.imgIndex = 0;
	}
};