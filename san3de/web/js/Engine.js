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

Engine.prototype.parseTexture = function(params){
	if (params.length < 2 || params.length > 7)
		throw "Wrong number of parameters in texture";
		
	var name, solid, width, height, offsetL, offsetR, texData, i;
	name = params[0].trim();
	
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
	}
	else if (params.length == 7){
		solid = parseInt(params[1].trim());
		width = parseInt(params[2].trim());
		height = parseInt(params[3].trim());
		offsetL = parseInt(params[4].trim());
		offsetR = parseInt(params[5].trim());
		texData = new Uint8ClampedArray(params[6].split(","));
	}
	
	var texture = new Texture(texData, name, width, height, offsetL, offsetR, solid);
	return texture;
};

Engine.prototype.loadKTDNew = function(url, hasShadow){
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
					player.x = parseInt(params[0].trim(), 10);
					player.y = parseInt(params[1].trim(), 10);
					player.d = parseFloat(params[2].trim());
				}else if (type >= 0x10 && type < 0x30){
					var params = data.split(" ");
					var tex = mp.parseTexture(params);
					textures.indexes.push(tex.name);
					textures[tex.name] = tex;
				}
			}
			
			ktd.ready = true;
			ktd.player = player;
			ktd.colors = colors;
			ktd.colorsS = colorsS;
			ktd.textures = textures;
		}
	};
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.send();
	
	return ktd;
};

Engine.prototype.loadKTD = function(url, holder, colorH, colorShadowH){
	var mp = this;
	var http = Utils.getHttp();
	http.open('GET', 'textures/' + url, true);
	http.onreadystatechange=function() {
  		if (http.readyState==4 && http.status==200) {
  			var text = http.responseText.split("\n");
  			var step = 0;
  			var texN = "";
			var width = 0;
			var height = 0;
			var offL = 0;
			var offR = 0;
			var solid = false;
  			holder.indexes = [null];
  			
  			for (var i=0,len=text.length;i<len;i++){
  				var line = text[i];
  				if (line.trim() == ""){
  					step = 1;
  					continue;
  				}
  				
  				if (step == 0){
  					var r = parseInt(line.substring(0,2),16);
  					var g = parseInt(line.substring(2,4),16);
  					var b = parseInt(line.substring(4,6),16);
  					
  					colorH.push([r,g,b]);
					
					if (colorShadowH != null){
						r = Math.floor(r / 2);
						g = Math.floor(g / 2);
						b = Math.floor(b / 2);
						
						colorShadowH.push([r,g,b]);
					}
  				}else if (step == 1){
					var inf = line.trim().split(" ");
  					texN = inf[0].trim();
					solid = (inf[1] == "T");
					width = parseInt(inf[2], 10);
					height = parseInt(inf[3], 10);
					offL = -1;
					offR = -1;
					
					if (inf[3] && inf[4]){
						offL = parseInt(inf[4], 10);
						offR = parseInt(inf[5], 10);
					}
					
  					step = 2;
  				}else if (step == 2){
					var colors = line.trim().split(",");
  					holder[texN] = new Uint8ClampedArray(colors);
					holder[texN].w = width;
					holder[texN].h = height;
					holder[texN].ol = offL;
					holder[texN].or = offR;
					holder[texN].solid = solid;
  					holder.indexes.push(texN);
  				}
  			}
    	}
  	};
  
	http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	http.send();
};

Engine.prototype.getData = function(/*vec2*/ size){
	var data = this.ctx.createImageData(size.a, size.b);
	for (var i=0,len=data.data.length;i<len;i+=4){
		data.data[i + 3] = 255;
	};
	
	return data;
};
