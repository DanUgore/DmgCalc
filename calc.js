Calc = {};
// Default State
Calc.calcing = false;
Calc.relevantObjs = {
	attackerAbility:1,
	attackerItem:1,
	defenderAbility:1,
	defenderItem:1,
	move:1
};


Calc.calcDamageNumbers = function (attacker, defender, move, field) {
	// We are in the middle of calcing
	this.calcing = true;
	// Move
	if (typeof move === 'string') move = Data.Movedex[move]; // Calc.getMove(move)
	if (!move || move.category === 'Status') return;
	// Clone attacker, defender, and move.
	//this.attacker = attacker;
	//this.defender = defender;
	this.move = Calc.moveClone(move);
	this.attackerAbility = Calc.abilityClone(attacker.ability);
	this.attackerItem = Calc.itemClone(attacker.item);
	this.defenderAbility = Calc.abilityClone(defender.ability);
	this.defenderItem = Calc.itemClone(defender.item);
	this.args = {}; // Keep variables from Calc.get() here

	/* listed move type -> moves that call other moves use the new move instead ->
	 * Normalize changes the move to Normal -> moves now change type (Hidden Power/Judgment/Natural Gift/Techno Blast/Weather Ball) ->
	 * if the move is Normal, Aerilate/Pixilate/Refrigerate change it to Flying/Fairy/Ice
     * -> if the move is still Normal, Ion Deluge changes to Electric -> Electrify changes the move to Electric -> 
	 * Protean activates -> Gems activate if the Gem matches the move type
	*/
	// console.log(this.get('moveType'));
	this.move.type = this.get('moveType') || move.type;
	// Abilities
	//attacker.ability = Calc.getAbility();
	//defender.ability = Calc.getAbility();	
	// Items
	//attacker.item = Calc.getItem();
	//defender.item = Calc.getItem();
	
	attackStatName = (move.category === 'Physical' ? 'atk' : 'spa');
	defendStatName = (move.category === 'Physical' ? 'def' : 'spd');

	attackStat = attacker.stats[attackStatName];
	defendStat = defender.stats[defendStatName];
	
	
	// attackStat = Calc.getEffectiveStat(attackStatName, attackStat, attackBoosts, attacker);
	// defendStat
	var damage = 0;
	
	var basePower = this.get('basePower') || move.basePower;
	var bpMod = this.getMod('bpMod') || 0x1000;
	basePower = this.modify(basePower, bpMod);
	
	// Base Damage
	baseDamage = (Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * basePower * attackStat / defendStat) / 50) + 2);
	damage = baseDamage;
	
	// Spread?
	// TODO
	
	// Weather?
	// TODO
	
	// Crit?
	var critMod = this.get('critMod') || 0x1800;
	var crit = crit || false;
	if (crit) this.modify(damage, critMod);
	
	// Random Factor Begins To Apply Here
	// Store other variables for calculations in loop
	
	// STAB
	var hasSTAB = false;
	for (var i = 0; i < attacker.types.length && !hasSTAB; i++) {
		if (this.move.type === attacker.types[i]) hasSTAB = true;
	}
	var stabMod = this.get('stabMod') || 0x1800;
	
	// Type Effectiveness
	// var typeEff = 1;
	var typeEff = this.getTypeEff(this.move.type, defender.types);
	
	// Burn
	var burnEffect = false;
	if (attacker.status === 'brn') burnEffect = true;
	
	// Final Mods
	// TODO
	var finalMod = this.getMod('finalMod') || 0x1000; console.log()
	
	// Loop through damage rolls
	var damageNumbers = [];
	for (var dmgRoll = 15; damageNumbers.length < 16; dmgRoll--) {
		var rolledDamage = Math.floor(damage * (100 - dmgRoll) / 100);
		rolledDamage = this.modify(rolledDamage, (hasSTAB ? stabMod : 0x1000));
		rolledDamage = Math.floor(rolledDamage * typeEff);
		if (burnEffect) rolledDamage = Math.floor(rolledDamage/2);
		// Final Modifier
		rolledDamage = this.modify(rolledDamage, finalMod);
		if (rolledDamage < 1) rolledDamage = 1;
		damageNumbers.push(rolledDamage);
	}
	// done calcing
	this.calcing = false;
	// Clear relevantObjs
	for (var obj in this.relevantObjs) delete this[obj];
	delete this.args;
	return damageNumbers;
};

Calc.toModifier = function (value, numerator, denominator) {
	if (!denominator) denominator = 1;
	if (numerator && numerator.length) {
		denominator = numerator[1];
		numerator = numerator[0];
	}
	return Math.floor(numerator * 0x1000 / denominator);
};

Calc.modify = function (value, mod) {
	mod = mod || 0x1000;
	return Math.floor((value * mod + 0x800 - 1) / 0x1000);
};

Calc.chainModifiers = function (mod1, mod2) {
	mod1 = mod1 || 0x1000;
	mod2 = mod2 || 0x1000;
	return ((mod1 * mod2 + 0x800) >>> 12); // M'' = ((M * M') + 0x800) >> 12
}

Calc.compareTypes = function (oType, dType, ignoreImmunities) {
	if (typeof oType === 'string') oType = [oType];
	if (typeof dType === 'string') dType = [dType];
	var eff = 1;
	for (var i = 0; i < oType.length; i++) {
		if (!Data.TypeChart[oType[i]]) return false;
		for (var j = 0; j < dType.length; j++) {
			if (!Data.TypeChart[dType[j]]) return false;
			eff *= (Data.TypeChart[dType[j]].damageTaken[oType[i]] !== 0 ? Data.TypeChart[dType[j]].damageTaken[oType[i]] : (ignoreImmunities ? 1 : 0));
		}
	}
}

/* Calc.get() - returns the highest priority value or an array of values.
 * Calc.get() is a function that checks the relevant variables in a battle
 * that could affect the part of damage calculation passed to the function.
 * Uses Calc.getFrom().
*/

Calc.get = function (handle, returnArray) {
	if (!this.calcing) return null;
	handle = handle || '';
	if (!handle) return console.log('Blank Handle') || null;
	returnValues = [];
	var sides = {
		attack: "Attack",
		defend: "Defend"
	}
	for (obj in this.relevantObjs) {
		var value = this.getFrom(handle,obj,true);
		if (typeof value !== 'undefined') returnValues.push(value);
		if (obj.substr(0,6) in sides) {
			value = this.getFrom(handle+sides[obj.substr(0,6)], obj, true);
			if (typeof value !== 'undefined') returnValues.push(value);
		}
	}
	returnValues.sort(function(a,b){
		return b.priority - a.priority;
	});
	if (returnArray) return returnValues.map(function(o){return o.value;});
	if (!returnValues.length) return false;
	return returnValues[0].value;
};

Calc.getFrom = function (handle, fromObj, returnObj) {
	if (!this.calcing) return null;
	handle = handle || '';
	fromObj = fromObj || '';
	if (!handle || !fromObj) return null;
	var returnValues = [];
	if (!this[fromObj]) {
		console.log('Could not find this.'+fromObj);
		return;
	}
	// console.log('Running',handle,'on',fromObj);
	if (!this[fromObj]['handles'] || !this[fromObj]['handles'][handle]) return;
	var returnValue = {};
	this.self = this[fromObj];
	switch (typeof this[fromObj]['handles'][handle]) {
		case 'function':
			returnValue.value = this[fromObj]['handles'][handle].call(this);
			if (typeof returnValue.value === 'object') returnValue = $.extend(returnValue, returnValue.value);
			break;
		case 'object':
			returnValue = $.extend(returnValue, this[fromObj]['handles'][handle]);
			if (typeof returnValue.value === 'function') returnValue.value = returnValue.value.call(this);
			break;
		default: returnValue.value = this[fromObj]['handles'][handle];
	}
	if (this.self) delete this.self;
	if (typeof returnValue.value === 'undefined') return;
	returnValue.source = this[fromObj];
	if (returnObj) return returnValue;
	return returnValue.value;
};

Calc.getTypeEff = function (oType, dTypes) {
	if (!oType) return false;
	var ignoreImmunities = false;
	var immune = this.getFrom('immuneTo'+oType, 'defenderAbility');
	if (immune) return 0;
	var eff = 1;
	if (!Data.TypeChart[oType]) return false;
	for (var j = 0, damageTaken; j < dTypes.length; j++) {
		if (!Data.TypeChart[dTypes[j]]) return false;
		//console.log("this.getFrom('typeEff'"+oType+", 'move'): ", this.getFrom('typeEff'+oType, 'move'))
		damageTaken = this.getFrom('typeEff'+dTypes[j], 'move') || Data.TypeChart[dTypes[j]].damageTaken[oType];
		eff *= (damageTaken !== 0 ? damageTaken : (ignoreImmunities ? 1 : 0));
	}
	return eff;
};

Calc.getMod = function (modName) { // Responsible for chaining modifiers as well
	modName = modName || '';
	modifiers = this.get(modName, true); // Get an array of modifiers
	console.log(modifiers);
	var totalMod = 0x1000;
	for (var i = 0; i < modifiers.length; i++) {
		totalMod = this.chainModifiers(totalMod, modifiers[i]);
	}
	return totalMod;
};

Calc.moveClone = function (move) {
	if (!move) return {};
	if (typeof move === 'string') move = Data.Movedex[move];
	if (typeof move !== 'object') return false;
	// Return Simple clone for now
	return $.extend(true, {}, move);
};

Calc.itemClone = function (item) {
	if (!item) return {};
	if (typeof item === 'string') item = Data.Items[item];
	if (typeof item !== 'object') return false;
	// Return Simple clone for now
	return $.extend(true, {}, item);
};

Calc.abilityClone = function (ability) {
	if (!ability) return {};
	if (typeof ability === 'string') ability = Data.Abilities[ability];
	if (typeof ability !== 'object') return false;
	// Return Simple clone for now
	return $.extend(true, {}, ability);
};

/*
Calc.get = function (handle, returnArray) { // bool returnArray - if true, return array of values
	if (!this.calcing) return null;
	handle = handle || '';
	if (!handle) return null;
	var returnValues = [];
	for (var obj in this.relevantObjs) {
		if (!this[obj]) {
			console.log('Could not find this.'+obj);
			continue;
		}
		if (!this[obj]['handles'] || !this[obj]['handles'][handle]) continue;
		var returnValue = {};
		this.self = this[obj];
		switch (typeof this[obj]['handles'][handle]) {
			case 'function':
				returnValue.value = this[obj]['handles'][handle].call(this);
				if (typeof returnValue.value === 'object') returnValue = $.extend({}, returnValue, returnValue.value);
				break;
			case 'object':
				returnValue = $.extend(returnValue, this[obj]['handles'][handle]);
				if (typeof returnValue.value === 'function') returnValue.value = returnValue.value.call(this);
				break;
			default: returnValue.value = this[obj]['handles'][handle];
		}
		if (typeof returnValue.value === 'undefined') continue;
		returnValue.priority = returnValue.priority || 0;
		returnValue.source = this[obj];
		returnValues.push(returnValue);
		if () {
		
		}
	}
	if (this.self) delete this.self;
	//console.log(returnValues);
	returnValues.sort(function(a,b){
		return a.priority - b.priority;
	});
	if (returnArray) return returnValues.map(function(o){return o.value;});
	if (!returnValues.length) return false;
	return returnValues[0].value;
};*/
