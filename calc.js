Calc = {};

Calc.getDamageNumbers = function (attacker, defender, move, args) {
	// Move
	if (typeof move === 'string') move = Data.Movedex[move]; // Calc.getMove(move)
	if (move.category === 'Status') return;
	// Clone attacker, defender, and move.
	attacker = $.extend(true, {}, attacker);
	defender = $.extend(true, {}, defender);
	move = $.extend(true, {}, move);
	
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
	
	// Base Damage
	baseDamage = (Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * move.basePower * attackStat / defendStat) / 50) + 2);
	damage = baseDamage;
	
	// Spread?
	// TODO
	
	// Weather?
	// TODO
	
	// Crit?
	damage = (move.crit ? this.modify(damage, 0x1800) : damage);
	
	// Random Factor Begins To Apply Here
	// Store other variables for calculations in loop
	
	// STAB
	var hasSTAB = false;
	for (var i = 0; i < attacker.types.length && !hasSTAB; i++) {
		if (move.type === attacker.types[i]) hasSTAB = true;
	}
	var stabMod = (hasSTAB ? 0x1800 : 0x0000);
	
	// Type Effectiveness
	var typeEff = 1;
	typeEff *= Calc.compareTypes(move.type, defender.types, (move.ignoreImmunities || ability.ignoreImmunities)); // TODO: Work out a way to modify effectiveness
	
	// Burn
	var burnEffect = false;
	if (attacker.status === 'brn') burnEffect = true;
	
	// Final Mods
	// TODO
	
	// Loop through damage rolls
	var damageNumbers = [];
	for (var dmgRoll = 15; damageNumbers.length < 16; dmgRoll--) {
		var rolledDamage = Math.floor(damage * (100 - dmgRoll) / 100);
		rolledDamage = this.modify(rolledDamage, stabMod);
		rolledDamage *= typeEff;
		if (burnEffect) rolledDamage = Math.floor(rolledDamage/2);
		// Final Modifier
		damageNumbers.push(rolledDamage);
	}
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
	return eff;
}
