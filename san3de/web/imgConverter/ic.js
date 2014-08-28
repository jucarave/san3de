window.addEventListener("load", function(){
	var canvas = document.createElement("canvas");
	canvas.width = 640;
	canvas.height = 480;
	
	var ctx = canvas.getContext("2d");
	
	var img = new Image();
	img.src = "img/texture.png";
	var offset = 0;
	var tp = [0,0,32,32];
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
	// KramBuild
	/*colors: ["211B11","6E5120","8F6A29","9C7D49","4D3F28","FF00FF","080808","141414","383838","B7C400","A5A86C","828555","394175","5764B3",
	"D1D98B","09140A","274529","172B18","000000","292216","453924","404040","828282","616161"],*/
	/*colors: ["1D202B","08090D","030405","11131A","292D3D","383D54","2F2F36","6B6B6B","A8A8A8","FF00FF","332609","573D00","785607","4D4D4D","000000",
	"1C1403","0A0A0A","171717","1F1F1F","12100A","1C1810","0A0906","241F14","48689C","5070A3","3A598C","365485."],*/
	
	// 16x16 U5 Walls
	colors: ["000000","FFFFFF","A0A0A0","A05000","A00000","FF5050","505050","FFFF50","170503","300B07","4F130C","261604","3D2307","4F2E09","1F1F1F",
	"171717","0D0D0D","262626","3B381C","524E2C","24200F","2E2B16","241A09","1F1607","1A1204","131526","101221","0C0D1C"],
	// 16x16 U5 Billboards
	//colors: ["FF00FF","2E2E2E","000000","6E6E6E","171717","424242","380B0B","541010"],
	
		
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
