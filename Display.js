// Display Definitions
Display = {};

Display.genderSymbols = {m:'\u2642',f:'\u2640',n:'\u2205'};

// Display Functions
Display.clearAllFields = function ($side) {
	// if (this.$side) 
	if (!($side instanceof jQuery)) return null;
	// Species
	$side.find(".pkm-select").val("--");
	// Level
	$side.find(".level-input").val(100);
	// Happiness
	$side.find(".happiness-input").val(255);
	// Gender
	$side.find(".gender-select").val("M");
	// Types
	$side.find("#type1").val("Bug");
	$side.find("#type2").val("--");
	// Ability
	$side.find(".ability-select").val("--");
	// Item
	$side.find(".item-select").val("--");
	// Nature
	$side.find(".nature-select").val("--");
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
		$row.find(".move-select").val("--");
		$row.find(".type-select").val("--");
		$row.find(".bp-input").val("");
		$row.find(".cat-select").val("Physical");
		$row.find(".pp-input").val("");
	}
	return true;
}
Display.clearMoveField = function ($moveRow) {
	if (!($moveRow instanceof jQuery)) return null;
	$moveRow.find(".move-select").val("--");
	$moveRow.find(".type-select").val("--");
	$moveRow.find(".bp-input").val("");
	$moveRow.find(".cat-select").val("Physical");
	$moveRow.find(".pp-input").val("");
	return true;
}
Display.showPokemon = function ($side, pokemon) {
	if (!($side instanceof jQuery)) return null;
	if (!(pokemon instanceof Pokemon)) return false;
	// Species
	$side.find(".pkm-select").val(pokemon.id);
	// Level
	$side.find(".level-input").val(pokemon.level);
	// Happiness
	$side.find(".happiness-input").val(pokemon.happiness);
	// Gender
	$side.find(".gender-select").val(pokemon.gender);
	// Types
	$side.find("#type1").val(pokemon.types[0]);
	if (pokemon.types[1]) $side.find("#type2").val(pokemon.types[1]);
	// Ability
	$side.find(".ability-select").val(pokemon.ability || "--");
	// Item
	$side.find(".item-select").val(pokemon.item || "--");
	// Nature
	$side.find(".nature-select").val(pokemon.nature);
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
	$moveRow.find(".move-select").val(move.id);
	$moveRow.find(".type-select").val(move.type);
	$moveRow.find(".bp-input").val(move.basePower);
	$moveRow.find(".cat-select").val(move.category);
	$moveRow.find(".pp-input").val(move.pp);
	return true;
}
Display.getPokemon = function ($side) {
	if (!($side instanceof jQuery)) return null;
	// Species
	var species = $side.find(".pkm-select").val();
	if (!species) return false;
	var set = {};
	// Level
	set.level = $side.find(".level-input").val();
	// Happiness
	set.happiness = $side.find(".happiness-input").val();
	// Gender
	set.gender = $side.find(".gender-select").val();
	// Types
	set.types = [$side.find("#type1").val()]
	if ($side.find("#type2").val()) set.types.push($side.find("#type2").val());
	// Status
	set.status = $side.find(".status-select").val();
	// Ability
	set.ability = $side.find(".ability-select").val();
	// Item
	set.item = $side.find(".item-select").val();
	// Nature
	set.nature = $side.find(".nature-select").val();
	// Stats
	// var $table = $side.children("#stats-table");
	set.ivs = {};
	set.evs = {};
	for (var stat in Data.StatTable) {
		var $row = $side.find('#'+stat);
		if (!$row.length) continue;
		set.ivs[stat] = $row.find(".iv-input").val();
		set.evs[stat] = $row.find(".ev-input").val();
		if (stat !== "hp" && $row.find(".boost-input").val()) if (set.boosts || (set.boosts = {})) set.boosts[stat] = $row.find(".boost-input").val();
	}
	// Moves
	set.moveset = ['','','',''];
	for (var i = 0; i < 4; i++) {
		var $row = $side.find('#move-'+i);
		if (!$row.length) continue;
		set.moveset[i] = $row.find(".move-select").val()
	}
	return new Pokemon(species, set);
}

