function Door(position, direction, texture, params, mapManager){
	this.position = position;
	this.direction = direction;
	this.mapManager = mapManager;
	this.texture = texture;
	
	this.solid = true;
	this.imageIndex = 0;
	this.imgSpeed = 1/2;
	this.opening = 0;
	
	this.locked = null;
	
	this.parseParams(params);
}

Door.prototype.parseParams = function(params){
	for (var i=0,len=params.length;i<len;i++){
		var p = params[i];
		if (p.indexOf("L_") == 0){ this.locked = p.replace("L_", ""); }
	}
};

Door.prototype.getTexture = function(){
	var img = Math.floor(this.imageIndex) + "";
	return this.texture + img;
};

Door.prototype.isSolid = function(){
	return this.solid;
};

Door.prototype.active = function(){
	if (this.opening != 0) return;
	
	if (this.locked != null){
		var key = this.mapManager.getInventoryItem(this.locked);
		
		if (key){
			this.mapManager.logMessage("Unlocked using the " + key.name, "locked_" + this.locked, "aqua");
			this.mapManager.removeFromInventory(this.locked, 1);
			this.locked = null;
		}else{
			this.mapManager.logMessage("The door is locked!", "locked_" + this.locked, "yellow");
			return;
		}
	}
	
	if (this.imageIndex == 0){
		this.opening = 1;
	}else{
		this.opening = 2;
		this.solid = true;
	}
};

Door.prototype.loop = function(){
	if (this.opening == 1){
		this.imageIndex += this.imgSpeed;
		if (this.imageIndex >= 3){
			this.opening = 0;
			this.solid = false;
			this.imageIndex = 2;
		}
	}else if (this.opening == 2){
		this.imageIndex -= this.imgSpeed;
		if (this.imageIndex <= 0){
			this.opening = 0;
			this.imageIndex = 0;
		}
	}
};
