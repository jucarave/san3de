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
	this.player = new Player(vec2(player.x + 0.5, player.y + 0.5), player.d, this);
}

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
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	// Look for doors
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	return null;
};

/*===================================================
	Logs a new message to the main console of
	the game
===================================================*/
MapManager.prototype.logMessage = function(/*String*/ msg, /*String*/ type, /*String*/ color){
	if (!this.game.console) return;
	
	this.game.console.addMessage(msg, type, color);
};

/*===================================================
	Attempts to add an item to the inventory
===================================================*/
MapManager.prototype.addItem = function(/*ItemFactory*/ item, /*Int*/ amount){
	var inv = this.game.inventory;
	
	for (var i=0;i<amount;i++){
		this.logMessage("Picked a(n) " + item.name, "pick_" + item.name, "aqua");
		inv.push(item);
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
			inv.splice(i, 1);
			amount--;
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
		var vec = vec2(x + 0.5, y + 0.5);
		
		if (type == 0){ this.instances.push(new Billboard(vec, ins[3], ins.splice(4), this)); }
		else if (type == 1){ this.doors.push(new Door(vec, ins[4], ins[3], ins.splice(5), this)); }
		else if (type == 2){ this.instances.push(new Enemy(vec, parseInt(ins[3]), ins[4], this)); }
		else if (type == 3){ this.traps.push({position: vec2(x, y)}); }
		else if (type == 4){ this.instances.push(new Item(vec, ins[3], ins.splice(4), this)); }
	}
};

/*===================================================
	Executes the map and all the instances and
	doors.
===================================================*/
MapManager.prototype.loop = function(){
	this.player.loop();
	
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (ins.loop) ins.loop();
		
		if (!ins.inMap){
			this.instances.splice(i, 1);
			len--;
			i--;
		}
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if (ins.loop) ins.loop();
	}
};
