
var datamints_feuser_formId = 0;

window.onload = function() {
	if (datamints_feuser_config == null || datamints_feuser_inputids == null) {
		return;
	}

	for (datamints_feuser_formId in datamints_feuser_inputids) {
		if (typeof(datamints_feuser_inputids[datamints_feuser_formId]) != 'object') continue;

		var form = document.getElementById('datamints_feuser_' + datamints_feuser_formId + '_form');
		addEvent(form, 'submit', formCheck);

		var input;
		for (var i = 0; i < datamints_feuser_inputids[datamints_feuser_formId].length; i++) {
			input = document.getElementById(datamints_feuser_inputids[datamints_feuser_formId][i]);
			// Wenn Input Typ eine Checkbox ist ein Klickevent setzten, da der IE bei onchange das Event erst nach verlieren des Focus ausloest.
			if (input.type == 'checkbox') {
				addEvent(input, 'click', inputItemCheck);
			} else {
				addEvent(input, 'change', inputItemCheck);
			}
		}
	}
}

function formCheck(evt) {
	var error;
	var ret = false;

	// ID des aktuell verwendeten Formulars ueber das aktuell verwendete Input Element ermitteln.
	datamints_feuser_formId = getEventTarget(evt).id.split('_')[2];

	for (fieldId in datamints_feuser_inputids[datamints_feuser_formId]) {
		if (typeof(datamints_feuser_inputids[datamints_feuser_formId][fieldId]) != 'string') continue;

		error = inputItemCheck(null, document.getElementById(datamints_feuser_inputids[datamints_feuser_formId][fieldId]));
		if (error == true && ret == false) {
			ret = true;
			window.event ? event.returnValue = false : evt.preventDefault();
		}
	}
}

function inputItemCheck(evt, input) {
	var i = null;
	var j = null;
	var name = null;
	var elements = null;
	var arrLength = null;

	if (evt != null) {
		input = getEventTarget(evt);
	}

	var value = input.value.replace(/\s+$/, '').replace(/^\s+/, '');

	if (input.type == 'select-multiple') {
		j = 0;
		value = new Array();
		for (i = 0; i < input.options.length; i++) {
			if (input.options[i] != null && input.options[i].selected) {
				value[j] = input.options[i].value;
				j++;
			}
		}
	}

	if (input.type == 'checkbox') {
		if (input.id.lastIndexOf('_item_') >= 0) {
			value = false;
			name = input.id.slice(0, input.id.lastIndexOf('_item_'));
			elements = document.getElementById(name + '_wrapper').getElementsByTagName('input');
			for (i = 0; i < elements.length; i++) {
				if (elements[i] != null && elements[i].checked) {
					value = true;
				}
			}
		} else {
			value = input.checked;
		}
	}

	if (input.type == 'radio') {
		value = false;
		name = input.id.slice(0, input.id.lastIndexOf('_item_'));
		elements = document.getElementById(name + '_wrapper').getElementsByTagName('input');
		for (i = 0; i < elements.length; i++) {
			if (elements[i] != null && elements[i].checked) {
				value = true;
			}
		}
	}

	var fieldName = input.name.split('[')[2].split(']')[0];
	if (fieldName.split('_').reverse()[0] == 'rep') {
		fieldName = fieldName.slice(0, fieldName.length - 4);
	}

	// Den Error Dialog loeschen, damit er wenn die Validierung korrekt ist nicht mehr da ist.
	removeInfo(fieldName);

	// ID des aktuell verwendeten Formulars ueber das aktuell verwendete Input Element ermitteln.
	datamints_feuser_formId = input.id.split('_')[2];

	if (datamints_feuser_config[datamints_feuser_formId][fieldName] != null) {
		var validate = datamints_feuser_config[datamints_feuser_formId][fieldName]['validation'];
		if (datamints_feuser_config[datamints_feuser_formId][fieldName]['required'] && (!value || (typeof(value) == 'object' && !value.length))) {
			showInfo(fieldName, 'required');
			return true;
		} else if (validate) {

			switch (validate['type']) {

				case 'password':
					var input_rep;
					if (input.id.split('_').reverse()[0] != 'rep') {
						input_rep = document.getElementById(input.id + '_rep');
					} else {
						input_rep = document.getElementById(input.id.slice(0, input.id.length - 4));
					}
					var value_rep = input_rep.value;
					if (value != '' || value_rep != '') {
						arrLength = new Array('6');
						if (value == value_rep) {
							if (validate['size']) {
								arrLength = validate['size'].replace(' ', '').split(',');
							}

							if (!value.match(new RegExp('^.{' + arrLength[0] + ',' + ((arrLength[1] != undefined) ? arrLength[1] : '') + '}$'))) {
								showInfo(fieldName, 'size');
								return true;
							}
						} else {
							showInfo(fieldName, 'equal');
							return true;
						}
					}
					break;

				case 'email':
					if (!value.match(/^[a-zA-Z0-9\._%+-]+@[a-zA-Z0-9\.-]+\.[a-zA-Z]{2,6}$/)) {
						showInfo(fieldName, 'valid');
						return true;
					}
					break;

				case 'username':
					if (!value.match(/^[^ ]*$/)) {
						showInfo(fieldName, 'valid');
						return true;
					}
					break;

				case 'zero':
					if (value == '0') {
						showInfo(fieldName, 'valid');
						return true;
					}
					break

				case 'emptystring':
					if (value == '') {
						showInfo(fieldName, 'valid');
						return true;
					}
					break

				case 'custom':
					if (validate['regexp']) {
						if (typeof(value) == 'object') {
							var k = 0;
							for (k in value) {
								if (!value[k].match(validate['regexp'])) {
									showInfo(fieldName, 'valid');
									return true;
								}
							}
						} else {
							if (!value.match(validate['regexp'])) {
								showInfo(fieldName, 'valid');
								return true;
							}
						}
					}
					if (validate['size']) {
						arrLength = validate['size'].replace(' ', '').split(',');
						if (value.length < arrLength[0] || (arrLength[1] != undefined && value.length > arrLength[1])) {
							showInfo(fieldName, 'size');
							return true;
						}
					}
					break;

			}

		}
	}

	return false;
}

function addEvent(obj, type, fn) {
   if (obj.addEventListener) {
      obj.addEventListener(type, fn, false);
   } else if (obj.attachEvent) {
      obj["e" + type + fn] = fn;
      obj[type + fn] = function() {obj["e" + type + fn](window.event);}
      obj.attachEvent("on" + type, obj[type + fn]);
   }
}

function getEventTarget(evt) {
	if (evt.target) {
		return evt.target;
	} else {
		return evt.srcElement;
	}
}

function showInfo(fieldName, error) {
	var error_item_father = getErrorItemFather(fieldName);
	if (error_item_father != undefined) {
		if (error_item_father.lastChild.className == 'form_error ' + fieldName + '_error') {
			error_item_father.removeChild(error_item_father.lastChild);
		}

		var div = document.createElement('div');
		div.className = 'form_error ' + fieldName + '_error';
		div.innerHTML = datamints_feuser_config[datamints_feuser_formId][fieldName][error];
		error_item_father.appendChild(div);
	}
}

function removeInfo(fieldName) {
	var error_item_father = getErrorItemFather(fieldName);
	if (error_item_father != undefined && error_item_father.lastChild.className == 'form_error ' + fieldName + '_error') {
		error_item_father.removeChild(error_item_father.lastChild);
	}
}

function getErrorItemFather(fieldName) {
	var fieldNameWrapper = fieldName;
	if (datamints_feuser_config[datamints_feuser_formId][fieldName]['validation'] && datamints_feuser_config[datamints_feuser_formId][fieldName]['validation']['type'] == 'password') {
		fieldNameWrapper = fieldName + '_rep';
	}

	return document.getElementById('datamints_feuser_' + datamints_feuser_formId + '_' + fieldNameWrapper + '_wrapper');
}
