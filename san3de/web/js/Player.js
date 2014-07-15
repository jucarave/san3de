/*===================================================
	This class controls the player actions during
	the in-game, it handles the movement, rotation
	and interaction with the world.
===================================================*/
function Player(/*Vec2*/ position, /*float*/ direction, /*MapManager*/ mapManager){
	this.position = position;
	this.direction = Math.degToRad(direction);
	this.mapManager = mapManager;
		
	// I should put this in a different place for configuration
	this.rotationSpd = Math.degToRad(5);
	this.movementSpd = 0.3;
	
	// When something special is happening like falling through a trap, the player won't move
	this.canMove = true;
}

/*===================================================
	Move the player to a specific position only
	if there is no a wall or a solid instance
	there
===================================================*/
Player.prototype.moveTo = function(/*float*/ xTo, /*float*/ yTo){
	var spd = this.movementSpd * 2;
	var xx = (this.position.a + xTo * spd) << 0;
	var yy = (this.position.b) << 0;
	
	// Check if there is a solid wall at the position
	if (!this.mapManager.isSolid(xx, yy)){
		var ins = this.mapManager.getInstanceAt(xx, yy);
		if (!ins || !ins.isSolid())
			this.position.a += xTo * this.movementSpd;
	}
	
	// Check if there is an instance at the position
	xx = (this.position.a) << 0;
	yy = (this.position.b + yTo * spd) << 0;
	if (!this.mapManager.isSolid(xx, yy)){
		var ins = this.mapManager.getInstanceAt(xx, yy);
		if (!ins || !ins.isSolid())
			this.position.b += yTo * this.movementSpd;
	}
};

/*===================================================
	This function controls the movement input
===================================================*/
Player.prototype.movement = function(){
	var game = this.mapManager.game;
	
	var xTo = 0, yTo = 0;
	if (game.keys[87] == 1){ // W
		xTo = Math.cos(this.direction);
		yTo = -Math.sin(this.direction);
	}else if (game.keys[83] == 1){ // S
		xTo = -Math.cos(this.direction);
		yTo = Math.sin(this.direction); 
	}
	
	if (game.keys[65] == 1){ // A
		xTo = Math.cos(this.direction + Math.PI_2);
		yTo = -Math.sin(this.direction + Math.PI_2); 
	}else if (game.keys[68] == 1){ // D
		xTo = -Math.cos(this.direction + Math.PI_2);
		yTo = Math.sin(this.direction + Math.PI_2); 
	}
	
	// If the player press any key then attempt to move the player to that position
	if (xTo != 0 || yTo != 0){
		this.moveTo(xTo, yTo);
	}
};

/*===================================================
	This method controls the input for the rotation
===================================================*/
Player.prototype.rotation = function(){
	var game = this.mapManager.game;
	
	if (game.keys[81] == 1){ // Q
		this.direction += this.rotationSpd;
		this.direction = (this.direction + Math.PI2) % Math.PI2;
	}else if (game.keys[69] == 1){ // E
		this.direction -= this.rotationSpd;
		this.direction = (this.direction + Math.PI2) % Math.PI2;
	}
};

/*===================================================
	This method controls the action button and
	executes an action to the object in front
	of the player
===================================================*/
Player.prototype.checkInstance = function(){
	var game = this.mapManager.game;
	
	if (game.getKeyPressed(13)){
		var xTo = (this.position.a + Math.cos(this.direction) * 0.9) << 0;
		var yTo = (this.position.b - Math.sin(this.direction) * 0.9) << 0;
		
		var ins = this.mapManager.getInstanceAt(xTo, yTo);
		if (ins != null && ins.active){
			ins.active();
		}
	}
};

/*===================================================
	Simple method that calls all the other
	control methods
===================================================*/
Player.prototype.step = function(){
	if (!this.canMove) return;
	
	this.rotation();
	this.movement();
	this.checkInstance();
};

/*===================================================
	This is the entry of the player instance.
===================================================*/
Player.prototype.loop = function(){
	this.step();
	
	// If the player is on a trap, then stop doing anything
	if (this.mapManager.isOnTrap(this.position)){
		this.canMove = false;
	}
};
