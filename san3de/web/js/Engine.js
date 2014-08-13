/*===================================================
	The engine class handles the canvas, context
	and load data like Images and Map data
===================================================*/
function Engine(/*Vec2*/ size, /*Element*/ container){
	this.canvas = this.createCanvas(size, container);
	this.ctx = this.getCtx(this.canvas);
	this.audioCtx = null;
	if (window.AudioContext)
		this.audioCtx = new AudioContext();
	else
		alert("Your browser doesn't suppor the Audio API");
	
	this.audio = [];
	this.images = [];
}

/*===================================================
	Creates a canvas and appends it to a html
	element object.
===================================================*/
Engine.prototype.createCanvas = function(/*Vec2*/ size, /*Element*/ container){
	var canvas = document.createElement("canvas");
	canvas.width = size.a;
	canvas.height = size.b;
	canvas.style.backgroundColor = "black";
		
	container.appendChild(canvas);
	
	return canvas;
};

/*===================================================
	Creates the context of a canvas, setting it
	width and height
===================================================*/
Engine.prototype.getCtx = function(/*Canvas*/ canvas){
	var ctx = canvas.getContext("2d");
	
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	
	return ctx;
};

/*===================================================
	Load an Image from a url and save it in the
	engine images memory.
===================================================*/
Engine.prototype.loadImage = function(/*String*/ url){
	var img = new Image();
	
	img.src = url;
	img.ready = false;
	
	// When the image is loaded, then mark it as ready
	Utils.addEvent(img, "load", function(){
		img.ready = true;
	});
	
	this.images.push(img);
	
	return img;
};

/*===================================================
	Gets a KTD line and creates an Array
	containing the map data.
	
	Parameters of the line:
	Argument[0]: Width
	Argument[1]: Height
	Argument[2]: A single line of data separated by commas
===================================================*/
Engine.prototype.parseMap = function(/*Array*/ params){
	var width = parseInt(params[0].trim());
	var height = parseInt(params[1].trim());
	var map = new Array(height);
	var tempMap = params[2].split(",");
	var ind = 0;
	
	for (var i=0;i<height;i++){
		map[i] = new Uint8ClampedArray(width);
		for (var j=0;j<width;j++){
			map[i][j] = tempMap[ind++];
		}
	}
	
	return map;
};

/*===================================================
	Parse a KTD line and creates a texture object
	
	Parameters of the line:
	
	When only 2 arguments are supplied:
	Argument[0]: Name of the texture
	Argument[1]: Data of the texture (Must be 
				 square and its width must have
				 a perfect square root)
				 
	When 3 arguments are supplied:
	Argument[0]: Name of the texture
	Argument[1]: Is the texture solid (T/F)
	Argument[2]: Data of the texture (Same as when 2)
	
	When 5 arguments are supplied:
	Argument[0]: Name of the texture
	Argument[1]: Is the texture solid (T/F)
	Argument[2]: Width of the texture
	Argument[3]: Height of the texture
	Argument[4]: Data of the texture (no constraints)
	
	When 7 arguments are supplied:
	Argument[0]: Name of the texture
	Argument[1]: Is the texture solid (T/F)
	Argument[2]: Base Width of the texture
	Argument[3]: Base Height of the texture
	Argument[4]: Real image bounding box left
	Argument[5]: Real image bounding box right
	Argument[6]: Data of the texture (no constraints)
	
	When 9 arguments are supplied:
	Argument[0]: Name of the texture
	Argument[1]: Is the texture solid (T/F)
	Argument[2]: Base Width of the texture
	Argument[3]: Base Height of the texture
	Argument[4]: Real image bounding box left
	Argument[5]: Real image bounding box right
	Argument[6]: Real image bounding box top
	Argument[7]: Real image bounding box bottom
	Argument[8]: Data of the texture (no constraints)
===================================================*/
Engine.prototype.parseTexture = function(/*Array*/ params){
	if (!params) throw "Wrong number of parameters in texture";
		
	var name, solid, width, height, offsetL, offsetR, texData, i, offsetT;
	name = params[0].trim();
	offsetT = 0;
	
	if (params.length == 2 || params.length == 3){
		solid = (params.length == 2)? false : (params[1].trim() == "T");
		i = (params.length == 2)? 1 : 2;
		texData = new Uint8ClampedArray(params[i].split(","));
		width = Math.sqrt(texData.length);
		if (Math.floor(width) != width)
			throw "The texture must be a of a square size of a size must be specified";
		height = width;
		offsetL = 0;
		offsetR = width;
		offsetB = height;
	}else if (params.length == 5){
		solid = (params[1].trim() == "T");
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		texData = new Uint8ClampedArray(params[4].split(","));
		offsetL = 0;
		offsetR = width;
		offsetB = height;
	}else if (params.length == 7){
		solid = (params[1].trim() == "T");
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		offsetL = parseInt(params[4].trim());
		offsetR = parseInt(params[5].trim());
		offsetB = height;
		texData = new Uint8ClampedArray(params[6].split(","));
	}else if (params.length == 9){
		solid = (params[1].trim() == "T");
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		offsetL = parseInt(params[4].trim());
		offsetR = parseInt(params[5].trim());
		offsetT = parseInt(params[6].trim());
		offsetB = parseInt(params[7].trim());
		texData = new Uint8ClampedArray(params[8].split(","));
	}else{
		throw "Wrong number of parameters in texture: " + params.length;
	}
	
	var texture = new Texture(texData, name, width, height, offsetL, offsetR, offsetT, offsetB, solid);
	return texture;
};

/*===================================================
	Loads a KTD file from a url, parse all the
	data and call a callback function if supplied
===================================================*/
Engine.prototype.loadKTD = function(/*String*/ url, /*Boolean*/ hasShadow, /*Function*/ callback){
	var mp = this;
	var http = Utils.getHttp();
	var ktd = {ready: false};
	http.open('GET', 'textures/' + url, true);
	http.onreadystatechange = function() {
  		if (http.readyState == 4 && http.status == 200) {
			var text = http.responseText.split("\n");
			
			var colors = [];
			var colorsS = [];
			var player = {};
			var textures = {indexes: [null]};
			var instances = [];
			var floor = null;
			var ceil = null;
			var map = null;
			for (var i=0,len=text.length;i<len;i++){
				var line = text[i].trim();
  				if (line == "") continue; 
				
				var data = line;
				var type = parseInt(data.substring(0,4));
				data = data.substring(5);
				
				// Reads the first byte and do the corresponding parsing for the data
				
				if (type == 0x00){ // Ceil tiles
					var params = data.split(" ");
					ceil = mp.parseMap(params);
				}else if (type == 0x01){ // Floor tiles
					var params = data.split(" ");
					floor = mp.parseMap(params);
				}else if (type == 0x02){ // Map data
					var params = data.split(" ");
					map = mp.parseMap(params);
				}else if (type == 0x03){ // Colours of the textures in the package
					colors = data.split(",");
					colorsS = new Array(colors.length);
					for (var j=0,jlen=colors.length;j<jlen;j++){
						colors[j] = Colors.parseColor(colors[j]);
						colorsS[j] = Colors.getDark(colors[j]);
					}
				}else if (type == 0x04){ // Player data
					var params = data.split(" ");
					player.x = parseInt(params[0].trim(), 10);
					player.y = parseInt(params[1].trim(), 10);
					player.d = parseFloat(params[2].trim());
				}else if (type >= 0x10 && type < 0x30){ // Textures Data
					var params = data.split(" ");
					var tex = mp.parseTexture(params);
					textures.indexes.push(tex.name);
					textures[tex.name] = tex;
				}else if (type >= 0x30){ //Instances data
					var params = data.split(" ");
					instances.push(params);
				}
			}
			
			// Sets the parsed data
			ktd.ready = true;
			ktd.player = player;
			ktd.colors = colors;
			ktd.colorsS = colorsS;
			ktd.textures = textures;
			ktd.instances = instances;
			ktd.floor = floor;
			ktd.ceil = ceil;
			ktd.map = map;
			
			if (callback) callback(ktd);
		}
	};
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.send();
	
	return ktd;
};

/*===================================================
	Creates an image data (inner canvas) and 
	set its alpha to opaque
===================================================*/
Engine.prototype.getData = function(/*Vec2*/ size){
	var data = this.ctx.createImageData(size.a, size.b);
	for (var i=0,len=data.data.length;i<len;i+=4){
		data.data[i + 3] = 255;
	};
	
	return data;
};

/*===================================================
	Check if all the images are loaded
===================================================*/
Engine.prototype.areImagesReady = function(){
	for (var i=0,len=this.images.length;i<len;i++){
		if (!this.images[i].ready) return false;
	}
	
	return true;
};

/*===================================================
	Loads a new Audio file using the AudioAPI
===================================================*/
Engine.prototype.loadAudio = function(url, isMusic){
	var eng = this;
	if (!eng.audioCtx) return null;
	
	var audio = {buffer: null, source: null, ready: false, isMusic: isMusic};
	
	var http = Utils.getHttp();
	http.open('GET', url, true);
	http.responseType = 'arraybuffer';
	
	http.onload = function(){
		eng.audioCtx.decodeAudioData(http.response, function(buffer){
			audio.buffer = buffer;
			audio.ready = true;
		}, function(msg){
			alert(msg);
		});
	};
	
	http.send();
	
	this.audio.push(audio);
	
	return audio;
};


/*===================================================
	Plays an audio loaded with the AudioAPI
===================================================*/
Engine.prototype.playSound = function(soundFile, loop, tryIfNotReady){
	var eng = this;
	if (!soundFile || !soundFile.ready){
		if (tryIfNotReady){ setTimeout(function(){ eng.playSound(soundFile, loop, tryIfNotReady); }, 300); } 
		return;
	}
	
	var source = eng.audioCtx.createBufferSource();
	source.buffer = soundFile.buffer;
	source.connect(eng.audioCtx.destination);
	source.start(0);
	source.loop = loop;
	source.looping = loop;
	
	if (soundFile.isMusic)
		soundFile.source = source;
};
