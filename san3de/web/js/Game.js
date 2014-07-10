function Game(){
	this.eng = new Engine(vec2(480,320), Utils.get("divGame"));
	this.render = new RaycastRender(this.eng.getData(vec2(480,320)), 60, 420, this);
	this.renderPos = vec2(0,0);
	
	this.map = null;
	this.fps = Math.floor(1000 / 30);
	
	this.textures = {};
	this.billboards = {};
	this.keys = [];
	
	this.lastT = 0;
	
	this.loadTextures();
}

Game.prototype.getCtx = function(){
	return this.eng.ctx;
};

Game.prototype.getKeyPressed = function(keyCode){
	if (this.keys[keyCode] == 1){
		this.keys[keyCode] = 2;
		return true;
	}
	
	return false;
};

Game.prototype.loadTextures = function(){
	Colors.ceil = [143,155,77];
	Colors.floor = [115,115,115];
	
	this.eng.loadKTD("E1M1.ktd", this.textures, Colors.textures, Colors.texturesShadow);
	this.eng.loadKTD("texBillboards.ktd", this.billboards, Colors.billboards, null);
};

Game.prototype.getTexture = function(texId){
	if (texId == 0) return null;
	
	var ind = this.textures.indexes[texId];
	if (!ind) throw "Invalid Texture Index " + texId + "!";
	if (!this.textures[ind]) throw "Invalid Texture Index " + texId + "!";
	
	return this.textures[ind];
};

Game.prototype.getBillboard = function(texCode){
	if (!this.billboards[texCode]) throw "Invalid Billboard Code " + texCode + "!";
	return this.billboards[texCode];
};

Game.prototype.newGame = function(deltaT){
	var game = this;
	if (game.textures.indexes && game.billboards.indexes){
		game.map = new MapManager(game);
		game.loopGame(deltaT);
	}else{
		setTimeout(function(){ game.newGame(deltaT); }, game.fps);
	}
};

Game.prototype.loopGame = function(deltaT){
	var game = this;
	
	var dT = 1 / (deltaT - this.lastT);
	this.lastT = deltaT;
	
	game.map.loop(dT);
	game.render.draw(game.getCtx(), this.renderPos);
	
	//setTimeout(function(){ game.loopGame(); }, game.fps);
	requestAnimFrame(function(deltaT){ game.loopGame(deltaT); });
};

Utils.addEvent(window, "load", function(){
	var game = new Game();
	
	game.newGame();
	
	Utils.addEvent(document, "keydown", function(e){
		if (window.event) e = window.event;
		
		if (game.keys[e.keyCode] == 2) return;
		
		game.keys[e.keyCode] = 1;
	});
	
	Utils.addEvent(document, "keyup", function(e){
		if (window.event) e = window.event;
		
		game.keys[e.keyCode] = 0;
	});
});
