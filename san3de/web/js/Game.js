/*===================================================
				SAN3DE Source Code
				
			By Camilo Ramírez (Jucarave)
			
					  2014
===================================================*/

/*===================================================
	Main class of the game, manage all the textures
	and constant instances of the game.
===================================================*/
function Game(){
	// Constant classes that are working during the execution of the game
	this.gameSize = vec2(480,320);
	this.eng = new Engine(this.gameSize, Utils.get("divGame"));
	this.console = new Console(10, '10px "Courier"', this);
	this.render = new RaycastRender(this.eng.getData(this.gameSize), 60, 420, this);
	this.render.setFog(1, 10);
	this.renderPos = vec2(0,0);
	
	this.map = null;						// Current Map the player is in
	this.fps = Math.floor(1000 / 30);		// Base speed the game runs
	
	// Debug variables for showing the FPS count
	this.numberFrames = 0;					// Number of frames renderer since the window got active
	this.firstFrame = Date.now();			// The time when the window got active
	
	this.textures = {};						// Wall and Door textures (This should change per map)
	this.billboards = {};					// Objects, Enemies and Misc textures (This shouldn't change so often)
	this.keys = new Uint8ClampedArray(255);	// Handle all the keyboard keys status
	
	this.lastT = 0;							// Last time a frame was render
	
	this.inventory = [];					// General inventory for all the game
	
	// Load the map data (this should be somewhere else when the map is actually loaded)
	var game = this;
	this.eng.loadKTD("texBillboards.ktd", false, function(data){ game.parseBillboards(data); });
	this.eng.loadKTD("testMap.ktd", true, function(data){ game.parseMap(data); });
	
	// Shows a welcome message with the game instructions.
	this.console.addMessage("Welcome to SAN3DE Alpha test!", "unique", "white");
	this.console.addMessage("Press WASD to move, QE to turn around", "unique", "white");
	this.console.addMessage("Press Enter to interact with doors and objects", "unique", "white");
	this.console.addMessage("Have fun!", "unique", "yellow");
}

/*===================================================
	Starts a new game, reseating all the game 
	variables to their start status.
===================================================*/
Game.prototype.newGame = function(/*float*/ deltaT){
	var game = this;
	if (game.textures.indexes && game.billboards.indexes){
		// If all the data is loaded then start the main loop.
		game.loopGame(deltaT);
	}else{
		// Keep looping this function until all the texture data are ready.
		setTimeout(function(){ game.newGame(deltaT); }, game.fps);
	}
};

/*===================================================
	Return the Context element of the main canvas
===================================================*/
Game.prototype.getCtx = function(){
	return this.eng.ctx;
};

/*===================================================
	Check if a key was pressed and set it status
	to 2 to avoid multiple key binding
===================================================*/
Game.prototype.getKeyPressed = function(/*Int*/ keyCode){
	if (this.keys[keyCode] == 1){
		this.keys[keyCode] = 2;
		return true;
	}
	
	return false;
};

/*===================================================
	Callback function for the billboards, simply
	store the texture and colours data. 
===================================================*/
Game.prototype.parseBillboards = function(/*Object*/ data){
	this.billboards = data.textures;
	Colors.billboards = data.colors;
};

/*===================================================
	Callback function for the map data, creates
	a new map, store the colours and create the 
	instances.
===================================================*/
Game.prototype.parseMap = function(/*Object*/ data){
	var game = this;
	game.textures = data.textures;
	game.map = new MapManager(game, data.map, data.player);
	game.map.createInstances(data.instances);
	
	Colors.textures = data.colors;
	Colors.texturesShadow = data.colorsS;
};

/*===================================================
	Get a texture by its index, the indexes are
	assigned in ascendant order starting in 1 by 
	reading the file data.
===================================================*/
Game.prototype.getTexture = function(/*Int*/ texId){
	if (texId == 0 || texId === undefined) return null;
	
	var ind = this.textures.indexes[texId];
	// If the texture doesn't exists then throw an error
	if (!ind) throw "Invalid Texture Index " + texId + "!";
	if (!this.textures[ind]) throw "Invalid Texture Index " + texId + "!";
	
	return this.textures[ind];
};

/*===================================================
	Gets a billboard, enemy or item texture by
	its code, the code are assigned in the file
	data.
===================================================*/
Game.prototype.getBillboard = function(/*String*/ texCode){
	// If the texture doesn't exists, then throw an error
	if (!this.billboards[texCode]) throw "Invalid Billboard Code " + texCode + "!";
	return this.billboards[texCode];
};

/*===================================================
	Draws a FPS counter by getting the relation
	between the number of frames played and the
	played time.
===================================================*/
Game.prototype.drawFPS = function(/*float*/ now){
	var fps = Math.floor((++this.numberFrames) / ((now - this.firstFrame) / 1000));
	var ctx = this.getCtx();
	ctx.fillStyle = "white";
	ctx.fillText("FPS: " + fps + "/30", 16, 16);
};

/*===================================================
	This is a placeholder function, it draws
	the name of all the current items
===================================================*/
Game.prototype.drawInventory = function(){
	var ctx = this.getCtx();
	
	ctx.fillStyle = "white";
	ctx.textAlign = "right";
	ctx.font = '10px "Courier"';
	
	for (var i=0,len=this.inventory.length;i<len;i++){
		var item = this.inventory[i];
		ctx.fillText(item.name, ctx.width - 16, 16 + (i * 10));
	}
	
	ctx.textAlign = "left";
};

/*===================================================
	Main loop of the game, executes the map and
	draw all the interface objects like the console.
===================================================*/
Game.prototype.loopGame = function(/*float*/ deltaT){
	var game = this;
	
	var now = Date.now();
	var dT = (now - game.lastT);
	
	// Limit the game to the base speed of the game
	if (dT > this.fps){
		game.lastT = now - (dT % this.fps);
		
		// If there is a map being played execute it.
		if (game.map){
			game.render.raycast(game.map);
			game.render.fall();
		
			game.map.loop();
			game.render.draw(game.getCtx(), game.renderPos);
			
			this.console.render(8, 312);
			this.drawInventory();
		}
		
		// Debug: Draw the FPS count
		this.drawFPS(now);
	}
	
	// Call for another loop of this function
	requestAnimFrame(function(deltaT){ game.loopGame(deltaT); });
};

/*===================================================
	Main function of the game, this is where the
	program starts, creates a new Game instance
	and bind all the key holders.
===================================================*/
Utils.addEvent(window, "load", function(){
	var game = new Game();
	
	game.newGame();
	
	// Key binding when the player press a key
	Utils.addEvent(document, "keydown", function(e){
		if (window.event) e = window.event;
		
		// If the status of the key is 2, then this key can't be read until the player released it.
		if (game.keys[e.keyCode] == 2) return;
		
		game.keys[e.keyCode] = 1;
	});
	
	// Key binding when the player releases a key
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
