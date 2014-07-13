function MapManager(game, map, player){
	this.game = game;
	this.player = null;
	
	this.instances = [];
	this.doors = [];
	this.traps = [];
	this.map = map;
	this.player = new Player(vec2(player.x + 0.5, player.y + 0.5), player.d, this);
}

MapManager.prototype.isSolid = function(x, y){
	if (!this.map[y]) return false;
	var t = this.map[y][x];
	
	var tex = this.game.getTexture(t);
	if (!tex) return false;
	return tex.solid;
};

MapManager.prototype.isOnTrap = function(position){
	var x = (position.a << 0);
	var y = (position.b << 0);
	
	for (var i=0,len=this.traps.length;i<len;i++){
		if (this.traps[i].position.equals(x, y)){
			this.game.render.falling = true;
			return true;
		}
	}
};

MapManager.prototype.isTextureSolid = function(textureCode){
	var tex = this.game.textures[textureCode];
	if (tex == null)
		tex = this.game.billboards[textureCode];
		
	if (tex && tex.solid){
		return true;
	}
	return false;
};

MapManager.prototype.getInstanceAt = function(x, y){
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if ((ins.position.a << 0) == x && (ins.position.b << 0) == y)
			return ins;
	}
	
	return null;
};

MapManager.prototype.createInstances = function(instances){
	for (var i=0,len=instances.length;i<len;i++){
		var ins = instances[i];
		var type = parseInt(ins[0]);
		var x = parseInt(ins[1]);
		var y = parseInt(ins[2]);
		var vec = vec2(x + 0.5, y + 0.5);
		
		if (type == 0){ this.instances.push(new Billboard(vec, ins[3], ins.splice(4), this)); }
		else if (type == 1){ this.doors.push(new Door(vec, ins[4], ins[3], this)); }
		else if (type == 2){ this.instances.push(new Enemy(vec, parseInt(ins[3]), ins[4], this)); }
		else if (type == 3){ this.traps.push({position: vec2(x, y)}); }
	}
};

MapManager.prototype.loop = function(){
	this.player.loop();
	
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (ins.loop) ins.loop();
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if (ins.loop) ins.loop();
	}
};
