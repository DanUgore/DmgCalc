Validator = {};

Validator.addValidator = function (index, el) { // This function is called in $().each(). The first arg will be an index. Though we dont need it
	$el = $(el);
	// Add function by tag name.
	switch ($el.prop('tagName')) {
		case 'INPUT':
			switch ($el.attr('type')) {
				case 'number':	$el.change(Validator.validateNumber);
			}
			break;
		case 'SELECT':
			$el.change(Validator.validateSelection); break;
	}
}
Validator.validateNumber = function () {
	var $this = $(this);
	var val = parseInt($this.val(),10);
	if (isNaN(val)) val = $this.data('default');
	var min = parseInt($this.attr('min')) || 0;
	var max = parseInt($this.attr('max')) || 0;
	if (val < min) val = min;
	else if (val > max) val = max;
	$this.val(val);
}
Validator.validateSelection = function () {
	$this = $(this);
	var val = $this.val();
	var invalid = true;
	var validOptions = $this.children().map(function(i,o){return $(o).val();});
	for (var i = 0; i < validOptions.length && invalid; i++) {
		if (val === validOptions[i]) invalid = false;
	}
	if (invalid) $this.val($this.data('default'));
}