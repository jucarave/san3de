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
	this.movementSpd = 0.1;
	
	// When something special is happening like falling through a trap, the player won't move
	this.canMove = true;
	
	this.z = 32;
	this.targetZ = 32;
	this.jogZ = vec2(0,0);
}

/*===================================================
	Make the effect that the player is walking
	and no skating on the dungeon
===================================================*/
Player.prototype.jog = function(){
	var dir = (this.jogZ.b == 0)? 1 : -1;
	var maxJog = (this.z == 10)? 2 : 1.5;
	var jogSpd = (this.z == 10)? 0.4 : 0.25;
	
	this.jogZ.a += jogSpd * dir;
	if (this.jogZ.a >= maxJog) this.jogZ.set(maxJog,1); else
	if (this.jogZ.a <= -maxJog) this.jogZ.set(-maxJog,0);
};

/*===================================================
	Move the player to a specific position only
	if there is no a wall or a solid instance
	there
===================================================*/
Player.prototype.moveTo = function(/*float*/ xTo, /*float*/ yTo, /*Boolean*/ sliding){
	var spd = this.movementSpd * 2;
	var xx = (this.position.a + xTo * spd);
	var yy = (this.position.b);
	
	var xxx = (xx) << 0;
	var yyy = (yy) << 0;
	
	var pd = (this.z == 10)? 3 : 1;
	if (sliding) pd *= 2;
	
	// Check if there is a solid wall at the position
	if (!this.mapManager.isSolid(xxx, yyy)){
		var ins = this.mapManager.getInstanceAt(xxx, yyy);
		if (!ins || !ins.isSolid(xx, yy))
			this.position.a += xTo * (this.movementSpd / pd);
	}
	
	// Check if there is an instance at the position
	xx = (this.position.a);
	yy = (this.position.b + yTo * spd);
	
	xxx = (xx) << 0;
	yyy = (yy) << 0;
	
	if (!this.mapManager.isSolid(xxx, yyy)){
		var ins = this.mapManager.getInstanceAt(xxx, yyy);
		if (!ins || !ins.isSolid(xx, yy))
			this.position.b += yTo * (this.movementSpd / pd);
	}
	
	this.jog();
	if (this.mapManager.checkIfWater(this.position.a << 0, this.position.b << 0)){
		this.targetZ = 10;
	}else{
		this.targetZ = 32;
	}
};

/*===================================================
	This function controls the movement input
===================================================*/
Player.prototype.movement = function(){
	var game = this.mapManager.game;
	
	var xTo = 0, yTo = 0, sliding = false;
	if (game.keys[87] == 1){ // W
		xTo = Math.cos(this.direction);
		yTo = -Math.sin(this.direction);
	}else if (game.keys[83] == 1){ // S
		xTo = -Math.cos(this.direction);
		yTo = Math.sin(this.direction); 
	}
	
	if (game.keys[65] == 1){ // A
		sliding = true;
		xTo = Math.cos(this.direction + Math.PI_2);
		yTo = -Math.sin(this.direction + Math.PI_2); 
	}else if (game.keys[68] == 1){ // D
		sliding = true;
		xTo = -Math.cos(this.direction + Math.PI_2);
		yTo = Math.sin(this.direction + Math.PI_2); 
	}
	
	// If the player press any key then attempt to move the player to that position
	if (xTo != 0 || yTo != 0){
		this.moveTo(xTo, yTo, sliding);
	}else{
		this.jogZ.set(0,0);
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
	}else if (game.getKeyPressed(0)){
		var xTo = (this.position.a + Math.cos(this.direction) * 0.9) << 0;
		var yTo = (this.position.b - Math.sin(this.direction) * 0.9) << 0;
		var ins = this.mapManager.getInstanceAt(xTo, yTo);
		if (ins != null && ins.active && !ins.visible){
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
	Makes the player to go up or down, used
	only in the water tiles
===================================================*/
Player.prototype.changeZValue = function(){
	if (this.targetZ < this.z){
		this.z -= 5;
		if (this.z <= this.targetZ) this.z = this.targetZ;
	}else if (this.targetZ > this.z){
		this.z += 3;
		if (this.z >= this.targetZ) this.z = this.targetZ;
	}
};

/*===================================================
	This is the entry of the player instance.
===================================================*/
Player.prototype.loop = function(){
	this.step();
	
	this.changeZValue();
	
	// If the player is on a trap, then stop doing anything
	if (this.mapManager.isOnTrap(this.position)){
		this.canMove = false;
	}
};
