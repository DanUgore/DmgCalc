// Define Pokemon Object. Requires `Data` to be defined. (pre-init.js)

function Pokemon(name, set) {
	this.id = toID(name);
	if (!this.id) return false;
	var set = set || {item:"",ability:"",ivs:{},evs:{}};
	for (var prop in Data.Pokedex[this.id]) this[prop] = Data.Pokedex[this.id][prop];
	this.set = {ivs:{},evs:{}};
	for (var prop in set) this.set[prop] = set[prop];
	this.item = toID(this.set.item || (this.set.items && this.set.items[0]) || "");
	this.ability = toID(this.set.ability || (this.set.abilities && this.set.abilities[0]) || this.abilities[0]);
	this.nature = this.set.nature || (this.set.natures && this.set.natures[0]) || "Docile";
	this.level = parseInt(this.set.level) || 100;
	var statTable = {"hp" : "HP","atk" : "Atk","def" : "Def","spa" : "SpA","spd" : "SpD","spe" : "Spe"}
	this.ivs = {}; this.evs = {};
	this.baseStats = this.baseStats || {};
	this.boosts = this.set.boosts || {};
	for (var stat in statTable) {
		this.baseStats[stat] = parseInt(this.baseStats[stat]) || 10;
		this.ivs[stat] = parseInt(this.set.ivs[stat]) || 31;
		this.evs[stat] = parseInt(this.set.evs[stat]) || 0;
		if (stat !== 'hp') this.boosts[stat] = parseInt(this.boosts[stat]) || 0;
	}
	this.calcStats();
	this.moveset = (this.set.moveset || this.randomMoveset() || []).slice(0,4).map(toID);
	while (this.moveset.length < 4) this.moveset.push('');
	if (!this.genderRatio && !this.gender) this.genderRatio = {M:0.5,F:0.5};
	this.gender = this.gender || this.set.gender || this.randomGender();
	var hpTypes = ["Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark"];
	var hpTypeIndex = Math.floor(parseInt(function() { var buf = ""; buf += ''+(this.ivs[stat] % 2) ; return buf; }, 2) * 15 / 63)
	this.hpType = hpTypes[hpTypeIndex];
	this.hpPower = 60; //Math.floor(parseInt(function() { var buf = ""; for (var stat in statTable) { buf += ''+((this.ivs[stat] & 2) / 2) }; return buf; }, 2) * 40 / 63 + 30)
	this.status = this.set.status || "";
	this.currentHP = parseInt(this.set.currentHP || this.stats['hp']);
};

Pokemon.prototype.changeSet = function(set) {
	set = set || {item:"",ability:"",ivs:{},evs:{}};
	this.set = {};
	for (var prop in set) this.set[prop] = set[prop];
	this.item = toID(this.set.item || (this.set.items && this.set.items[0]) || "");
	this.ability = toID(this.set.ability || (this.set.abilities && this.set.abilities[0]) || this.abilities[0]);
	this.nature = this.set.nature || "Docile";
	this.level = this.set.level || 100;
	var statTable = {"hp" : "HP" , "atk" : "Atk" , "def" : "Def" , "spa" : "SpA" , "spd" : "SpD" , "spe" : "Spe"};
	this.ivs = {}; this.evs = {};
	for (var stat in statTable) {
		this.baseStats[stat] = this.baseStats[stat] || 10;
		this.ivs[stat] = this.set.ivs[stat] || 31;
		this.evs[stat] = this.set.evs[stat] || 0;
	}
	this.moveset = (this.set.moveset || ["","","",""]).map(toID);
};
Pokemon.prototype.calcStats = function() {
	this.stats = {};
	for (var stat in {"hp":"HP","atk":"Atk","def":"Def","spa":"SpA","spd":"SpD","spe":"Spe"}) {
		if (stat === 'hp') this.stats[stat] = (this.baseStats[stat] === 1 ? 1 : Math.floor(Math.floor(2*this.baseStats[stat] + this.ivs[stat] + this.evs[stat]/4) * this.level/100) + this.level + 10);
		else {
			var nature = Data.Natures[this.nature];
			var natureBoost = (nature.plus === stat ? 1.1 : (nature.minus === stat ? 0.9 : 1));
			this.stats[stat] = Math.floor(Math.floor(Math.floor(2*this.baseStats[stat] + this.ivs[stat] + this.evs[stat]/4) * this.level/100 + 5) * natureBoost);
		}
	}
}
Pokemon.prototype.randomGender = function () {
	if (!this.genderRatio) return this.gender || "N";
	return (Math.floor(Math.random()*0x100)/0x100 < this.genderRatio['M'] ? 'F' : 'M');
};
Pokemon.prototype.randomMoveset = function() {
	if (!Data.getLearnset) return null;
	var lset = Data.getLearnset(this.id);
	if (!lset) return false;
	var moves = Object.keys(lset['sketch'] ? Data.Movedex : lset);
	var randSet = [];
	for (var i = 0; i < 4; i++) {
		randSet.push(moves[parseInt(Math.random()*moves.length)]);
	}
	return randSet;
};
Pokemon.prototype.resetDetails = function() {
	var newPoke = new Pokemon(this.id);
	for (var prop in newPoke) this[prop] = newPoke[prop];
};
Pokemon.prototype.update = function() {
	this.calcStats();
};
