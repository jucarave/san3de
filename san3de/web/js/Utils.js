var Utils = {
	get: function(objectId){
		return document.getElementById(objectId);
	},
	
	addEvent: function(obj, type, func){
		if (obj.attachEvent){
			obj.attachEvent("on" + type, func);
		}else if (obj.addEventListener){
			obj.addEventListener(type, func, false);
		}
	},
	
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

Math.iRandom = function(a, b){
	if (b == undefined){
		b = a;
		a = 0;
	}
	b -= a;
	
	return a + Math.floor(Math.random() * b);
};

Math.getAngle = function(/*vec2*/ a, /*vec2*/ b){
	var xx = Math.abs(a.a - b.a);
	var yy = Math.abs(a.b - b.b);
	
	var ang = Math.atan2(yy, xx);
	
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

Math.getShortAngle = function(a1, a2){
    var angle = (Math.abs(a1 - a2)) % Math.PI2;

    if(angle > Math.PI)
        angle = Math.PI2 - angle;

    return angle;
};

Math.getDistance = function(/*Vec2*/ a, /*Vec2*/ b){
	return Math.sqrt(Math.pow(a.a - b.a, 2) + Math.pow(a.b - b.b, 2));
};

Math.PI2 = Math.PI * 2;
Math.PI_2 = Math.PI / 2;
Math.PI3_2 = 3 * Math.PI / 2;
Math.degToRad = function(value){
	return value * Math.PI / 180;
};
Math.radToDeg = function(value){
	return value * 180 / Math.PI;
};

window.requestAnimFrame = 
	window.requestAnimationFrame       || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame    || 
	window.oRequestAnimationFrame      || 
	window.msRequestAnimationFrame     || 
	function(/* function */ draw1){
		window.setTimeout(draw1, 1000 / 60);
	};