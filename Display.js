// Display Definitions
Display = {};

Display.genderSymbols = {M:'\u2642',F:'\u2640',N:'\u2205'};
Display.active = { // Caching Pokemon so we don't have to rebuild every time
	p1: null,
	p2: null
};

// Display Functions
Display.resetElement = function ($el) {
	if (!($el instanceof jQuery)) return null;
	if ($el.length !== 1) return false;
	if (typeof $el.data("default") === 'undefined') return $el.val("")
	return $el.val($el.data("default"));
}
Display.clearAllFields = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
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
	Display.loadGenders($side);
	Display.showPokemon(Display.getPokemon($side, true));
	return true;
}
Display.clearMoveField = function ($moveRow) {
	if (!($moveRow instanceof jQuery)) return null;
	var classes = [".move-select", ".type-select", ".bp-input", ".cat-select", ".pp-input"];
	var $elements = $moveRow.find(classes.join(','));
	for (var i = 0; i < $elements.length; i++) Display.resetElement($elements.eq(i));
	return true;
}
Display.changePokemon = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	if (!$side.val()) return Display.clearAllFields($side.parent());
	var side = $side.parent().attr('id').substr(0,2);
	Display.active[side] = new Pokemon($side.val());
	Display.active[side].side = side;
	Display.showPokemon(side, Display.active[side]);
	Display.loadSets(side);
	Display.updateCalcs();
}
Display.updatePokemon = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	var pkm = Display.getPokemon($side); // Pulls Pokemon from cache
	if (!pkm) return Display.showPokemon($side, Display.getPokemon($side, true));
	if (pkm.id !== $side.find(".pkm-select").val()) pkm = Display.getPokemon($side, true); // Species changed. Make a new Pokemon
	else pkm = pkm.updateDetails(Display.getSet($side));
	if (!pkm) return Display.clearAllFields();
	Display.showPokemon($side, pkm);
	Display.updateCalcs();
}
Display.changeSet = function ($side, set) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	Display.active;
}
Display.showPokemon = function ($side, pokemon) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
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
	$side.find(".ability-select").val(pokemon.ability);
	// Item
	$side.find(".item-select").val(pokemon.item);
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
		if (!move) move = {id:''};
		Display.showMove($row, move.id);
	}
	if (pokemon.side) this.active[pokemon.side] = pokemon;
	Display.reloadGenders($side);
	return true;
}
Display.showMove = function ($moveRow, move) {
	if (!($moveRow instanceof jQuery)) return null;
	var move = move.id || move;
	var move = Data.Movedex[move];
	if (!move) return Display.clearMoveField($moveRow);
	$moveRow.find(".move-select").val(move.id);
	$moveRow.find(".type-select").val(move.type);
	$moveRow.find(".bp-input").val(move.basePower);
	$moveRow.find(".cat-select").val(move.category);
	$moveRow.find(".pp-input").val(move.pp);
	return true;
}
Display.getPokemon = function ($side, makeNew) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	var side = $side.attr('id').substr(0,2);
	if (!makeNew) return this.active[side];
	// Species
	var species = $side.find(".pkm-select").val();
	if (!species) return false;
	var set = Display.getSet($side);
	Display.active[side] = new Pokemon(species, set);
	return Display.active[side];
}
Display.getSet = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
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
	// Side
	set.side = $side.attr('id').substr(0,2);
	
	return set;
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
Display.showResult = function ($atkSide, $defSide, moveIndex, damageNumbers) {
	var atkMon;
	var defMon;
	if (!($atkSide instanceof jQuery)) {
		if ($atkSide instanceof Pokemon) atkMon = $atkSide;
		else if ($atkSide in Display.active) $atkSide = $("#"+$atkSide+"-pokemon");
		else return null;
	}
	if (!($defSide instanceof jQuery)) {
		if ($defSide instanceof Pokemon) defMon = $defSide;
		else if ($defSide in Display.active) $defSide = $("#"+$defSide+"-pokemon");
		else return null;
	}
	atkMon = atkMon || Display.getPokemon($atkSide);
	defMon = defMon || Display.getPokemon($defSide);
	moveIndex = parseInt(moveIndex);
	if (isNaN(moveIndex)) return false;
	var moveName = ( atkMon === $atkSide ? ( Data.Movedex[atkMon.moveset[moveIndex]] ? Data.Movedex[atkMon.moveset[moveIndex]].name : atkMon.moveset[moveIndex] ) : ( Display.getMove($atkSide.find('#move-'+moveIndex)) ? Display.getMove($atkSide.find('#move-'+moveIndex)).name : "Unnamed Move" ) );
	var percentage = "(" + (Math.round(damageNumbers[0]*1000/defMon.stats['hp'])/10) + "-" + (Math.round(damageNumbers[15]*1000/defMon.stats['hp'])/10) + "%)";
	var range = ""+damageNumbers[0]+"-"+damageNumbers[15];
	var $resultBox = $("#"+atkMon.side+"-results > .result-move-"+moveIndex+" > .inner-results-container");
	$resultBox.children('.results-move-name').text(moveName);
	$resultBox.children('.results-move-damage').text(range+" "+percentage);
	return true;
}
Display.clearResult = function (side, index) {
	if (!(side in Display.active)) return null;
	$resultBox = $('#'+side+'-results > .result-move-'+index+' > .inner-results-container');
	$resultBox.children('.results-move-name').text('---');
	$resultBox.children('.results-move-damage').text('0-0 (0-0%)');
	return true;
}
Display.updateCalcs = function () {
	if (!$p1 && !$p2) return null;
	var $side;
	var p1active = Display.getPokemon($p1);
	var p2active = Display.getPokemon($p2);
	if (!p1active) return false;
	if (!p2active) return false;
	var p1results = [];
	var p2results = [];
	// P1
	for (var i = 0; i < p1active.moveset.length; i++) {
		if (!p1active.moveset[i]) {
			p1results.push(false);
			Display.clearResult('p1', i);
			continue;
		}
		p1results.push(
			Calc.calcDamageNumbers(p1active, p2active, p1active.moveset[i])/*,  field {} */
		);
		if (p1results[i]) Display.showResult(p1active, p2active, i, p1results[i]);
		else Display.clearResult('p1', i);
	}
	// P2
	for (var i = 0; i < p2active.moveset.length; i++) {
		if (!p2active.moveset[i]) {
			p2results.push(false);
			Display.clearResult('p2', i);
			continue;
		}
		p2results.push(
			Calc.calcDamageNumbers(p2active, p1active, p2active.moveset[i])/*,  field {} */
		);
		if (p2results[i]) Display.showResult(p2active, p1active, i, p2results[i]);
		else Display.clearResult('p2', i);
	}
}
Display.makeSetDropdown = function (pokemon) {
	if (pokemon instanceof Pokemon) pokemon = pokemon.id;
	pokemon = pokemon || '';
	var sets = Data.getSets(pokemon);
	var options = ['<option value="">Blank Set</option>'];
	for (var i = 0, set, tier; i < sets.length; i++) {
		set = sets[i];
		tier = set.tier || '';
		if (Data.Tiers[set.tier]) tier = Data.Tiers[set.tier].shortName || tier;
		options.push('<option value='+i+'>'+tier+': '+(set.name || 'Set '+i)+'</option>');
	}
	options.push('<option value="R">Random Moves</option>');
	return options;
}
Display.loadDropdowns = function () {
	$dropdowns = $( "select" );
	// console.log($dropdowns);
	for (var index = 0; index < $dropdowns.length; index++) {
		$dropdown = $dropdowns.eq(index);
		// if ($dropdown.children().length) continue;
		var options = []; // Option Elements to be Appended
		var customs = []; // Custom Option Elements
		if ($dropdown.hasClass("type-select")) {
			for (var type in Data.BattleTypeChart) options.push('<option value="'+type+'">'+type+'</option>');
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("move-select")) {
			var customMoves = [];
			for (var id in Data.BattleMovedex) {
				var move = Data.BattleMovedex[id];
				if (id !== move.id) continue;
				if (move.isNonstandard) {
					customMoves.push(id);
					continue;
				}
				options.push('<option value="'+move.id+'">'+move.name+'</option>');
			}
			options.push('<optgroup label="Custom Moves">');
			for (var i = 0; i < customMoves.length; i++) {
				var id = customMoves[i];
				var move = Data.BattleMovedex[id];
				options.push('<option value="'+id+'">'+move.name+'</option>');
			}
			options.push('</optgroup>');
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("cat-select")) {
			options = [
				'<option value="Physical">Physical</option>',
				'<option value="Special">Special</option>',
				'<option value="Status">Status</option>'
			];
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("ability-select")) {
			for (var id in Data.BattleAbilities) {
				var ability = Data.BattleAbilities[id];
				if (id !== ability.id) continue;
				options.push('<option value="'+ability.id+'">'+(ability.isNonstandard?'Custom: ':'')+ability.name+'</option>');
			}
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("item-select")) {
			for (var id in Data.BattleItems) {
				var item = Data.BattleItems[id];
				if (id !== item.id) continue;
				options.push('<option value="'+item.id+'">'+(item.isNonstandard?'Custom: ':'')+item.name+'</option>');
			}
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("nature-select")) {
			for (var id in Data.Natures) {
				var nature = Data.Natures[id];
				options.push('<option value="'+id+'">'+nature.name+'</option>');
			}
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("status-select")) {
			for (var id in Data.Statuses) {
				var status = Data.Statuses[id];
				options.push('<option value="'+id+'">'+status.name+'</option>');
			}
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("gender-select")) {
			options = [
				'<option value="M">'+Display.genderSymbols['M']+'</option>',
				'<option value="F">'+Display.genderSymbols['F']+'</option>',
				'<option value="N">'+Display.genderSymbols['N']+'</option>'
			];
			$dropdown.append(options.join(''));
			continue;
		}
		if ($dropdown.hasClass("pkm-select")) {
			// Pokemon are placed in alphabetical order for ease of location.
			var Pokedex = Data.BattlePokedex;
			var ids = Object.keys(Pokedex).sort();
			var customPkms = [];
			for (var i = 0; i < ids.length; i++) {
				var id = ids[i];
				var pkm = Data.BattlePokedex[id];
				if (!pkm.num || pkm.num < 1) {
					customPkms.push(id);
					continue;
				}
				options.push('<option value="'+id+'">'+pkm.species+'</option>');
			}
			options.push('<optgroup label="Custom Pokemon">');
			for (var i = 0; i < customPkms.length; i++) {
				var id = customPkms[i];
				var pkm = Data.BattlePokedex[id];
				// Consider <optgroup label="Custom Pokemon"></optgroup>
				options.push('<option value="'+id+'">'+pkm.species+'</option>');
			}
			options.push('</optgroup>');
			$dropdown.append(options.join(''));
			continue;
		}
	}
}
Display.loadSets = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	var pkm = Display.active[$side.attr('id').substr(0,2)];
	$side.children('.set-select').html(Display.makeSetDropdown(pkm.id));
}
Display.reloadGenders = function ($side) {
	if ($side in Display.active) $side = $("#"+$side+"-pokemon");
	if (!($side instanceof jQuery)) return null;
	var pkm = Display.active[$side.attr('id').substr(0,2)];
	var options;
	if (pkm.genderRatio) {
			options = [
				'<option value="M">'+Display.genderSymbols['M']+'</option>',
				'<option value="F">'+Display.genderSymbols['F']+'</option>',
			];
	}
	else if (pkm.gender) {
			options = [
				'<option value="'+pkm.gender+'">'+Display.genderSymbols[pkm.gender]+'</option>'
			];
	}
	else {
		options = [
			'<option value="M">'+Display.genderSymbols['M']+'</option>',
			'<option value="F">'+Display.genderSymbols['F']+'</option>',
			'<option value="N">'+Display.genderSymbols['N']+'</option>'
		];
	}
	$side.children('.gender-select').html(options.join(''));
}
Display.addHandlers = function () {
	$('.pkm-select').change(
		function () {
			Display.changePokemon($(this));
		}
	);
	var elements = [
		".level-input",
		".happiness-input",
		".gender-select",
		".ability-select",
		".item-select",
		".nature-select",
		".status-select",
		".ev-input",
		".iv-input",
		".move-select"
	]
	$(elements.join(', ')).change(
		function () {
			// $this = $(this);
			Display.updatePokemon($(this).parents('.pokemon-pane'));
		}
	);

	$('.set-select').change(
		function () {
			$this = $(this);
			var val = $this.val();
			var $side = $this.parent();
			pkm = Display.getPokemon($side);
			if (val === "") Display.showPokemon($side, pkm.resetDetails());
			else if (val === "R") Display.showPokemon($side, pkm.randomMoveset()); // Do stuff here later
			else {
				set = Data.getSets(pkm.id)[val];
				Display.showPokemon($side, pkm.changeSet(set));
			}
			Display.updateCalcs();
		}
	);
};

