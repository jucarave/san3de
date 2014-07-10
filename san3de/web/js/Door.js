function Door(position, direction, texture, mapManager){
	this.position = position;
	this.direction = direction;
	this.mapManager = mapManager;
	this.texture = texture;
	
	this.solid = true;
	this.imageIndex = 0;
	this.imgSpeed = 3;
	this.opening = 0;
}

Door.prototype.getTexture = function(){
	var img = Math.floor(this.imageIndex) + "";
	return this.texture + img;
};

Door.prototype.active = function(){
	if (this.opening != 0) return;
	
	if (this.imageIndex == 0){
		this.opening = 1;
	}else{
		this.opening = 2;
	}
};

Door.prototype.loop = function(deltaT){
	if (this.opening == 1){
		this.imageIndex += this.imgSpeed * deltaT;
		if (this.imageIndex >= 3){
			this.opening = 0;
			this.solid = false;
			this.imageIndex = 2;
		}
	}else if (this.opening == 2){
		this.imageIndex -= this.imgSpeed * deltaT;
		if (this.imageIndex <= 0){
			this.opening = 0;
			this.solid = true;
			this.imageIndex = 0;
		}
	}
};