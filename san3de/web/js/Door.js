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
	this.openable = true;
	
	this.parseParams(params);
	
	this.leftPos = null;
	this.rightPos = null;
	
	if (direction == "H"){
		this.leftPos = vec2((position.a << 0), position.b);
		this.rightPos = vec2((1 + position.a << 0), position.b);
	}else if (direction == "V"){
		this.leftPos = vec2(position.a, (position.b << 0));
		this.rightPos = vec2(position.a, (1 + position.b << 0));
	}else if (direction == "UR"){
		this.leftPos = vec2((position.a << 0), (position.b << 0));
		this.rightPos = vec2((1 + position.a << 0), (1 + position.b << 0));
	}else if (direction == "DR"){
		this.leftPos = vec2((1 + position.a << 0), (position.b << 0));
		this.rightPos = vec2((position.a << 0), (1 + position.b << 0));
	}else if (direction == "UL"){
		this.leftPos = vec2((position.a << 0), (1 + position.b << 0));
		this.rightPos = vec2((1 + position.a << 0), (position.b << 0));
	}else if (direction == "DL"){
		this.leftPos = vec2((1 + position.a << 0), (1 + position.b << 0));
		this.rightPos = vec2((position.a << 0), (position.b << 0));
	}
}

Door.prototype.parseParams = function(params){
	for (var i=0,len=params.length;i<len;i++){
		var p = params[i];
		if (p.indexOf("L_") == 0){ this.locked = p.replace("L_", ""); }else
		if (p == "nOp"){ this.openable = false; }
	}
};

Door.prototype.getTexture = function(){
	var img = "";
	if (this.openable)
		img = Math.floor(this.imageIndex) + "";
	return this.texture + img;
};

Door.prototype.isSolid = function(){
	return this.solid;
};

Door.prototype.active = function(){
	if (!this.openable) return;
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
		if (this.imageIndex >= 4){
			this.opening = 0;
			this.solid = false;
			this.imageIndex = 3;
		}
	}else if (this.opening == 2){
		this.imageIndex -= this.imgSpeed;
		if (this.imageIndex <= 0){
			this.opening = 0;
			this.imageIndex = 0;
		}
	}
};
