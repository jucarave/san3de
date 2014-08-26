var EnemyFactory = {
	bat: {code: "bat", name: "Giat bat", feature: "flying", stand: {texCode: "texBatStand", animKeys: [0,1,2,1], speed: 1 / 4}},
	
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
