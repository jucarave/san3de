/*===================================================
	Class that handles the current map data and
	all the instances located at it.
===================================================*/
function MapManager(/*Game*/ game, /*Array*/ map, /*Object*/ player){
	this.game = game;
	this.player = null;
	
	this.instances = [];
	this.doors = [];
	this.traps = [];
	this.map = map;
	this.floor = null;
	this.ceil = null;
	this.baseHeight = 1;
	this.player = new Player(vec2(player.x + 0.5, player.y + 0.5), player.d, this);
	this.waterTiles = [];
	this.animatedTiles = [];
	
	this.worldFrame = 0;
	this.worldFrameSpeed = 1 / 8;
	
	this.sectorInstances = [];
	this.sectorDoors = [];
}

MapManager.prototype.isAnimated = function(/*Int*/ tileId){
	return (this.animatedTiles.indexOf(tileId) != -1);
};

MapManager.prototype.checkIfWater = function(/*Int*/ x, /*Int*/ y){
	if (!this.floor[y]) return false;
	var t = this.floor[y][x];
	
	if (this.waterTiles.indexOf(t) != -1){
		return true;
	}
	
	return false;
};

/*===================================================
	Returns whenever a tile in the map is solid
	based on its texture.
===================================================*/
MapManager.prototype.isSolid = function(/*Int*/ x, /*Int*/ y){
	if (!this.map[y]) return false;
	var t = this.map[y][x];
	
	var tex = this.game.getTexture(t);
	if (!tex) return false;
	return tex.solid;
};

/*===================================================
	Check if a trap object is at a certain position,
	if so, makes the player to fell through it
===================================================*/
MapManager.prototype.isOnTrap = function(/*Vec2*/ position){
	var x = (position.a << 0);
	var y = (position.b << 0);
	
	for (var i=0,len=this.traps.length;i<len;i++){
		if (this.traps[i].position.equals(x, y)){
			this.game.render.falling = true;
			return true;
		}
	}
};

/*===================================================
	Check if a texture is solid by its code.
===================================================*/
MapManager.prototype.isTextureSolid = function(/*String*/ textureCode){
	var tex = this.game.textures[textureCode];
	// Check if isn't a texture then try to get a billboard
	if (tex == null)
		tex = this.game.billboards[textureCode];
		
	if (tex && tex.solid){
		return true;
	}
	return false;
};

/*===================================================
	Check for instances and doors at a position
===================================================*/
MapManager.prototype.getInstanceAt = function(/*Int*/ x, /*Int*/ y){
	// Look for instances
	for (var i=0,len=this.sectorInstances.length;i<len;i++){
		var ins = this.sectorInstances[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	// Look for doors
	for (var i=0,len=this.sectorDoors.length;i<len;i++){
		var ins = this.sectorDoors[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	return null;
};

/*===================================================
	Logs a new message to the main console of
	the game
===================================================*/
MapManager.prototype.logMessage = function(/*String*/ msg){
	if (!this.game.console) return;
	
	this.game.console.addSFMessage(msg);
};

/*===================================================
	Changes the texture of a wall
===================================================*/
MapManager.prototype.changeWall = function(/*Int*/ x, /*Int*/ y, /*Int*/ texNumber){
	this.map[y][x] = texNumber;
};

/*===================================================
	Attempts to add an item to the inventory
===================================================*/
MapManager.prototype.addItem = function(/*ItemFactory*/ item, /*Int*/ amount){
	var inv = this.game.inventory;
	
	if (item.stackable){
		var added = false;
		for (var i=0,len=inv.length;i<len;i++){
			if (inv[i].itemCode == item.itemCode){
				inv[i].amount += amount;
				added = true;
				i = len;
			}
		}
		
		if (!added){
			var am = (amount > 1)? amount : "a(n)";
			this.logMessage("Picked " + am +" " + item.name);
			item.amount = amount;
			inv.push(item);
		}
	}else{
		for (var i=0;i<amount;i++){
			this.logMessage("Picked a(n) " + item.name);
			inv.push(item);
		}
	}
};

/*===================================================
	Returns an item from the inventory if the
	player has it
===================================================*/
MapManager.prototype.getInventoryItem = function(/*String*/ itemCode){
	var ret = null;
	var inv = this.game.inventory;
	
	for (var i=0,len=inv.length;i<len;i++){
		if (inv[i].itemCode == itemCode){
			ret = inv[i];
			i = len;
		}
	}
	
	return ret;
};

/*===================================================
	Removes a item from the inventory
===================================================*/
MapManager.prototype.removeFromInventory = function(/*String*/ itemCode, /*Int*/ amount){
	var inv = this.game.inventory;
	
	for (var i=0,len=inv.length;i<len;i++){
		if (amount == 0){
			i = len;
		}else if (inv[i].itemCode == itemCode){
			if (inv[i].amount !== undefined && inv[i].amount > amount){
				inv[i].amount -= amount;
			}else{
				inv.splice(i, 1);
				amount--;
			}
		}
	}
};

/*===================================================
	Create the instances, doors and traps of the map 
	based on a List of Array of parameters
	
	List of parameters:
	Argument[0]: Type of instance 
		(0: Billboard, 1: Door, 2: Enemy, 3: Trap, 4: Item)
	Argument[1]: x
	Argument[2]: y
	
	For Billboards:
	Argument[3]: TextureCode
	Argument[4-n]: parameters (actions)
	
	For Doors:
	Argument[3]: TextureCode
	Argument[4]: Direction of the door
	Argument[5-n]: parameters
	
	For Enemies:
	Argument[3]: direction
	Argument[4]: TextureCode
	
	For Items:
	Argument[3]: TextureCode
	Argument[4-n]: parameters
===================================================*/
MapManager.prototype.createInstances = function(/*Array*/ instances){
	for (var i=0,len=instances.length;i<len;i++){
		var ins = instances[i];
		var type = parseInt(ins[0]);
		var x = parseInt(ins[1]);
		var y = parseInt(ins[2]);
		var z = parseInt(ins[3]);
		var vec = vec3(x + 0.5, y + 0.5, z);
		
		if (type == 0){ this.instances.push(new Billboard(vec, ins[4], ins.splice(5), this)); }
		else if (type == 1){ this.doors.push(new Door(vec, ins[5], ins[4], ins.splice(6), this)); }
		else if (type == 2){ 
			var enemyInfo = EnemyFactory.getEnemy(ins[5]);
			var enemy = new Enemy(vec, parseInt(ins[4]), enemyInfo, this);
			this.instances.push(enemy); 
		}
		else if (type == 3){ this.traps.push({position: vec2(x, y)}); }
		else if (type == 4){ this.instances.push(new Item(vec, ins[4], ins.splice(5), this)); }
		else if (type == 5){ this.doors.push(new Door(vec, ins[5], ins[4], ins.splice(6), this)); }
		else if (type == 6){ 
			var tileId = this.game.getTextureIdByCode(ins[4] + "_0"); 
			this.waterTiles.push(tileId); 
			this.animatedTiles.push(tileId);
		}
	}
};

/*===================================================
	Executes the map and all the instances and
	doors.
===================================================*/
MapManager.prototype.loop = function(){
	this.player.loop();
	
	this.sectorInstances = [];
	this.sectorDoors = [];
	
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (ins.loop) ins.loop();
		
		if (!ins.inMap){
			this.instances.splice(i, 1);
			len--;
			i--;
		}else{
			var xx = Math.abs(ins.position.a - this.player.position.a);
			var yy = Math.abs(ins.position.b - this.player.position.b);
			if (xx < 10 && yy < 10)
				this.sectorInstances.push(ins);
		}
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if (ins.loop) ins.loop();
		
		var xx = Math.abs(ins.position.a - this.player.position.a);
		var yy = Math.abs(ins.position.b - this.player.position.b);
		if (xx < 10 && yy < 10)
			this.sectorDoors.push(ins);
	}
	
	this.worldFrame += this.worldFrameSpeed;
	if (this.worldFrame >= 2) this.worldFrame = 0;
};
