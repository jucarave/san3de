function Animation(texCode, animKeys, speed){
	if (!animKeys) animKeys = [0];
	if (!speed) speed = 0;
	
	this.texCode = texCode;
	this.animKeys = animKeys;
	this.speed = speed;
}

var EnemyFactory = {
	bat: {code: "bat", name: "Giant bat", feature: "flying", stand: new Animation("texBatStand", [0,1,2,1], 1 / 4), hurt: new Animation("texBatHurt")},
	
	getEnemy: function(enemyCode){
		if (!EnemyFactory[enemyCode]) throw "Invalid Enemy Code: " + enemyCode;
		
		var ret = {};
		var ene = EnemyFactory[enemyCode];
		
		for (var i in ene){
			ret[i] = ene[i];
		}
		
		
		return ret;
	}
};
