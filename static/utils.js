window.utils = {

add_class: function(element, classname) {
	var classes_string = element.getAttribute('class')
	   ,classes = classes_string.split(' ')
	   ,already_there = false;

	utils.each(classes, function(key, value) {
		if (value == classname) {
			already_there = true;
		}
	});

	if (!already_there) {
		classes.push(classname);
	}

	element.setAttribute('class', classes.join(' '));
}
,remove_class: function(element, classname) {
	var classes_string = element.getAttribute('class')
	   ,classes = classes_string.split(' ')
	   ,new_classes = [];

	utils.each(classes, function(key, value) {
		if (value != classname) {
			new_classes.push(value);
		}
	});

	element.setAttribute('class', new_classes.join(' '));
}
,each: function(object, callback) {
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			callback.call(object[key], key, object[key]);
		}
	}
}
,text: function(html) {
	return html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
,human_readable_size: function(bytes) {
    var sizes = [i18n.sizes.b, i18n.sizes.kb, i18n.sizes.mb, i18n.sizes.gb, i18n.sizes.tb];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + sizes[i];
}
,is_event_supported: function (event_name) {
    element = document.createElement('div');
    event_name = 'on' + event_name;

    var is_supported = event_name in element;

    if (!is_supported) {
		if (element.setAttribute && element.removeAttribute) {
			element.setAttribute(event_name, '');
			is_supported = typeof element[event_name] == 'function';

			if (typeof element[event_name] != 'undefined') {
			 	element[event_name] = undefined;
			}
			element.removeAttribute(event_name);
		}
    }

    element = null;
    return is_supported;
}
,is_file_drop_supported: function() {
	if (!utils.is_event_supported('dragstart')) {
		return false;
	}

	if (!utils.is_event_supported('drop')) {
		return false;
	}

	if (/firefox/.test(navigator.userAgent.toLowerCase())) {
		if (/intel mac os x/.test(navigator.userAgent.toLowerCase())) {
			return true;
		} else if (/windows/.test(navigator.userAgent.toLowerCase())) {
			return true;
		}
	} else if (/chrome/.test(navigator.userAgent.toLowerCase())) {
		if (/intel mac os x/.test(navigator.userAgent.toLowerCase())) {
			return true;
		} else if (/windows/.test(navigator.userAgent.toLowerCase())) {
			return true;
		}
	} else if (/safari/.test(navigator.userAgent.toLowerCase())) {
		if (/intel mac os x/.test(navigator.userAgent.toLowerCase())) {
			return true;
		} else if (/windows/.test(navigator.userAgent.toLowerCase())) {
			return true;
		}
	} else if (/msie 10.0/.test(navigator.userAgent.toLowerCase())) {
		return true;
	}

	return false;
}
,minimal_js_features_supported: function() {
	if (!window.addEventListener) {
		return false;
	}

	if (!document.querySelector) {
		return false;
	}

	if (!window.JSON) {
		return false;
	}

	if (!window.getComputedStyle) {
		return false;
	}

	if (!window.history) {
		return false;
	}

	if (!window.history.pushState) {
		return false;
	}

	return true;
}
,language: function() {
	return (window.navigator.userLanguage || window.navigator.language).toLowerCase();
}
,currency: function() {
	var language = utils.language();

	switch (language) {
		case 'en':
		case 'en-us':
			return 'USD';
		case 'en-au':
			return 'AUD';
		case 'pt-br':
			return 'BRL';
		case 'de-ch':
		case 'fr-ch':
		case 'it-ch':
			return 'CHF';
		case 'zh':
		case 'zh-cn':
		case 'zh-tw':
		case 'zh-mo':
			return 'CNY';
		case 'en-gb':
		case 'cy':
		case 'cy-gb':
			return 'GBP';
		case 'he':
		case 'he-il':
			return 'ILS';
		case 'ja':
		case 'ja-jp':
			return 'JPY';
		case 'pl':
		case 'pl-pl':
			return 'PLN';
		case 'ru':
		case 'ru-ru':
			return 'RUB';
		case 'sv':
		case 'sv-se':
			return 'SEK';
		case 'zh-sg':
			return 'SGD';
		case 'fr':
		case 'fr-fr':
		case 'fr-be':
		case 'fr-lu':
		case 'fr-mc':
		case 'nl-be':
		case 'de':
		case 'de-at':
		case 'de-de':
		case 'de-li':
		case 'de-lu':
		case 'el':
		case 'el-gr':
		case 'et':
		case 'et-ee':
		case 'fi':
		case 'fi-fi':
		case 'sv-fi':
		case 'se-fi':
		case 'en-ie':
		case 'it':
		case 'it-it':
		case 'mt':
		case 'mt-mt':
		case 'nl':
		case 'nl-nl':
		case 'pt':
		case 'pt-pt':
		case 'sk':
		case 'sk-sk':
		case 'sl':
		case 'sl-si':
		case 'eu':
		case 'eu-es':
		case 'gl':
		case 'gl-es':
		case 'ca':
		case 'ca-es':
		case 'es-es':
			return 'EUR';
	}

	return 'BTC';
}
,select: function() {
	this.focus();
	this.select();
}
,select_content_editable: function() {
	var element = this;

	setTimeout(function() {
		console.log('select', element);
		var range = document.createRange();
	    range.selectNodeContents(element);
	    var sel = window.getSelection();
	    sel.removeAllRanges();
	    sel.addRange(range);
	});
}

};