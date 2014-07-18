// toID()
function toID(str) { return str.toLowerCase().replace(/[^a-z0-9]/g,''); }

// Data Definitions
Data = Data || exports || {};
Data.Pokedex = Data.BattlePokedex;
Data.Movedex = Data.BattleMovedex;
Data.Abilities = Data.BattleAbilities;
Data.Items = Data.BattleItems;
Data.Learnsets = Data.BattleLearnsets;
Data.StatTable = {
	hp:"HP",
	atk:"Atk",
	def:"Def",
	spa:"SpA",
	spd:"SpD",
	spe:"Spe"
};
Data.Statuses = { // Unfortunately we cant just nab this one from Pokemon Showdown :P
	brn:{name:'Burn'},
	par:{name:'Paralyze'},
	psn:{name:'Poison'},
	tox:{name:'Toxic'},
	slp:{name:'Sleep'},
	frz:{name:'Frozen'}
}
Data.Natures = {
	Adamant: {name:"Adamant", plus:'atk', minus:'spa'},
	Bashful: {name:"Bashful"},
	Bold: {name:"Bold", plus:'def', minus:'atk'},
	Brave: {name:"Brave", plus:'atk', minus:'spe'},
	Calm: {name:"Calm", plus:'spd', minus:'atk'},
	Careful: {name:"Careful", plus:'spd', minus:'spa'},
	Docile: {name:"Docile"},
	Gentle: {name:"Gentle", plus:'spd', minus:'def'},
	Hardy: {name:"Hardy"},
	Hasty: {name:"Hasty", plus:'spe', minus:'def'},
	Impish: {name:"Impish", plus:'def', minus:'spa'},
	Jolly: {name:"Jolly", plus:'spe', minus:'spa'},
	Lax: {name:"Lax", plus:'def', minus:'spd'},
	Lonely: {name:"Lonely", plus:'atk', minus:'def'},
	Mild: {name:"Mild", plus:'spa', minus:'def'},
	Modest: {name:"Modest", plus:'spa', minus:'atk'},
	Naive: {name:"Naive", plus:'spe', minus:'spd'},
	Naughty: {name:"Naughty", plus:'atk', minus:'spd'},
	Quiet: {name:"Quiet", plus:'spa', minus:'spe'},
	Quirky: {name:"Quirky"},
	Rash: {name:"Rash", plus:'spa', minus:'spd'},
	Relaxed: {name:"Relaxed", plus:'def', minus:'spe'},
	Sassy: {name:"Sassy", plus:'spd', minus:'spe'},
	Serious: {name:"Serious"},
	Timid: {name:"Timid", plus:'spe', minus:'atk'}
};

// Data Functions
Data.getLearnset = function(pokemon) {
	if (!Data.Learnsets) return null;
	if (!Data.Pokedex[pokemon]) return false;
	if (!Data.Learnsets[pokemon]) {
		pokemon = toID(Data.Pokedex[pokemon].baseSpecies);
	}
	if (!Data.Learnsets[pokemon].learnset) return false;
	return Data.Learnsets[pokemon].learnset;
};
