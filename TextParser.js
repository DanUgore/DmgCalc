TextParser = {
	parseSetText: function (text) { // Simulator Import
		var text = text.split("\n");
		var curSet = {name: '', species: '', gender: ''};
		for (var i=0; i<text.length; i++) {
			var line = text[i].trim();
			if (!i) {
				var atIndex = line.lastIndexOf(' @ ');
				if (atIndex !== -1) {
					curSet.item = toID(line.substr(atIndex+3));
					line = line.substr(0, atIndex);
				}
				if (line.substr(line.length-4) === ' (M)') {
					curSet.gender = 'M';
					line = line.substr(0, line.length-4);
				}
				if (line.substr(line.length-4) === ' (F)') {
					curSet.gender = 'F';
					line = line.substr(0, line.length-4);
				}
				var parenIndex = line.lastIndexOf(' (');
				if (line.substr(line.length-1) === ')' && parenIndex !== -1) {
					line = line.substr(0, line.length-1);
					curSet.species = Data.Pokedex[toID(line.substr(parenIndex+2))].species; console.log(line.substr(parenIndex+2));
					line = line.substr(0, parenIndex);
					curSet.name = line;
				} else {
					curSet.species = Data.Pokedex[toID(line)].species; console.log(line)
					curSet.name = curSet.species;
				}
			} else if (line.substr(0, 7) === 'Trait: ') {
				line = line.substr(7);
				curSet.ability = toID(line);
			} else if (line.substr(0, 9) === 'Ability: ') {
				line = line.substr(9);
				curSet.ability = toID(line);
			} else if (line === 'Shiny: Yes') {
				curSet.shiny = true;
			} else if (line.substr(0, 7) === 'Level: ') {
				line = line.substr(7);
				curSet.level = +line;
			} else if (line.substr(0, 11) === 'Happiness: ') {
				line = line.substr(11);
				curSet.happiness = +line;
			} else if (line.substr(0, 9) === 'Ability: ') {
				line = line.substr(9);
				curSet.ability = toID(line);
			} else if (line.substr(0, 5) === 'EVs: ') {
				line = line.substr(5);
				var evLines = line.split('/');
				curSet.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
				for (var j=0; j<evLines.length; j++) {
					var evLine = $.trim(evLines[j]);
					var spaceIndex = evLine.indexOf(' ');
					if (spaceIndex === -1) continue;
					var statid = Data.StatIDs[evLine.substr(spaceIndex+1)];
					var statval = parseInt(evLine.substr(0, spaceIndex));
					if (!statid) continue;
					curSet.evs[statid] = statval;
				}
			} else if (line.substr(0, 5) === 'IVs: ') {
				line = line.substr(5);
				var ivLines = line.split(' / ');
				curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
				for (var j=0; j<ivLines.length; j++) {
					var ivLine = ivLines[j];
					var spaceIndex = ivLine.indexOf(' ');
					if (spaceIndex === -1) continue;
					var statid = Data.StatIDs[ivLine.substr(spaceIndex+1)];
					var statval = parseInt(ivLine.substr(0, spaceIndex));
					if (!statid) continue;
					curSet.ivs[statid] = statval;
				}
			} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
				var natureIndex = line.indexOf(' Nature');
				if (natureIndex === -1) natureIndex = line.indexOf(' nature');
				if (natureIndex === -1) continue;
				line = line.substr(0, natureIndex);
				curSet.nature = line;
			} else if (line.substr(0,1) === '-' || line.substr(0,1) === '~') {
				line = line.substr(1);
				if (line.substr(0,1) === ' ') line = line.substr(1);
				if (!curSet.moveset) curSet.moveset = [];
				if (line.substr(0,14) === 'Hidden Power [') {
					var hptype = line.substr(14, line.length-15);
					line = 'Hidden Power ' + hptype;
					if (!curSet.ivs && Data.TypeChart) {
						curSet.ivs = {};
						for (var stat in Data.TypeChart[hptype].HPivs) {
							curSet.ivs[stat] = Data.TypeChart[hptype].HPivs[stat];
						}
					}
				}
				if (line === 'Frustration') {
					curSet.happiness = 0;
				}
				curSet.moveset.push(toID(line));
			}
		}
		return curSet;
	},
	exportSetToText: function (set) { // Simulator Export
		var text = '';
		var curSet = set;
		if (curSet.name && curSet.name !== curSet.species) {
			text += ''+curSet.name+' ('+curSet.species+')';
		} else {
			text += ''+curSet.species;
		}
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item && Data.Items[curSet.item]) {
			text += ' @ '+Data.Items[curSet.item].name;
		}
		text += "\n";
		if (curSet.ability && Data.Abilities[curSet.ability]) {
			text += 'Ability: '+Data.Abilities[curSet.ability].name+"\n";
		}
		if (curSet.level && curSet.level != 100) {
			text += 'Level: '+curSet.level+"\n";
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes\n';
		}
		if (typeof curSet.happiness === 'number' && curSet.happiness !== 255) {
			text += 'Happiness: '+curSet.happiness+"\n";
		}
		var first = true;
		if (curSet.evs) {
			for (var j in Data.StatTable) {
				if (!curSet.evs[j]) continue;
				if (first) {
					text += 'EVs: ';
					first = false;
				} else {
					text += ' / ';
				}
				text += ''+curSet.evs[j]+' '+Data.StatTable[j];
			}
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.nature) {
			text += ''+curSet.nature+' Nature'+"\n";
		}
		var first = true;
		if (curSet.ivs) {
			var defaultIvs = true;
			var hpType = false;
			for (var j=0; j<curSet.moveset.length; j++) {
				var move = curSet.moveset[j];
				if (move.substr(0,11) === 'hiddenpower' && move.length > 11) {
					hpType = move.charAt(12).toUpperCase() + move.substr(13);
					if (!Data.TypeChart[hpType].HPivs) {
						alert("That is not a valid Hidden Power type.");
						continue;
					}
					for (var stat in Data.StatTable) {
						if ((curSet.ivs[stat]===undefined?31:curSet.ivs[stat]) !== (Data.TypeChart[hpType].HPivs[stat]||31)) {
							defaultIvs = false;
							break;
						}
					}
				}
			}
			if (defaultIvs && !hpType) {
				for (var stat in Data.StatTable) {
					if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined) {
						defaultIvs = false;
						break;
					}
				}
			}
			if (!defaultIvs) {
				for (var stat in Data.StatTable) {
					if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += ''+curSet.ivs[stat]+' '+Data.StatTable[stat];
				}
			}
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.moveset) {
			for (var j=0; j<curSet.moveset.length; j++) {
				var move = Data.Movedex[curSet.moveset[j]] ? Data.Movedex[curSet.moveset[j]].name : curSet.moveset[j];
				if (move.substr(0,13) === 'Hidden Power ') {
					move = move.substr(0,13) + '[' + move.substr(13) + ']';
				}
				text += '- '+move+"\n";
			}
		}
		text += "\n";
		return text;
	},
	parseCustomFormat: function (text) { // Read Custom Data Text
		var content = text.replace(/\n\s*/g,'').split(':'); // Removes newlines \n and leading spaces \s* after newlines.
		var commands = {};
		for (var i = 0, depth = 0, levels = []; i < content.length; i++) {
			var arg = content[i].trim();
			if (!arg) { // "" means consecutive. Go down one level.
				depth++;
				continue;
			}
			if (!levels[depth-1]) depth = 0; // If we go down but there were no levels above use... then we must be at the top.
			if (!depth) { // Make New Property
				addLevel(commands, arg, true);
				levels = [arg];
				continue;
			}
			// TRAVERSING THE DEPTHS!!!
			var currentLevel = commands;
			for (var d = 0; d < depth-1; d++) {
				if (typeof currentLevel[levels[d]] !== 'object') { // parent[level] = value
					var val = currentLevel[levels[d]];
					currentLevel[levels[d]] = {};
					currentLevel[levels[d]][val] = true;
					currentLevel = currentLevel[levels[d]];
					continue;
				}
				if (Array.isArray(currentLevel[levels[d]])) { // parent[level] = []
					if (typeof currentLevel[levels[d]][currentLevel[levels[d]].length-1] !== 'object') { // parent[level][N] = value
						var val = currentLevel[levels[d]][currentLevel[levels[d]].length-1];
						currentLevel[levels[d]][currentLevel[levels[d]].length-1] = {};
						currentLevel[levels[d]][currentLevel[levels[d]].length-1][val] = true;
						currentLevel = currentLevel[levels[d]][currentLevel[levels[d]].length-1];
					} else {
						currentLevel = currentLevel[levels[d]][currentLevel[levels[d]].length-1];
					}
				} else {
					currentLevel = currentLevel[levels[d]];
				}
			}
			// parent = true | make parent = child
			// parent = child | make parent = {child:[true, true]}
			// parent = value | make parent = {value: true,child: true}
			if (typeof currentLevel[levels[depth-1]] !== 'object') { // parent = someVal
				if (currentLevel[levels[depth-1]] === true) { // parent = true
					currentLevel[levels[depth-1]] = arg;
				} else { // parent = value
					var val = currentLevel[levels[depth-1]];
					currentLevel[levels[depth-1]] = {};
					currentLevel[levels[depth-1]][val] = true;
					if (currentLevel[levels[depth-1]][arg]) currentLevel[levels[depth-1]][arg] = [val, true];
					else {
						currentLevel[levels[depth-1]][val] = true;
						currentLevel[levels[depth-1]][arg] = true;
					}
				}
			}
			else if (Array.isArray(currentLevel[levels[depth-1]])) { // parent = []
				var n = currentLevel[levels[depth-1]].length-1
				if (typeof currentLevel[levels[depth-1]][n] !== 'object') { // parent[n] = true or parent[n] = value
					if (currentLevel[levels[depth-1]][n] === true) { // parent[n] 
						currentLevel[levels[depth-1]][n] = arg;
					} else { // parent[n] = value
						var val = currentLevel[levels[depth-1]][n];
						currentLevel[levels[depth-1]][n] = {};
						addLevel(currentLevel[levels[depth-1]][n], val);
						addLevel(currentLevel[levels[depth-1]][n], arg);
					}
				} else {
					addLevel(currentLevel[levels[depth-1]][n], arg);
				}
			} else {
				addLevel(currentLevel[levels[depth-1]], arg);
			}
			levels[depth] = arg;
			depth = 0;
		}
		return commands; // Return the object built from the parsed text
		
		// Define addLevel() function
		// Eases the headache of rewriting this code a lot.
		function addLevel(parent, child, topLevel) {
			// topLevel is a bool to indicate whether our parent is the `commands` object.
			if (topLevel) {
				if (!parent[child]) parent[child] = true; // child: undefined
				else if (typeof parent[child] === 'object' && Array.isArray(parent[child])) parent[child].push(true); // child: []
				else parent[child] = [parent[child], true]; // child: value
			} else {
				// parent = [...] | make parent = [...,child]
				// parent = {} | make parent[child] = true
				// parent = {child:true} | make parent[child] = [true, true]
				if (!parent[child]) { // parent = {...} | make parent[child] = true
					parent[child] = true;
				} else if (typeof parent[child] !== 'object') { // parent[child] = ... | make parent[child] = [..., true]
					var val = parent[child]; 
					parent[child] = {};
					parent[child] = [val, true];
				} else if (Array.isArray(parent[child])) {
					parent[child].push(true);
				} else {
					parent[child] = [parent[child], true];
				}
			}
		};
	},
	objectToText: function (obj, minimize) { // Write Custom Data Text
		obj = (typeof obj === 'object' ? obj : {});
		minimize = !!minimize;
		var text = objToText(obj, 0);
		if (minimize) return text.replace(/\n/g, '');
		return text;
		function objToText(parent, depth) {
			var text = '';
			var marker = ':';
			for (var i = 0; i < depth; i++) marker += ':';
			if (parent === '') return '\n';
			if (typeof parent !== 'object') {
				text += marker + parent + '\n';
				return text;
			}
			var keys = Object.keys(parent);
			for (var i = 0, key, val; i < keys.length; i++) {
				key = keys[i];
				text += marker + key;
				val = parent[key];
				if (val === true) continue;
				if (typeof val !== 'object') {
					text += objToText(val, depth+1);
					continue;
				}
				if (Array.isArray(val)) {
					if (typeof val[0] === 'object') text += '\n';
					text += objToText(val[0], depth+1);
					for (var j = 1; j < val.length; j++) {
						text += marker + key;
						text += objToText(val[j], depth+1);
						continue;
					}
					continue;
				}
				else { // Is object and not array
					text += '\n' + objToText(val, depth+1);
				}
			}
			return text;
		}
	}
};
/*
		toText: function(team) {
			var text = '';
			for (var i=0; i<team.length; i++) {
				var curSet = team[i];
				if (curSet.name !== curSet.species) {
					text += ''+curSet.name+' ('+curSet.species+')';
				} else {
					text += ''+curSet.species;
				}
				if (curSet.gender === 'M') text += ' (M)';
				if (curSet.gender === 'F') text += ' (F)';
				if (curSet.item) {
					text += ' @ '+curSet.item;
				}
				text += "\n";
				if (curSet.ability) {
					text += 'Ability: '+curSet.ability+"\n";
				}
				if (curSet.level && curSet.level != 100) {
					text += 'Level: '+curSet.level+"\n";
				}
				if (curSet.shiny) {
					text += 'Shiny: Yes\n';
				}
				if (typeof curSet.happiness === 'number' && curSet.happiness !== 255) {
					text += 'Happiness: '+curSet.happiness+"\n";
				}
				var first = true;
				if (curSet.evs) {
					for (var j in BattleStatNames) {
						if (!curSet.evs[j]) continue;
						if (first) {
							text += 'EVs: ';
							first = false;
						} else {
							text += ' / ';
						}
						text += ''+curSet.evs[j]+' '+BattleStatNames[j];
					}
				}
				if (!first) {
					text += "\n";
				}
				if (curSet.nature) {
					text += ''+curSet.nature+' Nature'+"\n";
				}
				var first = true;
				if (curSet.ivs) {
					var defaultIvs = true;
					var hpType = false;
					for (var j=0; j<curSet.moves.length; j++) {
						var move = curSet.moves[j];
						if (move.substr(0,13) === 'Hidden Power ' && move.substr(0,14) !== 'Hidden Power [') {
							hpType = move.substr(13);
							if (!exports.BattleTypeChart[hpType].HPivs) {
								alert("That is not a valid Hidden Power type.");
								continue;
							}
							for (var stat in BattleStatNames) {
								if ((curSet.ivs[stat]===undefined?31:curSet.ivs[stat]) !== (exports.BattleTypeChart[hpType].HPivs[stat]||31)) {
									defaultIvs = false;
									break;
								}
							}
						}
					}
					if (defaultIvs && !hpType) {
						for (var stat in BattleStatNames) {
							if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined) {
								defaultIvs = false;
								break;
							}
						}
					}
					if (!defaultIvs) {
						for (var stat in BattleStatNames) {
							if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
							if (first) {
								text += 'IVs: ';
								first = false;
							} else {
								text += ' / ';
							}
							text += ''+curSet.ivs[stat]+' '+BattleStatNames[stat];
						}
					}
				}
				if (!first) {
					text += "\n";
				}
				if (curSet.moves) for (var j=0; j<curSet.moves.length; j++) {
					var move = curSet.moves[j];
					if (move.substr(0,13) === 'Hidden Power ') {
						move = move.substr(0,13) + '[' + move.substr(13) + ']';
					}
					text += '- '+move+"\n";
				}
				text += "\n";
			}
			return text;
		}
*/
/*
TextParser.parseTeamText = function (text) {
	var text = text.split("\n");
	var team = [];
	var curSet = null;
	for (var i=0; i<text.length; i++) {
		var line = $.trim(text[i]);
		if (line === '' || line === '---') {
			curSet = null;
		} else if (!curSet) {
			curSet = {name: '', species: '', gender: ''};
			team.push(curSet);
			var atIndex = line.lastIndexOf(' @ ');
			if (atIndex !== -1) {
				curSet.item = line.substr(atIndex+3);
				line = line.substr(0, atIndex);
			}
			if (line.substr(line.length-4) === ' (M)') {
				curSet.gender = 'M';
				line = line.substr(0, line.length-4);
			}
			if (line.substr(line.length-4) === ' (F)') {
				curSet.gender = 'F';
				line = line.substr(0, line.length-4);
			}
			var parenIndex = line.lastIndexOf(' (');
			if (line.substr(line.length-1) === ')' && parenIndex !== -1) {
				line = line.substr(0, line.length-1);
				curSet.species = Data.Pokedex[toID((line.substr(parenIndex+2))].name;
				line = line.substr(0, parenIndex);
				curSet.name = line;
			} else {
				curSet.species = Data.Pokedex[toID(line)].name;
				curSet.name = curSet.species;
			}
		} else if (line.substr(0, 7) === 'Trait: ') {
			line = line.substr(7);
			curSet.ability = line;
		} else if (line.substr(0, 9) === 'Ability: ') {
			line = line.substr(9);
			curSet.ability = line;
		} else if (line === 'Shiny: Yes') {
			curSet.shiny = true;
		} else if (line.substr(0, 7) === 'Level: ') {
			line = line.substr(7);
			curSet.level = +line;
		} else if (line.substr(0, 11) === 'Happiness: ') {
			line = line.substr(11);
			curSet.happiness = +line;
		} else if (line.substr(0, 9) === 'Ability: ') {
			line = line.substr(9);
			curSet.ability = line;
		} else if (line.substr(0, 5) === 'EVs: ') {
			line = line.substr(5);
			var evLines = line.split('/');
			curSet.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
			for (var j=0; j<evLines.length; j++) {
				var evLine = $.trim(evLines[j]);
				var spaceIndex = evLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[evLine.substr(spaceIndex+1)];
				var statval = parseInt(evLine.substr(0, spaceIndex));
				if (!statid) continue;
				curSet.evs[statid] = statval;
			}
		} else if (line.substr(0, 5) === 'IVs: ') {
			line = line.substr(5);
			var ivLines = line.split(' / ');
			curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
			for (var j=0; j<ivLines.length; j++) {
				var ivLine = ivLines[j];
				var spaceIndex = ivLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[ivLine.substr(spaceIndex+1)];
				var statval = parseInt(ivLine.substr(0, spaceIndex));
				if (!statid) continue;
				curSet.ivs[statid] = statval;
			}
		} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
			var natureIndex = line.indexOf(' Nature');
			if (natureIndex === -1) natureIndex = line.indexOf(' nature');
			if (natureIndex === -1) continue;
			line = line.substr(0, natureIndex);
			curSet.nature = line;
		} else if (line.substr(0,1) === '-' || line.substr(0,1) === '~') {
			line = line.substr(1);
			if (line.substr(0,1) === ' ') line = line.substr(1);
			if (!curSet.moves) curSet.moves = [];
			if (line.substr(0,14) === 'Hidden Power [') {
				var hptype = line.substr(14, line.length-15);
				line = 'Hidden Power ' + hptype;
				if (!curSet.ivs && window.BattleTypeChart) {
					curSet.ivs = {};
					for (var stat in window.BattleTypeChart[hptype].HPivs) {
						curSet.ivs[stat] = window.BattleTypeChart[hptype].HPivs[stat];
					}
				}
			}
			if (line === 'Frustration') {
				curSet.happiness = 0;
			}
			curSet.moves.push(line);
		}
	}
	return team;
};
TextParser.teamToText = function (set) {
	var text = '';
	for (var i=0; i<team.length; i++) {
		var curSet = team[i];
		if (curSet.name !== curSet.species) {
			text += ''+curSet.name+' ('+curSet.species+')';
		} else {
			text += ''+curSet.species;
		}
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item) {
			text += ' @ '+curSet.item;
		}
		text += "\n";
		if (curSet.ability) {
			text += 'Ability: '+curSet.ability+"\n";
		}
		if (curSet.level && curSet.level != 100) {
			text += 'Level: '+curSet.level+"\n";
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes\n';
		}
		if (typeof curSet.happiness === 'number' && curSet.happiness !== 255) {
			text += 'Happiness: '+curSet.happiness+"\n";
		}
		var first = true;
		if (curSet.evs) {
			for (var j in Data.StatTable) {
				if (!curSet.evs[j]) continue;
				if (first) {
					text += 'EVs: ';
					first = false;
				} else {
					text += ' / ';
				}
				text += ''+curSet.evs[j]+' '+Data.StatTable[j];
			}
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.nature) {
			text += ''+curSet.nature+' Nature'+"\n";
		}
		var first = true;
		if (curSet.ivs) {
			var defaultIvs = true;
			var hpType = false;
			for (var j=0; j<curSet.moves.length; j++) {
				var move = curSet.moves[j];
				if (move.substr(0,13) === 'Hidden Power ' && move.substr(0,14) !== 'Hidden Power [') {
					hpType = move.substr(13);
					if (!Data.TypeChart[hpType].HPivs) {
						alert("That is not a valid Hidden Power type.");
						continue;
					}
					for (var stat in Data.StatTable) {
						if ((curSet.ivs[stat]===undefined?31:curSet.ivs[stat]) !== (Data.TypeChart[hpType].HPivs[stat]||31)) {
							defaultIvs = false;
							break;
						}
					}
				}
			}
			if (defaultIvs && !hpType) {
				for (var stat in Data.StatTable) {
					if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined) {
						defaultIvs = false;
						break;
					}
				}
			}
			if (!defaultIvs) {
				for (var stat in Data.StatTable) {
					if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += ''+curSet.ivs[stat]+' '+Data.StatTable[stat];
				}
			}
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.moves) for (var j=0; j<curSet.moves.length; j++) {
			var move = curSet.moves[j];
			if (move.substr(0,13) === 'Hidden Power ') {
				move = move.substr(0,13) + '[' + move.substr(13) + ']';
			}
			text += '- '+move+"\n";
		}
		text += "\n";
	}
	return text;
}
*/
