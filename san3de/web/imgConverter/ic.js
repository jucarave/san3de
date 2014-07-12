window.addEventListener("load", function(){
	var canvas = document.createElement("canvas");
	canvas.width = 640;
	canvas.height = 480;
	
	var ctx = canvas.getContext("2d");
	
	var img = new Image();
	img.src = "img/texEnemy2.png";
	var offset = 0;
	var tp = [0,122,16,41];
	img.addEventListener("load", function(){
		ctx.drawImage(img,tp[0],tp[1],tp[2],tp[3],0,0,tp[2],tp[3]);
		
		var data = ctx.getImageData(0,0,tp[2],tp[3]);
		var div = document.getElementById("divResult");
		var l = 0;
		div.innerHTML = "";
		
		for (var i=0,len=data.data.length;i<len;i+=4){
			var r = data.data[i];
			var g = data.data[i+1];
			var b = data.data[i+2];
			
			var c = Color.getColor(r,g,b) + offset;
			div.innerHTML += c + ",";
		}
		
		Color.printColors();
	});
});

Color = {
	colors: ["ff00ff", "ff7f27", "ffc90e", "ffe179", "000000", "161616", "272727",
	"060606", "121111", "333333", "272f25", "546850", "14120f", "312c23", "443c30",
	"404e3d"],
	
	/*colors: ["4a0e0b", "60130f", "7d1813", "aa211a", "4f4f4f", "6a6a6a", "8f8f8f", "a7a7a7"],*/
	
	getColor: function(r,g,b){
		r = Number(r).toString(16);
		g = Number(g).toString(16);
		b = Number(b).toString(16);
		
		if (r.length == 1) r = "0" + r;
		if (g.length == 1) g = "0" + g;
		if (b.length == 1) b = "0" + b;
		
		var hex = r+g+b;
		var ind = this.colors.length;
		for (var i=0,len=this.colors.length;i<len;i++){
			if (this.colors[i] == hex){
				return i;
			}
		}
		
		this.colors.push(hex);
		return ind;
	},
	
	printColors: function(){
		var div = document.getElementById("divColors");
		div.innerHTML = "";
		for (var i=0,len=this.colors.length;i<len;i++){
			div.innerHTML += this.colors[i] + "<br />";
		}
	}
};
