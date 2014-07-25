// Initial Gender
// $(".genderIcon").text(Display.genderSymbols['m']);
$p1 = $( "#p1-pokemon" );
$p2 = $( "#p2-pokemon" );
// $p1 = $( "#p1-pokemon" );

// Initialize Dropdowns
Display.loadDropdowns();

// Add Handlers
// Validate Input
// Validator
$('select, input').each(Validator.addValidator);
// Update Display
Display.addHandlers();

