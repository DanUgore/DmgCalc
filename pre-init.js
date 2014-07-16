// toID()
function toID(str) { return str.toLowerCase().replace(/[^a-z0-9]/g,''); }

// Data
Data.Pokedex = Data.BattlePokedex;
Data.Movedex = Data.BattleMovedex;
Data.Abilities = Data.BattleAbilities;
Data.Items = Data.BattleItems;
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

// Contains pre-initialization code to be run
Display = {};

Display.genderSymbols = {m:'\u2642',f:'\u2640',n:'\u2205'};
Display.clearFields = function ($side) {
	// if (this.$side) 
	if (!($side instanceof jQuery)) return null;
	// Species
	$side.find(".pkmSelect").val("--");
	// Level
	$side.find(".level-input").val(100);
	// Happiness
	$side.find(".happiness-input").val(255);
	// Gender
	$side.find(".genderSelect").val("M");
	// Types
	$side.find("#type1").val("Bug");
	$side.find("#type2").val("--");
	// Ability
	$side.find(".abilitySelect").val("--");
	// Item
	$side.find(".itemSelect").val("--");
	// Nature
	$side.find(".natureSelect").val("--");
	// Stats
	// var $table = $side.children("#stats-table");
	for (var stat in Data.StatTable) {
		var $row = $side.find('#'+stat);
		if (!$row.length) continue;
		$row.find(".baseStat-input").val("");
		$row.find(".iv-input").val("");
		$row.find(".ev-input").val("");
		$row.find(".stat-input").val("");
		$row.find(".boost-input").val("");
	}
	// Moves
	for (var i = 0; i < 4; i++) {
		var $row = $side.find('#move-'+i);
		if (!$row.length) continue;
		$row.find(".moveSelect").val("--");
		$row.find(".typeSelect").val("--");
		$row.find(".bp-input").val("");
		$row.find(".catSelect").val("Physical");
		$row.find(".pp-input").val("");
	}
}
