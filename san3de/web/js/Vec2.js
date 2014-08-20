/*===================================================
	Simple structure that holds two float values
===================================================*/
function Vec2(/*float*/ a, /*float*/ b, /*float*/ c){
	this.a = a;
	this.b = b;
	this.c = c;
}

/*===================================================
	Compares if this vector is equal to other vector
	or to two floats
===================================================*/
Vec2.prototype.equals = function(/*[Vec2,float]*/a, /*float*/ b){
	if (a.a !== undefined){
		return (this.a == a.a && this.b == a.b);
	}else{
		return (this.a == a && this.b == b);
	}
};

/*===================================================
	Replace the values of this vector with other
	vector or with two floats
===================================================*/
Vec2.prototype.set = function(/*[Vec2,float]*/ a, /*float*/ b){
	if (a.a != undefined){
		this.a = a.a;
		this.b = a.b;
	}else{
		this.a = a;
		this.b = b;
	}
};

/*===================================================
	Sums a vector or two floats to this vector
===================================================*/
Vec2.prototype.sum = function(/*[Vec2,float]*/ a, /*float*/ b){
	if (a.a !== undefined){
		this.a += a.a;
		this.b += a.b;
	}else{
		this.a += a;
		this.b += b;
	}
};

/*===================================================
	Multiply the values of this vector by a float
===================================================*/
Vec2.prototype.mult = function(/*float*/ a){
	this.a *= a;
	this.b *= a;
};

/*===================================================
	Returns a new instance of this vector
===================================================*/
Vec2.prototype.clone = function(){
	return vec2(this.a, this.b);
};

/*===================================================
	Simple function to avoid the 'new Vec2' in
	the code
===================================================*/
function vec2(/*[Vec2,float]*/ a, /*float*/ b){
	return new Vec2(a, b, 0);
}

/*===================================================
	Simple function to avoid the 'new Vec2' in
	the code
===================================================*/
function vec3(/*[Vec2,float]*/ a, /*float*/ b, /*float*/ c){
	return new Vec2(a, b, c);
}