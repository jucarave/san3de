/*===================================================
	Here are some common functions that are used 
	along all the game
===================================================*/
var Utils = {
	/*===================================================
		Returns an HTML element by its ID
	===================================================*/
	get: function(/*String*/ objectId){
		return document.getElementById(objectId);
	},
	
	/*===================================================
		Adds a event listener regarding the browser
	===================================================*/
	addEvent: function(/*Element*/ obj, /*String*/ type, /*Function*/ func){
		if (obj.attachEvent){
			obj.attachEvent("on" + type, func);
		}else if (obj.addEventListener){
			obj.addEventListener(type, func, false);
		}
	},
	
	/*===================================================
		Returns a XMLHttpRequest object no matter
		the browser
	===================================================*/
	getHttp: function(){
		var http;
		if  (window.XMLHttpRequest){
			http = new XMLHttpRequest();
		}else if (window.ActiveXObject){
			http = new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		
		return http;
	}
};

/*===================================================
	Returns a random integer number between 1 or
	2 parameters
===================================================*/
Math.iRandom = function(/*Int*/ a, /*Int*/ b){
	if (b == undefined){
		b = a;
		a = 0;
	}
	b -= a;
	
	return a + Math.floor(Math.random() * b);
};

/*===================================================
	Gets the angle between 2 points 
===================================================*/
Math.getAngle = function(/*Vec2*/ a, /*Vec2*/ b){
	var xx = Math.abs(a.a - b.a);
	var yy = Math.abs(a.b - b.b);
	
	var ang = Math.atan2(yy, xx);
	
	// Adjust the angle according to both positions
	if (b.a <= a.a && b.b <= a.b){
		ang = Math.PI - ang;
	}else if (b.a <= a.a && b.b > a.b){
		ang = Math.PI + ang;
	}else if (b.a > a.a && b.b > a.b){
		ang = Math.PI2 - ang;
	}
	
	ang = (ang + Math.PI2) % Math.PI2;
	
	return ang;
};

/*===================================================
	Gets the minimum angle between 2 angles
===================================================*/
Math.getShortAngle = function(/*float*/ a1, /*float*/ a2){
    var angle = (Math.abs(a1 - a2)) % Math.PI2;

    if(angle > Math.PI)
        angle = Math.PI2 - angle;

    return angle;
};

/*===================================================
	Gets the distance between two points using
	the pythagoras theorem
===================================================*/
Math.getDistance = function(/*Vec2*/ a, /*Vec2*/ b){
	return Math.sqrt(Math.pow(a.a - b.a, 2) + Math.pow(a.b - b.b, 2));
};

// Common angles 90, 270, 360 in radians
Math.PI2 = Math.PI * 2;
Math.PI_2 = Math.PI / 2;
Math.PI3_2 = 3 * Math.PI / 2;

/*===================================================
	Transforms a degree angle to a radian
===================================================*/
Math.degToRad = function(/*float*/ value){
	return value * Math.PI / 180;
};

/*===================================================
	Transforms a radian angle to a degree
===================================================*/
Math.radToDeg = function(/*float*/ value){
	return value * 180 / Math.PI;
};

// Depending on the browser, this function can be different
window.requestAnimFrame = 
	window.requestAnimationFrame       || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame    || 
	window.oRequestAnimationFrame      || 
	window.msRequestAnimationFrame     || 
	function(/* function */ draw1){
		window.setTimeout(draw1, 1000 / 30);
	};