var ItemFactory = {
	goldKey: {name: "golden key", type: "key"},
	
	getItem: function(itemCode){
		var it = ItemFactory[itemCode];
		if (!it) throw "Invalid item code: " + itemCode + "!";
		
		var ret = {};
		for (var i in it){
			ret[i] = it[i];
		}
		ret.itemCode = itemCode;
		
		return ret;
	}
};
