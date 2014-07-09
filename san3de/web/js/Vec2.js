function Vec2(a, b){
	this.a = a;
	this.b = b;
}

Vec2.prototype.equals = function(a, b){
	if (a.a !== undefined){
		return (this.a == a.a && this.b == a.b);
	}else{
		return (this.a == a && this.b == b);
	}
};

Vec2.prototype.set = function(a, b){
	if (a.a != undefined){
		this.a = a.a;
		this.b = a.b;
	}else{
		this.a = a;
		this.b = b;
	}
};

Vec2.prototype.sum = function(a, b){
	if (a.a !== undefined){
		this.a += a.a;
		this.b += a.b;
	}else{
		this.a += a;
		this.b += b;
	}
};

Vec2.prototype.mult = function(a){
	this.a *= a;
	this.b *= a;
};

Vec2.prototype.clone = function(){
	return vec2(this.a, this.b);
};

function vec2(a,b){
	return new Vec2(a, b);
}
