var Colors = {
	textures: [], 
	texturesShadow: [], 
	billboards: [], 
	alphaC: [255,0,255], 
	ceil: [], 
	floor: [], 
	shadowF: [],
	
	parseColor: function(hexaColor){
		var r = parseInt(hexaColor.substring(0,2), 16);
		var g = parseInt(hexaColor.substring(2,4), 16);
		var b = parseInt(hexaColor.substring(4,6), 16);
		
		return [r,g,b];
	},
	
	getDark: function(color){
		var r = Math.floor(color[0] * 0.5);
		var g = Math.floor(color[1] * 0.5);
		var b = Math.floor(color[2] * 0.5);
		
		return [r,g,b];
	}
};
