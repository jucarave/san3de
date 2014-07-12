function Engine(size, container){
	this.canvas = this.createCanvas(size, container);
	this.ctx = this.getCtx(this.canvas);
	
	this.images = [];
}

Engine.prototype.createCanvas = function(size, container){
	var canvas = document.createElement("canvas");
	canvas.width = size.a;
	canvas.height = size.b;
	
	container.appendChild(canvas);
	
	return canvas;
};

Engine.prototype.getCtx = function(canvas){
	var ctx = canvas.getContext("2d");
	
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	
	return ctx;
};

Engine.prototype.loadImage = function(url){
	var img = new Image();
	
	img.src = url;
	img.ready = false;
	
	Utils.addEvent(img, "load", function(){
		img.ready = true;
	});
	
	this.images.push(img);
	
	return img;
};

Engine.prototype.parseMap = function(params){
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

Engine.prototype.parseTexture = function(params){
	if (!params) throw "Wrong number of parameters in texture";
		
	var name, solid, width, height, offsetL, offsetR, texData, i, offsetY;
	name = params[0].trim();
	offsetY = 0;
	
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
	}else if (params.length == 5){
		solid = parseInt(params[1].trim());
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		texData = new Uint8ClampedArray(params[4].split(","));
		offsetL = 0;
		offsetR = width;
	}else if (params.length == 7){
		solid = parseInt(params[1].trim());
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		offsetL = parseInt(params[4].trim());
		offsetR = parseInt(params[5].trim());
		texData = new Uint8ClampedArray(params[6].split(","));
	}else if (params.length == 8){
		solid = parseInt(params[1].trim());
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		offsetL = parseInt(params[4].trim());
		offsetR = parseInt(params[5].trim());
		offsetY = parseInt(params[6].trim());
		texData = new Uint8ClampedArray(params[7].split(","));
	}else{
		throw "Wrong number of parameters in texture";
	}
	
	var texture = new Texture(texData, name, width, height, offsetL, offsetR, offsetY, solid);
	return texture;
};

Engine.prototype.loadKTD = function(url, hasShadow, callback){
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
			var map = null;
			for (var i=0,len=text.length;i<len;i++){
				var line = text[i].trim();
  				if (line == "") continue; 
				
				var data = line;
				var type = parseInt(data.substring(0,4));
				data = data.substring(5);
				
				if (type == 0x00){ Colors.ceil = Colors.parseColor(data); }
				else if (type == 0x01){ 
					Colors.floor = Colors.parseColor(data);
					if (hasShadow) Colors.shadowF = Colors.getDark(Colors.floor);
				}else if (type == 0x02){
					colors = data.split(",");
					colorsS = new Array(colors.length);
					for (var j=0,jlen=colors.length;j<jlen;j++){
						colors[j] = Colors.parseColor(colors[j]);
						colorsS[j] = Colors.getDark(colors[j]);
					}
				}else if (type == 0x03){
					var params = data.split(" ");
					map = mp.parseMap(params);
				}else if (type == 0x04){
					var params = data.split(" ");
					player.x = parseInt(params[0].trim(), 10);
					player.y = parseInt(params[1].trim(), 10);
					player.d = parseFloat(params[2].trim());
				}else if (type >= 0x10 && type < 0x30){
					var params = data.split(" ");
					var tex = mp.parseTexture(params);
					textures.indexes.push(tex.name);
					textures[tex.name] = tex;
				}else if (type >= 0x30){
					var params = data.split(" ");
					instances.push(params);
				}
			}
			
			ktd.ready = true;
			ktd.player = player;
			ktd.colors = colors;
			ktd.colorsS = colorsS;
			ktd.textures = textures;
			ktd.instances = instances;
			ktd.map = map;
			
			if (callback) callback(ktd);
		}
	};
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.send();
	
	return ktd;
};

Engine.prototype.getData = function(/*vec2*/ size){
	var data = this.ctx.createImageData(size.a, size.b);
	for (var i=0,len=data.data.length;i<len;i+=4){
		data.data[i + 3] = 255;
	};
	
	return data;
};
