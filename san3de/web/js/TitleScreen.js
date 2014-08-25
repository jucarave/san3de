function TitleScreen(/*Game*/ game){
	this.game = game;
	this.blink = 30;
}

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13) || this.game.getMouseButtonPressed()){
		this.game.loadMap("16x16U5.ktd");
		this.game.scene = null;
		//this.game.playMusic("descent");
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	
	var ctx = this.game.getCtx();
	ctx.drawImage(this.game.images.titleS, 0, 0);
	
	if (this.blink-- > 15){
		ctx.font = this.game.font;
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Click To Continue", ctx.width / 2, 88);
		ctx.textAlign = "left";
	}else if (this.blink == 0){
		this.blink = 30;
	}
};
