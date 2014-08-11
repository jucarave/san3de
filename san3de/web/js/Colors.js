/*===================================================
	The colors used currently in the game (they
	can change in every map)
===================================================*/
var Colors = {
	textures: [], 			// Colors of the vertical walls
	texturesShadow: [], 	// Colors of the horizontal walls
	billboards: [], 		// Colors of items and enemies
	alphaC: [255,0,255], 	// Color of transparency
	blackC: [0,0,0], 		// Color black
	ceil: [], 				// Color of the ceiling
	floor: [], 				// Color of the floor
	shadowF: [],			// Dark color of the floor (For when the player is falling)
	
	/*===================================================
		Gets a Hexadecimal format color and returns
		an array of int rgb
	===================================================*/
	parseColor: function(/*String*/ hexaColor){
		var r = parseInt(hexaColor.substring(0,2), 16);
		var g = parseInt(hexaColor.substring(2,4), 16);
		var b = parseInt(hexaColor.substring(4,6), 16);
		
		return [r,g,b];
	},
	
	/*===================================================
		Transform a rgb color to it dark part (rgb)/2
	===================================================*/
	getDark: function(/*Array*/ color){
		var r = Math.floor(color[0] * 0.5);
		var g = Math.floor(color[1] * 0.5);
		var b = Math.floor(color[2] * 0.5);
		
		return [r,g,b];
	}
};
