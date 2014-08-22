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
	this.gameSize = vec2(320,200);
	this.eng = new Engine(this.gameSize, Utils.get("divGame"));
	this.font = '10px "Arial"';
	this.console = new Console(10, 5, this);
	this.render = new RaycastRender(this.eng.getData(vec2(208,127)), 60, 180, this);
	this.render.setFog(1, 10);
	this.renderPos = vec2(16,17);
	
	this.canvasPos = vec2(this.eng.canvas.offsetLeft, this.eng.canvas.offsetTop);
	this.scale = this.eng.canvas.offsetHeight / 200;
	
	this.map = null;						// Current Map the player is in
	this.scene = null;						// Scene to render
	this.fps = Math.floor(1000 / 30);		// Base speed the game runs
	
	// Debug variables for showing the FPS count
	this.numberFrames = 0;					// Number of frames renderer since the window got active
	this.firstFrame = Date.now();			// The time when the window got active
	
	this.textures = {};						// Wall and Door textures (This should change per map)
	this.billboards = {};					// Objects, Enemies and Misc textures (This shouldn't change so often)
	this.keys = new Uint8ClampedArray(255);	// Handle all the keyboard keys status
	this.cursorPos = vec2(-1, -1);			// Position of the cursor
	this.mouseB = 0;						// Is the mouse pressed
	
	this.lastT = 0;							// Last time a frame was render
	
	this.inventory = [];					// General inventory for all the game
	
	this.images = {};						// Non "3D" Images used in the game
	this.audios = {};						// All the audios from the game
	
	// Load the map data (this should be somewhere else when the map is actually loaded)
	var game = this;
	this.loadImages();
	this.loadAudios();
	this.eng.loadKTD("kramBillboards.ktd", false, function(data){ game.parseBillboards(data); });
}

/*===================================================
	Stops all the songs that may be playing right
	now (it shouldn't be more than one)
===================================================*/
Game.prototype.stopAllMusic = function(){
	for (var i in this.audios){
		var aud = this.audios[i];
		if (aud.isMusic && aud.source){
			aud.stop();
			aud.source = null;
		}
	}
};

/*===================================================
	PLays a background music while shutting the
	other songs
===================================================*/
Game.prototype.playMusic = function(audioCode){
	var audio = this.audios[audioCode];
	if (!audio) return;
	
	this.stopAllMusic();
	this.eng.playSound(audio, true, true);
};

/*===================================================
	Loads all the audios that are going to be
	used in the game
===================================================*/
Game.prototype.loadAudios = function(){
	this.audios.descent = this.eng.loadAudio("ogg/descent.ogg", true);
};

/*===================================================
	Loads all the interface and non 3D images
	used during the game
===================================================*/
Game.prototype.loadImages = function(){
	this.images.titleS = this.eng.loadImage("img/titleScreen.png");
	this.images.viewport = this.eng.loadImage("img/viewport.png");
	this.images.scrollFont = this.eng.loadImage("img/scrollFont.png");
};

Game.prototype.printGreet = function(){
	// Shows a welcome message with the game instructions.
	this.console.addSFMessage("WELCOME TO SAN3DE ALPHA TEST!");
	this.console.addSFMessage("PRESS WASD TO MOVE, QE TO TURN AROUND");
	this.console.addSFMessage("1/3 TO LOOK UP/DOWN, 2 TO RESTORE");
	this.console.addSFMessage("CLICK TO INTERACT WITH OBJECTS");
	this.console.addSFMessage("HAVE FUN!");
};

/*===================================================
	Starts a new game, reseating all the game 
	variables to their start status.
===================================================*/
Game.prototype.newGame = function(/*float*/ deltaT){
	var game = this;
	if (game.eng.areImagesReady()){
		game.console.createSpriteFont(game.images.scrollFont, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!,/", 6);
		game.printGreet();
		
		// If all the data is loaded then start the main loop.
		game.scene = new TitleScreen(game);
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
	Check if the left button of the mouse was
	pressed
===================================================*/
Game.prototype.getMouseButtonPressed = function(){
	if (this.mouseB == 1){
		this.mouseB = 2;
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
	game.map.floor = data.floor;
	game.map.ceil = data.ceil;
	game.map.height = data.height;
	
	Colors.textures = data.colors;
	Colors.texturesShadow = data.colorsS;
};

/*===================================================
	Loads a new map
===================================================*/
Game.prototype.loadMap = function(/*String*/ mapId){
	var game = this;
	this.eng.loadKTD(mapId, true, function(data){ game.parseMap(data); });
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
	Gets a texture by its code
===================================================*/
Game.prototype.getTextureIdByCode = function(/*String*/ texCode){
	return this.textures.indexes.indexOf(texCode);
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
	ctx.font = this.font;
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
		var am = (item.amount)? " x" + item.amount : "";
		ctx.fillText(item.name + am, ctx.width - 16, 16 + (i * 10));
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
		
		if (game.scene){ // If there is a scene being played
			game.scene.loop();
		}else if (game.map){ // If there is a map being played execute it.
			game.render.raycast(game.map);
		
			game.map.loop();
			game.render.draw(game.getCtx(), game.renderPos);
			
			/*this.drawInventory();*/
			
			var ctx = game.getCtx();
			ctx.drawImage(game.images.viewport, 0, 0);
			
			game.console.render(17, 170);
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
	var canvas = game.eng.canvas;
	
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
	
	Utils.addEvent(canvas, "mousedown", function(e){
		if (window.event) e = window.event;
		
		var x = (e.clientX - game.canvasPos.a) / game.scale;
		var y = (e.clientY - game.canvasPos.b) / game.scale;
		
		if (game.mouseB == 2) return;
		
		game.cursorPos.set(x,y);
		game.mouseB = 1;
	});
	
	Utils.addEvent(document, "mousemove", function(e){
		if (window.event) e = window.event;
		
		var x = (e.clientX - game.canvasPos.a) / game.scale;
		var y = (e.clientY - game.canvasPos.b) / game.scale;
		
		game.cursorPos.set(x,y);
	});
	
	Utils.addEvent(document, "mouseup", function(e){
		if (window.event) e = window.event;
		game.mouseB = 0;
	});
	
	// Debug function to keep right the fps count
	Utils.addEvent(window, "focus", function(){
		game.firstFrame = Date.now();
		game.numberFrames = 0;
	});
});
