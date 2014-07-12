function Texture(texData, name, width, height, offsetL, offsetR, offsetT, offsetB, solid){
	this.texData = texData;
	this.name = name;
	this.width = width;
	this.height = height;
	this.offsetL = offsetL;
	this.offsetR = offsetR;
	this.offsetT = offsetT;
	this.offsetB = offsetB;
	this.solid = solid;
	
	this.bytesOff = offsetT * width + offsetL;
	this.innerW = offsetR - offsetL;
	this.invOffR = width - offsetR;
}