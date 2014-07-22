// Display Definitions
Display = {};

Display.genderSymbols = {m:'\u2642',f:'\u2640',n:'\u2205'};

// Display Functions
Display.resetElement = function ($el) {
	if (!($el instanceof jQuery)) return null;
	if ($el.length !== 1) return false;
	if (typeof $el.data("default") === 'undefined') return $el.val("")
	return $el.val($el.data("default"));
}
Display.clearAllFields = function ($side) {
	// if (this.$side) 
	if (!($side instanceof jQuery)) return null;
	var classes = [
		".pkm-select", // Species
		".level-input", // Level
		".happiness-input", // Happiness
		".gender-select", // Gender
		".type-select", // Types & Move Types
		".ability-select", // Ability
		".item-select", // Item
		".nature-select", // Nature
		".baseStat-input", // Stats
		".iv-input", 
		".ev-input", 
		".stat-input", 
		".boost-input", 
		".move-select", // Moves
		".bp-input", 
		".cat-select", 
		".pp-input"
	];
	var $elements = $side.find(classes.join(','));
	for (var i = 0; i < $elements.length; i++) Display.resetElement($elements.eq(i));
	return true;
}
Display.clearMoveField = function ($moveRow) {
	if (!($moveRow instanceof jQuery)) return null;
	var classes = [".move-select", ".type-select", ".bp-input", ".cat-select", ".pp-input"];
	var $elements = $moveRow.find(classes.join(','));
	for (var i = 0; i < $elements.length; i++) Display.resetElement($elements.eq(i));
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
	set.name = $side.find(".pkm-select option:selected").text();
	
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
Display.getMove = function ($moveRow) {
	if (!($moveRow instanceof jQuery)) return null;
	var move = {};
	// $moveRow = $side.find('#move-'+moveIndex);
	move.id = $moveRow.find(".move-select").val();
	move.name = $moveRow.find(".move-select option:selected").text();
	move.type = $moveRow.find(".type-select").val();
	move.basePower = $moveRow.find(".bp-input").val();
	move.category = $moveRow.find(".cat-select").val();
	move.pp = $moveRow.find(".pp-input").val();
	return move;
}
Display.showResult = function ($side1, $side2, moveIndex, damageNumbers) {
	if (!($side1 instanceof jQuery && $side2 instanceof jQuery)) return null;
	var moveName = ( typeof moveIndex === 'string' ? moveIndex : ( Display.getMove($side1.find('#move-'+moveIndex)) ? Display.getMove($side1.find('#move-'+moveIndex)).name : moveIndex ) );
	var atkMon = Display.getPokemon($p1);
	var defMon = Display.getPokemon($p2);
	var percentage = "(" + (Math.floor(damageNumbers[0]*1000/defMon.stats['hp'])/10) + "-" + (Math.floor(damageNumbers[15]*1000/defMon.stats['hp'])/10) + "%)";
	var range = ""+damageNumbers[0]+"-"+damageNumbers[15];
	$('#results-display').text(atkMon.set.name+"'s "+moveName+" vs "+defMon.set.name+" "+range+" "+percentage);
	$('#results-details').text(damageNumbers.join(', '));
}

