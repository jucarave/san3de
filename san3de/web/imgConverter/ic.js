window.addEventListener("load", function(){
	var canvas = document.createElement("canvas");
	canvas.width = 640;
	canvas.height = 480;
	
	var ctx = canvas.getContext("2d");
	
	var img = new Image();
	img.src = "img/texWall5.png";
	var offset = 0;
	var tp = [0,0,64,64];
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
	colors: ["1D202B","08090D","030405","11131A","292D3D","383D54","2F2F36","6B6B6B","A8A8A8","FF00FF","332609","573D00","785607"],
	
	/*colors: ["FF00FF", "FF7F27", "FFC90E", "FFE179", "000000", "161616", "272727",
	"060606", "121111", "333333", "272F25", "546850", "14120F", "312C23", "443C30",
	"404E3D","4A4A4A","8A8A8A","FFFFC9","9C9C9C","D9D9D9","FFFFFF","DFE697","A2AD21","D6E62C",
	"12111C","302D4A","780000","BD0000","D13B3B"],*/
	
	/*colors: ["4A0E0B","60130F","7D1813","AA211A","4F4F4F","6A6A6A","8F8F8F","A7A7A7","000000","242835","333A4A","4D5873",
	"FF00FF","145934","00421F","24804F","001F0E","636363","808080","5E1818","802020","BF3030"],*/
	
	getColor: function(r,g,b){
		r = Number(r).toString(16);
		g = Number(g).toString(16);
		b = Number(b).toString(16);
		
		if (r.length == 1) r = "0" + r;
		if (g.length == 1) g = "0" + g;
		if (b.length == 1) b = "0" + b;
		
		var hex = r+g+b;
		hex = hex.toUpperCase();
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
			div.innerHTML += this.colors[i] + ",";
		}
	}
};
