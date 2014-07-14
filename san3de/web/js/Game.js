function Game(){
	this.eng = new Engine(vec2(480,320), Utils.get("divGame"));
	this.console = new Console(10, '10px "Courier"', this);
	this.render = new RaycastRender(this.eng.getData(vec2(480,320)), 60, 420, this);
	this.renderPos = vec2(0,0);
	
	this.map = null;
	this.fps = Math.floor(1000 / 30);
	
	// Debug variables for showing the FPS count
	this.numberFrames = 0;
	this.firstFrame = Date.now();
	
	this.textures = {};
	this.billboards = {};
	this.keys = [];
	
	this.lastT = 0;
	
	var game = this;
	this.eng.loadKTD("texBillboards.ktd", false, function(data){ game.parseBillboards(data); });
	this.eng.loadKTD("testMap.ktd", true, function(data){ game.parseMap(data); });
	
	this.console.addMessage("Welcome to SAN3DE Alpha test!", "unique", "white");
	this.console.addMessage("Press WASD to move, QE to turn around", "unique", "white");
	this.console.addMessage("Press Enter to interact with doors and objects", "unique", "white");
	this.console.addMessage("Have fun!", "unique", "yellow");
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

Game.prototype.parseBillboards = function(data){
	this.billboards = data.textures;
	Colors.billboards = data.colors;
};

Game.prototype.parseMap = function(data){
	var game = this;
	game.textures = data.textures;
	game.map = new MapManager(game, data.map, data.player);
	game.map.createInstances(data.instances);
	
	Colors.textures = data.colors;
	Colors.texturesShadow = data.colorsS;
};

Game.prototype.getTexture = function(texId){
	if (texId == 0 || texId === undefined) return null;
	
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
		game.loopGame(deltaT);
	}else{
		setTimeout(function(){ game.newGame(deltaT); }, game.fps);
	}
};

Game.prototype.drawFPS = function(now){
	var fps = Math.floor((++this.numberFrames) / ((now - this.firstFrame) / 1000));
	var ctx = this.getCtx();
	ctx.fillStyle = "white";
	ctx.fillText("FPS: " + fps + "/30", 16, 16);
};

Game.prototype.loopGame = function(deltaT){
	var game = this;
	
	var now = Date.now();
	var dT = (now - game.lastT);
	
	if (dT > this.fps){
		game.lastT = now - (dT % this.fps);
		
		if (game.map){
			game.render.raycast(game.map);
			game.render.fall();
		
			game.map.loop();
			game.render.draw(game.getCtx(), game.renderPos);
		}
		
		this.console.render(8, 312);
		
		//Debug: Draw the FPS count
		this.drawFPS(now);
	}
	
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
	
	// Debug function to keep right the fps count
	Utils.addEvent(window, "focus", function(){
		game.firstFrame = Date.now();
		game.numberFrames = 0;
	});
});
