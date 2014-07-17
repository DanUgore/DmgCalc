// Display Definitions
Display = {};

Display.genderSymbols = {m:'\u2642',f:'\u2640',n:'\u2205'};

// Display Functions
Display.clearAllFields = function ($side) {
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
	return true;
}
Display.clearMoveField = function ($moveRow) {
	if (!($moveRow instanceof jQuery)) return null;
	$moveRow.find(".moveSelect").val("--");
	$moveRow.find(".typeSelect").val("--");
	$moveRow.find(".bp-input").val("");
	$moveRow.find(".catSelect").val("Physical");
	$moveRow.find(".pp-input").val("");
	return true;
}
Display.showPokemon = function ($side, pokemon) {
	if (!($side instanceof jQuery)) return null;
	if (!(pokemon instanceof Pokemon)) return false;
	// Species
	$side.find(".pkmSelect").val(pokemon.id);
	// Level
	$side.find(".level-input").val(pokemon.level);
	// Happiness
	$side.find(".happiness-input").val(pokemon.happiness);
	// Gender
	$side.find(".genderSelect").val(pokemon.gender);
	// Types
	$side.find("#type1").val(pokemon.types[0]);
	if (pokemon.types[1]) $side.find("#type2").val(pokemon.types[1]);
	// Ability
	$side.find(".abilitySelect").val(pokemon.ability || "--");
	// Item
	$side.find(".itemSelect").val(pokemon.item || "--");
	// Nature
	$side.find(".natureSelect").val(pokemon.nature);
	// Stats
	// var $table = $side.children("#stats-table");
	for (var stat in pokemon.stats) {
		var $row = $side.find('#'+stat);
		if (!$row.length) continue;
		$row.find(".baseStat-input").val(pokemon.baseStats[stat]);
		$row.find(".iv-input").val(pokemon.ivs[stat]);
		$row.find(".ev-input").val(pokemon.evs[stat]);
		$row.find(".stat-input").val(pokemon.stats[stat]);
		$row.find(".boost-input").val(pokemon.boosts[stat]||0);
	}
	// Moves
	for (var i = 0; i < pokemon.moveset.length; i++) {
		var $row = $side.find('#move-'+i);
		if (!$row.length) continue;
		var move = Data.Movedex[pokemon.moveset[i]];
		if (!move) continue;
		Display.showMove($row, move.id);
	}
	return true;
}
Display.showMove = function ($moveRow, move) {
	if (!($moveRow instanceof jQuery)) return null;
	var move = move.id || move;
	var move = Data.Movedex[move];
	if (!move) return false;
	$moveRow.find(".moveSelect").val(move.id);
	$moveRow.find(".typeSelect").val(move.type);
	$moveRow.find(".bp-input").val(move.basePower);
	$moveRow.find(".catSelect").val(move.category);
	$moveRow.find(".pp-input").val(move.pp);
	return true;
}
Display.getPokemon = function ($side) {
	if (!($side instanceof jQuery)) return null;
	// Species
	var species = $side.find(".pkmSelect").val();
	var set = {};
	// Level
	set.level = $side.find(".level-input").val();
	// Happiness
	set.happiness = $side.find(".happiness-input").val();
	// Gender
	set.gender = $side.find(".genderSelect").val();
	// Types
	set.types = [$side.find("#type1").val()]
	if ($side.find("#type2").val() !== "--") set.types.push($side.find("#type2").val());
	// Ability
	set.ability = ($side.find(".abilitySelect").val() !== "--") ? $side.find(".abilitySelect").val() : "";
	// Item
	set.item = ($side.find(".itemSelect").val() !== "--") ? $side.find(".itemSelect").val() : "";
	// Nature
	set.nature = $side.find(".natureSelect").val();
	// Stats
	// var $table = $side.children("#stats-table");
	for (var stat in pokemon.stats) {
		var $row = $side.find('#'+stat);
		if (!$row.length) continue;
		$row.find(".baseStat-input").val(pokemon.baseStats[stat]);
		$row.find(".iv-input").val(pokemon.ivs[stat]);
		$row.find(".ev-input").val(pokemon.evs[stat]);
		$row.find(".stat-input").val(pokemon.stats[stat]);
		$row.find(".boost-input").val(pokemon.boosts[stat]||0);
	}
	// Moves
	for (var i = 0; i < pokemon.moveset.length; i++) {
		var $row = $side.find('#move-'+i);
		if (!$row.length) continue;
		var move = Data.Movedex[pokemon.moveset[i]];
		if (!move) continue;
		Display.showMove($row, move.id);
	}
	return true;
}

