function Player(position, direction, mapManager){
	this.position = position;
	this.direction = Math.degToRad(direction);
	this.mapManager = mapManager;
		
	this.rotationSpd = Math.PI;
	this.movementSpd = 6;
	
	this.canMove = true;
}

Player.prototype.moveTo = function(xTo, yTo){
	var spd = this.movementSpd * 2;
	var xx = Math.floor(this.position.a + xTo * spd);
	var yy = Math.floor(this.position.b);
	
	if (!this.mapManager.isSolid(xx, yy)){
		var ins = this.mapManager.getInstanceAt(xx, yy);
		if (!ins || !ins.solid)
			this.position.a += xTo * this.movementSpd;
	}
	
	xx = Math.floor(this.position.a);
	yy = Math.floor(this.position.b + yTo * spd);
	if (!this.mapManager.isSolid(xx, yy)){
		var ins = this.mapManager.getInstanceAt(xx, yy);
		if (!ins || !ins.solid)
			this.position.b += yTo * this.movementSpd;
	}
};

Player.prototype.movement = function(deltaT){
	var game = this.mapManager.game;
	
	var xTo = 0, yTo = 0;
	if (game.keys[87] == 1){
		xTo = Math.cos(this.direction);
		yTo = -Math.sin(this.direction);
	}else if (game.keys[83] == 1){
		xTo = -Math.cos(this.direction);
		yTo = Math.sin(this.direction); 
	}else if (game.keys[65] == 1){
		xTo = Math.cos(this.direction + Math.PI_2);
		yTo = -Math.sin(this.direction + Math.PI_2); 
	}else if (game.keys[68] == 1){
		xTo = -Math.cos(this.direction + Math.PI_2);
		yTo = Math.sin(this.direction + Math.PI_2); 
	}
	
	if (xTo != 0 || yTo != 0){
		this.moveTo(xTo * deltaT, yTo * deltaT);
	}
};

Player.prototype.rotation = function(deltaT){
	var game = this.mapManager.game;
	
	if (game.keys[81] == 1){
		this.direction += this.rotationSpd * deltaT;
		this.direction = (this.direction + Math.PI2) % Math.PI2;
	}else if (game.keys[69] == 1){
		this.direction -= this.rotationSpd * deltaT;
		this.direction = (this.direction + Math.PI2) % Math.PI2;
	}
};

Player.prototype.checkInstance = function(){
	var game = this.mapManager.game;
	
	if (game.getKeyPressed(13)){
		var xTo = (this.position.a + Math.cos(this.direction)) << 0;
		var yTo = (this.position.b - Math.sin(this.direction)) << 0;
		
		var ins = this.mapManager.getInstanceAt(xTo, yTo);
		if (ins != null && ins.active){
			ins.active();
		}
	}
};

Player.prototype.step = function(deltaT){
	if (!this.canMove) return;
	
	this.rotation(deltaT);
	this.movement(deltaT);
	this.checkInstance();
	
	if (this.mapManager.isOnTrap(this.position)){
		this.canMove = false;
	}
};

Player.prototype.loop = function(deltaT){
	this.step(deltaT);
};
