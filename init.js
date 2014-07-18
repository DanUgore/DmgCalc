// Initial Gender
// $(".genderIcon").text(Display.genderSymbols['m']);
$p1 = $( "#p1-pokemon" );
$p2 = $( "#p2-pokemon" );
// $p1 = $( "#p1-pokemon" );

// Initialize Dropdowns
(function loadDropdowns() {
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
			for (var id in Data.BattleMovedex) {
				var move = Data.BattleMovedex[id];
				if (id !== move.id) continue;
				options.push('<option value="'+move.id+'">'+(move.isNonstandard?'Custom: ':'')+move.name+'</option>');
			}
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
				'<option value="M">'+Display.genderSymbols['m']+'</option>',
				'<option value="F">'+Display.genderSymbols['f']+'</option>',
				'<option value="N">'+Display.genderSymbols['n']+'</option>'
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
					customs.push(id);
					continue;
				}
				options.push('<option value="'+id+'">'+pkm.species+'</option>');
			}
			for (var i = 0; i < customPkms.length; i++) {
				var id = customPkms[i];
				var pkm = Data.BattlePokedex[id];
				// Consider <optgroup label="Custom Pokemon"></optgroup>
				options.push('<option value="'+id+'">Custom: '+pkm.species+'</option>');
			}
			$dropdown.append(options.join(''));
			continue;
		}
	}
})();

// Set Default Data On Form Elements (<input>, <select>)
(function () {
	var $formElements = $('input, select');
	for (var i = 0; i < $formElements.length; i++) {
		if (typeof $formElements.eq(i).data("default") === 'undefined') $formElements.eq(i).data("default", "");
	}
})();

// Species Handler
$('.pkm-select').change(
	function () {
		$this = $(this);
		if (!$this.val()) return Display.clearAllFields($this.parent());
		Display.showPokemon($this.parent(), new Pokemon($this.val(), (Data.Sets[$this.val()] ? Data.Sets[$this.val()].sets[0] : null)));
	}
);

// Move Handlers
$('.move-select').change(
	function () {
		$this = $(this);
		if (!$this.val()) return Display.clearMoveFields($this.parents("tr"));
		Display.showMove($this.parents("tr"), $this.val());
	}
);

// Stat Handlers
// Terribly inefficient but this'll change later anyway lol
$('.ev-input, .iv-input').change(
	function () {
		$this = $(this);
		if (!$this.val()) return;
		Display.showPokemon($this.parents('.pokemon-pane'), Display.getPokemon($this.parents('.pokemon-pane')));
	}
);

// Bind event listeners
/*
function bindEvents($side) {
	if (!$side || $side !instanceof jQuery) return null;
	if (!$side.hasClass("pokemon-pane")) return false;
	$side.children("");
}
*/
// First P1
// Then P2
// Finally Misc Input