// Initial Gender
// $(".genderIcon").text(Display.genderSymbols['m']);
$p1 = $( "#p1-pokemon" );
$p2 = $( "#p2-pokemon" );
// $p1 = $( "#p1-pokemon" );

// Initialize Dropdowns
Display.loadDropdowns();

// Add Handlers
// Species Handler
(function addHandlers() {
	$('.pkm-select').change(
		function () {
			Display.changePokemon($(this));
		}
	);
	var elements = [
		".level-input",
		".happiness-input",
		".gender-select",
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

	// Set Handler
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
})()

