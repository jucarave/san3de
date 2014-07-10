function MapManager(game){
	this.game = game;
	this.player = null;
	
	this.instances = [];
	this.doors = [];
	this.map = this.getMap();
}

MapManager.prototype.isSolid = function(x, y){
	if (!this.map[y]) return false;
	var t = this.map[y][x];
	
	var tex = this.game.getTexture(t);
	if (!tex) return false;
	return tex.solid;
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

MapManager.prototype.getMap = function(){
	var map = [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,2,2,2,2,0,0,0,0,0,2,2,1],
		[1,0,2,0,0,2,0,0,0,0,0,0,0,1],
		[1,0,2,2,2,2,0,0,0,0,0,2,2,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,2,0,2,1],
		[1,0,0,0,0,0,0,0,0,0,2,0,0,1],
		[1,0,2,0,2,0,0,0,0,0,2,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	];
	
	for (var i=0,len=map.length;i<len;i++)
		map[i] = new Uint8ClampedArray(map[i]);
	
	this.player = new Player(vec2(1.5,1.5), 0, this);
	
	this.instances.push(new Billboard(vec2(5.5,6.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(6.5,6.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(7.5,6.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(8.5,6.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(5.5,7.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(6.5,7.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(7.5,7.5), "texLamp", this));
	this.instances.push(new Billboard(vec2(8.5,7.5), "texLamp", this));
	
	this.doors.push(new Door(vec2(11.5,8.5), "H", "texDoor", this));
	this.doors.push(new Door(vec2(11.5,3.5), "V", "texDoor", this));
	
	this.instances.push(new Enemy(vec2(7.5,9.5), "texEnemy", this));
	
	var ene2 = new Enemy(vec2(6.5,9.5), "texEnemy", this);
	ene2.rotate = true;
	this.instances.push(ene2);
	
	return map;
};

MapManager.prototype.loop = function(deltaT){
	if (isNaN(deltaT)) return;
	this.game.render.raycast(this);
	
	this.player.loop(deltaT);
	
	for (var i=0,len=this.instances.length;i<len;i++){
		var ins = this.instances[i];
		if (ins.loop) ins.loop(deltaT);
	}
	
	for (var i=0,len=this.doors.length;i<len;i++){
		var ins = this.doors[i];
		if (ins.loop) ins.loop(deltaT);
	}
};
