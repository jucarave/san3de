function TitleScreen(/*Game*/ game){
	this.game = game;
}

TitleScreen.prototype.step = function(){
	if (this.game.getKeyPressed(13)){
		this.game.loadMap("kramBuild.ktd");
		this.game.scene = null;
	}
};

TitleScreen.prototype.loop = function(){
	this.step();
	
	var ctx = this.game.getCtx();
	ctx.drawImage(this.game.images.titleS, 0, 0);
};
