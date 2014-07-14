function Console(/*Int*/ maxMessages, /*String*/ font, /*Game*/ game){
	this.messages = [];
	this.maxMessages = maxMessages;
	this.game = game;
	this.font = font;
	this.fontS = parseInt(font.substring(0,font.indexOf("px")), 10);
}

Console.prototype.addMessage = function(/*String*/ msg, /*String*/ type, /*String*/ color){
	if (type != "unique" && this.messages.length > 0){
		var lm = this.messages[this.messages.length - 1];
		if (lm.type == type){
			lm.amount += 1;
			return;
		}
	}
	
	var m = {
		msg: msg,
		type: type,
		color: color,
		amount: 1
	};
	
	this.messages.push(m);
	
	if (this.messages.length > this.maxMessages){
		this.messages.splice(0,1);
	}
};

Console.prototype.render = function(/*Int*/ x, /*Int*/ y){
	var s = this.messages.length - 1;
	var ctx = this.game.getCtx();
	ctx.font = this.font;
	for (var i=s;i>=0;i--){
		var m = this.messages[i];
		var msg = m.msg;
		if (m.amount > 1) msg += " (x" + m.amount + ")";
		
		ctx.fillStyle = m.color;
		ctx.fillText(msg, x, y);
		
		y -= this.fontS;
	}
};