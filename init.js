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
		".iv-input"
	]
	$(elements.join(', ')).change(
		function () {
			// $this = $(this);
			Display.updatePokemon($(this).parents('.pokemon-pane'));
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

	// Set Handler
	$('.set-select').change(
		function () {
			$this = $(this);
			var val = $this.val();
			if (val === "") return Display.clearAllFields();
			var $side = $this.parent();
			pkm = Display.getPokemon($side);
			if (val === "R") return; // Do stuff here later
			set = Data.getSets(pkm.id)[val];
			Display.showPokemon($side, Display.getPokemon($side).changeSet(set));
		}
	);
})()

