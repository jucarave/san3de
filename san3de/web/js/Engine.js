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
