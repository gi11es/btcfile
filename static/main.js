(function() {

var domain = window.location.hostname.match(/com/) ? 'btcfile.com' : 'btcfile.dev';

var thisref = {
 hovering_timeout: undefined
,original_document_title: ''
,$body: undefined
,$content: undefined
,currencies: {}
,currency: 'BTC'
,price: 0.1
,update_deferred: []
,update_ongoing: false
,stats: []
,constructor: function() {
	thisref = this;

	if (!utils.minimal_js_features_supported()) {
		this.init_incompatible_browser();
		ga('send', 'pageview');
		return;
	}

	thisref.$body = document.querySelector('body.btcfile');
	thisref.$content = document.getElementById('content');
	thisref.translate_menu();

	window.addEventListener('popstate', thisref.popstate);

	thisref.original_document_title = document.title;
	thisref.popstate();

	ga('send', 'pageview');
}
,listen_to_drop: function() {
	thisref.$body.addEventListener('dragover', thisref.dragover);
	thisref.$body.addEventListener('drop', thisref.drop);
}
,ignore_drop: function() {
	thisref.$body.removeEventListener('dragover', thisref.dragover);
	thisref.$body.removeEventListener('drop', thisref.drop);
}
,popstate: function(jqevent) {
	var pageload_location = window.location.pathname;

	if (pageload_location == '/a_p_i') {
		thisref.init_api_page();
	} else if (pageload_location == '/what_is_it') {
		thisref.init_what_is_it_page();
	} else if (pageload_location.match(/^\/update\/[a-zA-Z0-9]+$/)) {
		var update_url = domain + pageload_location;

		thisref.init_settings_page();
		thisref.update({update_url: update_url}, false);
	} else if (pageload_location.match(/^\/[a-zA-Z0-9]+$/)) {
		var download_url = domain + pageload_location;

		thisref.init_download_page(download_url);
	} else {
		thisref.init_start_page();
	}
}
,dragover: function(e) {
	e.preventDefault();

	if (!e.dataTransfer || !e.dataTransfer.types) {
		return;
	}

	if (e.dataTransfer.types
		&& e.dataTransfer.types.contains
		&& e.dataTransfer.types.contains('Files')
		&& !e.dataTransfer.types.contains('text/plain')) {
		utils.add_class(thisref.$body, 'file-hovering');

		clearTimeout(thisref.hovering_timeout);
		thisref.hovering_timeout = setTimeout(function() {
			utils.remove_class(thisref.$body, 'file-hovering');
		}, 100);
	}
}
,drop: function(e) {
	e.preventDefault();

	if (!e.dataTransfer
		|| !e.dataTransfer.files
		|| !e.dataTransfer.files.length) {
		return;
	}

	var files = e.dataTransfer.files;
	var clean_files = [];

	for (var i = 0; i < files.length; i++) {
		var file = files[i];

		if (file.size == 0) {
			continue;
		}

		if (file.size % 4096 == 0 && file.type == '') {
			continue;
		}

		clean_files.push(file);
	}

	if (!clean_files.length) {
		alert('Please drag files, dragging folders isn\'t supported by web browsers yet');
	} else {
		thisref.ignore_drop();
		thisref.upload(clean_files);
	}
}
,upload: function(files) {
	thisref.init_upload_page();

	var xhr = new XMLHttpRequest();

	xhr.upload.onprogress = thisref.upload_progress;
	xhr.onreadystatechange = thisref.upload_state_change.bind(this);

	xhr.open('POST', 'http://api.' + domain + '/sell', true);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('pragma', 'no-cache');

	var fd = new FormData()
	   ,html = '';

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		fd.append(encodeURIComponent(file.name), file);
		html += '<div class="file">' + utils.text(file.name + ' - ' + utils.human_readable_size(file.size)) + '</div>';
	}

	document.getElementById('files').innerHTML = html;

	thisref.currency = utils.currency();
	if (window.localStorage && localStorage.getItem('currency')) {
		thisref.currency = localStorage.getItem('currency');
	}

	fd.append('currency', thisref.currency);

	if (window.localStorage) {
		if (localStorage.getItem('price_float')) {
			fd.append('price', parseFloat(localStorage.getItem('price_float')));
		}

		if (localStorage.getItem('seller_address')) {
			fd.append('address', localStorage.getItem('seller_address'));
		}
	}
	
	xhr.send(fd);
}
,init_upload_page: function() {
	thisref.ignore_drop();
	thisref.$content.innerHTML = '<div id="details"><div id="files"></div></div><div class="uploading"><div class="upload-progress-text"></div><div class="upload-progress"></div></div>';
}
,upload_progress: function(e) {
	console.log('upload_progress', e);

	if (!e.lengthComputable) {
		return;
	}

	thisref.update_percentage_displayed(Math.min(100.0, (e.loaded / e.total) * 100.0));
}
,update_percentage_displayed: function(percent) {
	var text_percent = Math.ceil(percent) + '%';

	window.document.title = 'btcfile: ' + text_percent;
	thisref.$content.querySelector('div.upload-progress').style.width = percent + '%'; // Float value
	thisref.$content.querySelector('div.upload-progress-text').innerHTML = text_percent;
}
,upload_state_change: function(jqevent) {
	var xhr = jqevent.target;

	if (xhr.readyState == 4) {
		window.document.title = thisref.original_document_title;
		thisref.$content.innerHTML = '';
	}

	if (xhr.readyState != 4 || xhr.upload_canceled) {
		return;
	}

	var response;

    try {
        response = JSON.parse(xhr.responseText);
    } catch(e) {
    	return;
    }

    if (response.error !== undefined) {
    	console.log(response.error);
    	return;
    }

	var new_location = response.update_url.slice(18);
	window.history.pushState(response, '', new_location); // Trim the domain name
	ga('send', 'pageview', new_location);

    thisref.init_settings_page(response.download_url);
    thisref.apply_settings(false, response);
}
,init_start_page: function() {
	thisref.init_stats();

	document.title = i18n.start.title;

	var html = '<div class="slogan">' + i18n.start.slogan + '</div>';

	if (utils.is_file_drop_supported()) {
		thisref.listen_to_drop();
		html += '<div class="instructions">' + i18n.start.instructions + '</div>';
	} else {
		html += '<form class="upload-form" method="POST" enctype="multipart/form-data" action="http://api.' + domain + '/sell"><div class="upload-button-container"><div class="upload-button"><input class="upload-file" type="file" name="file" multiple="multiple">' + i18n.start.legacy_upload + '</div></div></form>';
	}

	html += '<div class="stats"></div>';
	html += '<div class="promo">' + i18n.start.promo + '</div>';

	thisref.$content.innerHTML = html;
	thisref.$content.style.display = 'block';

	if (!utils.is_file_drop_supported()) {
		thisref.$content.querySelector('.upload-button-container').addEventListener('mousemove', function(e) {
			var $upload_file = document.querySelector('.upload-file');
			$upload_file.style.left = e.pageX - $upload_file.offsetWidth + 10;
			$upload_file.style.top = e.pageY - ($upload_file.offsetHeight / 2);
		});
		thisref.$content.querySelector('.upload-file').addEventListener('change', function(e) {
			thisref.upload(e.target.files);
		});
	}
}
,init_settings_page: function(download_url) {
	thisref.ignore_drop();
	document.title = i18n.settings.title;

	var html = '<div id="details"><div id="files"></div></div><div class="url-container"><input type="text" class="url" name="download_url" value="' + (download_url ? download_url : '') + '" readonly></div><div class="instructions">' + i18n.settings.instructions + '</div>';
			 
	html += '<div class="settings">';

	var fields = {price: {label: i18n.settings.price, unit: '<select name="currency" id="currency"></select>', explanation: i18n.settings.price_explanation},
				address: {label: i18n.settings.address, unit: '', explanation: i18n.settings.address_explanation}
		};

	utils.each(fields, function(name, description) {
		html += '<div class="settings-description" title="' + description.explanation + ' ">' + description.label + ':</div>'
			   +'<div class="settings-value"><input class="settings-input" type="text" title="' + description.explanation + ' " name="' + name + '" value=""><span class="settings-unit">' + description.unit + '</span></div>';
	});

	html += '</div>';
	html += '<div class="instructions">' + i18n.settings.address_tip1 + ' <a target=_blank href="https://blockchain.info/wallet/new">' + i18n.settings.address_tip2 + '</a> ' + i18n.settings.address_tip3 + '<br>' + i18n.settings.update_tip1 + ' <a id="delete" href="javascript:void(0)">' + i18n.settings.update_tip2 + '</a> ' + i18n.settings.update_tip3 + '</div>';

	thisref.$content.style.display = 'none';
	thisref.$content.innerHTML = html;

	document.getElementById('delete').addEventListener('click', this.delete_content);

	thisref.init_currencies();

	thisref.show_settings = false;
	thisref.show_currencies = false;

	utils.each(fields, function(name, description) {
		document.querySelector('input[name="' + name + '"]').addEventListener('change', function() {
			var metadata = {update_url: window.location.href, currency: thisref.currency};

			utils.each(document.querySelectorAll('input.settings-input'), function(idx, $input) {
				if ($input.name == 'price') {
					metadata.price = parseFloat($input.value);
				} else {
					metadata[$input.name] = $input.value;
				}
			});

			thisref.update(metadata, true);
		});
	});

    setTimeout(function() {
    	var $input = document.querySelector('input.url');

    	$input.focus();
    	$input.select();
    	$input.addEventListener('click', function() { this.focus(); this.select(); });
    }, 1000);
}
,delete_content: function(e) {
	if (confirm(i18n.settings.delete_confirm)) {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = thisref.xhr_state_changed.bind(thisref, thisref.apply_delete);
		xhr.open('DELETE', 'http://api.' + domain + '/sell?update_url=' + window.location.href, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
	}
}
,apply_delete: function() {
	window.history.pushState(null, null, '/');
	thisref.init_start_page();
}
,show_settings_and_currencies: function() {
	if (thisref.show_settings && thisref.show_currencies) {
		thisref.$content.style.display = 'block';
	}
}
,init_currencies: function() {
	if (thisref.currencies.length) {
		return;
	}

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = thisref.xhr_state_changed.bind(thisref, thisref.apply_currencies);
	xhr.open('GET', 'http://api.' + domain + '/rates', true);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.send();
}
,apply_currencies: function(data) {
	thisref.currencies = data;

	var currencies_html = '';

	utils.each(thisref.currencies, function(currency, rate) {
		currencies_html += '<option value="' + currency + '" ' + (currency == thisref.currency?'selected':'') + '>' + currency + '</option>';
	});

	var $currency = document.getElementById('currency');

	$currency.innerHTML = currencies_html;
	$currency.addEventListener('change', function() {
	 	var $price = document.querySelector('input[name="price"]')
	 	   ,old_currency = thisref.currency;

	 	thisref.currency = $currency.value;

	 	if (thisref.price) {
	 		thisref.price = (thisref.price / thisref.currencies[old_currency]) * thisref.currencies[thisref.currency];
	 	}

	 	thisref.apply_price();

	 	var e = document.createEvent('HTMLEvents');
	 	e.initEvent('change', true, true);
	 	$price.dispatchEvent(e);
	 });

	thisref.apply_price();

	thisref.show_currencies = true;
	thisref.show_settings_and_currencies();
}
,apply_price: function() {
	// Don't set the price in the input if some things aren't loaded yet (either rates or upload metadata)
	if (!thisref.price || thisref.currencies.length == 0) {
		return;
	}

	var precision = 2;

	if (thisref.currency == 'BTC') {
 		precision = 8;
 	} else if (thisref.currency == 'mBTC') {
 		precision = 5;
 	}

	document.querySelector('input[name="price"]').value = Number(thisref.price.toFixed(precision));
}
,apply_settings: function(is_user_update, data) {
	utils.each(data, function(key, value) {
		var $input = document.querySelector('[name="' + key + '"]');
		
		if ($input) {
			if (key == 'price') {
				thisref.price = parseFloat(value);
			} else if (key == 'currency') {
				thisref.currency = value;
				$input.value = value;
			} else {
				$input.value = value;
			}
		}
	});

	thisref.apply_price();

	if (is_user_update) {
		if (window.localStorage) {
			localStorage.setItem('price_float', data.price);
			localStorage.setItem('seller_address', data.address);
			localStorage.setItem('currency', data.currency);
		}
	} else {
		var html = '';

		utils.each(data.files, function(idx, elem) {
			html += '<div class="file">' + utils.text(elem.filename + ' - ' + utils.human_readable_size(elem.size)) + '</div>';
		});

		document.getElementById('files').innerHTML = html;

		thisref.show_settings = true;
		thisref.show_settings_and_currencies();

		var $download_url = document.querySelector('input[name="download_url"]');
		$download_url.focus();
		$download_url.select();
	}
}
,update: function(metadata, is_user_update) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function(e) {
		if (xhr.readyState != 4 || xhr.upload_canceled) {
			return;
		}

		thisref.update_ongoing = false;

		if (thisref.update_deferred.length) {
			thisref.update_deferred.pop().call(thisref);
		} else {
			thisref.xhr_state_changed.call(thisref, thisref.apply_settings.bind(thisref, is_user_update), e);
		}
	};

	xhr.open('POST', 'http://api.' + domain + '/sell', true);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('pragma', 'no-cache');	

	var fd = new FormData();

	utils.each(metadata, function(key, value) {
		fd.append(key, value);
	});

	var send_xhr = function() {
		thisref.update_ongoing = true;
		xhr.send(fd);
	};
	
	if (thisref.update_ongoing) {
		thisref.update_deferred.unshift(send_xhr);
	} else {
		send_xhr();
	}
}
,xhr_state_changed: function(callback, jqevent) {
	var xhr = jqevent.target;

	if (xhr.readyState != 4 || xhr.upload_canceled) {
		return;
	}

	var response;

    try {
        response = JSON.parse(xhr.responseText);
    } catch(e) {
    	return;
    }

    if (response.error !== undefined) {
    	console.log(response.error);
    	history.pushState(null, null, '/');
    	thisref.init_start_page();
    	return;
    }

    callback(response);
}
,init_download_page: function(download_url) {
	thisref.ignore_drop();
	document.title = i18n.download.title;
	thisref.download_url = download_url;

	thisref.$content.innerHTML = '<div id="details" style="display: none">'
						  	+'<div id="files"></div>'
						  	+'<div id="extras">'
						  		+'<div class="instructions">' + i18n.download.instructions1 + ' <span class="display-price" contenteditable readonly></span> ' + i18n.download.instructions2 + ':</div>'
						  		+'<div class="address_container"><input type="text" class="address" name="address" value="" readonly></div>'
						  		+'<img id="qr-code" src="">'
						  	+'</div>'
						  	+'<div class="instructions bottom">' + i18n.download.payment + '</div>'
					  	  +'</div>';

	thisref.send_address_request(download_url);
}
,send_address_request: function(download_url, address) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = thisref.xhr_state_changed.bind(thisref, thisref.apply_address_data);

	xhr.open('POST', 'http://api.' + domain + '/buy', true);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.setRequestHeader('pragma', 'no-cache');	

	var fd = new FormData();

	if (download_url) {
		fd.append('download_url', download_url);
	}

	if (address) {
		fd.append('address', address);
	}
	
	xhr.send(fd);
}
,apply_address_data: function(data) {
	if (!document.querySelector('input.address').value.length) {
		var total_price = data.price
		   ,html = '';

		document.querySelector('.display-price').innerHTML = total_price;

		utils.each(data.files, function(idx, elem) {
			html += '<div class="file">' + utils.text(elem.filename + ' - ' + utils.human_readable_size(elem.size)) + '</div>';
		});

		document.getElementById('files').innerHTML = html;

		var $qr_code = document.getElementById('qr-code');
		$qr_code.addEventListener('load', function() { this.style.visibility = 'visible'; });
		$qr_code.setAttribute('src', 'https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=bitcoin:' + data.address + '?amount=' + total_price + 'X8&choe=UTF-8');

		document.querySelector('input.address').value = data.address;
		document.querySelector('input.address').addEventListener('click', utils.select);
		document.querySelector('.display-price').addEventListener('focus', utils.select_content_editable);

		document.getElementById('details').style.display = 'block';

		window.onbeforeunload = function() { return i18n.download.exit; };
	}

	if (data.paid >= data.price && data.paid_download_url.length) {
		document.querySelector('.instructions.bottom').innerHTML = i18n.download.confirmed;
		window.onbeforeunload = null;

		ga('send', 'event', 'download', window.location.href, data.paid_download_url);

		window.location = data.paid_download_url;
		return;
	} else if (data.paid > 0 && data.paid < data.price) {
		var left_to_pay = data.price - data.paid;
		document.querySelector('.instructions.bottom').innerHTML = i18n.download.partial1 + ' ' + left_to_pay + ' ' + i18n.download.partial2;
	}
	
	setTimeout(thisref.send_address_request.bind(thisref, false, data.address), 3000);
}
,init_api_page: function() {
	window.document.title = i18n.api.title;

	thisref.$content.innerHTML = '<div class="api-container">'
					 + '<div class="slogan">' + i18n.api.simple + '</div>'
					 + '<div class="api">' + i18n.api.json + ': <ul><li><b>http://api.btcfile.com/sell</b></li><li><b>http://api.btcfile.com/buy</b></li></ul></div>'
					 + '<div class="api"><b>sell</b> ' + i18n.api.sell + '</div>'
					 + '<div class="api"><b>buy</b> ' + i18n.api.buy + '</div>'
					 + '<div class="api">' + i18n.api.btcfile + '</div>'
					 + '<div class="slogan">' + i18n.api.samples + '</div>'
					 + '<div class="api">' + i18n.api.samples_foreword + ':<br><ul><li><a href="https://github.com/kouiskas/btcfile-PHP-sample/blob/master/btcfile.php">PHP</a></li><li><a href="http://jsfiddle.net/93CXX/8/">JS</a></li></ul></div>'
					 + '</div>';
}
,init_what_is_it_page: function() {
	window.document.title = i18n.what_is_it.title;

	thisref.$content.innerHTML = '<div class="api-container">'
					 + '<div class="slogan">' + i18n.what_is_it.what + '</div>'
					 + '<div class="api">' + i18n.what_is_it.easy + '</div>'
					 + '<div class="slogan">' + i18n.what_is_it.how_much + '</div>'
					 + '<div class="api">' + i18n.what_is_it.free + '</div>'
					 + '<div class="slogan">' + i18n.what_is_it.content + '</div>'
					 + '<div class="api">' + i18n.what_is_it.anything + '</div>'
					 + '<div class="slogan">' + i18n.what_is_it.sell + '</div>'
					 + '<div class="api">' + i18n.what_is_it.minimum + '</div>'
					 + '<div class="slogan">' + i18n.what_is_it.currencies + '</div>'
					 + '<div class="api">' + i18n.what_is_it.exchange_rates1 + ' <a target=_blank href="http://bitcoincharts.com/">bitcoincharts.com</a>. ' + i18n.what_is_it.exchange_rates2 + '</div>'
					 + '<div class="slogan">' + i18n.what_is_it.how + '</div>'
					 + '<div class="api">' + i18n.what_is_it.no_registration
					 + '<ul>'
					 + '<li><b>' + i18n.what_is_it.buyers + '</b>: ' + i18n.what_is_it.buyers_explanations + '</li>'
					 + '<li><b>' + i18n.what_is_it.producers + '</b>: ' + i18n.what_is_it.producers_explanations + '</li>'
					 + '<li><b>' + i18n.what_is_it.developers + '</b>: <a href="/a_p_i">' + i18n.what_is_it.developers_explanations1 + '</a> ' + i18n.what_is_it.developers_explanations2
					 + '</ul></div>'
					 + '</div>';
}
,init_incompatible_browser: function() {
	document.getElementById('content').innerHTML = '<div class="api-container">'
												  +'<div class="slogan">' + i18n.old_browser.message + '</div>'
												  +'<div class="api">' + i18n.old_browser.explanations + '</div>'
												  +'</div>';
}
,translate_menu: function() {
	document.getElementById('tab-api').innerHTML = i18n.menu.api;
	document.getElementById('tab-feedback').innerHTML = i18n.menu.feedback;
	document.getElementById('tab-sell').innerHTML = i18n.menu.sell;
	document.getElementById('tab-what').innerHTML = i18n.menu.what;
	document.getElementById('tab-bitcoin').innerHTML = i18n.menu.bitcoin;
	var tabs = document.querySelectorAll('.header-tab');

	for (var i in tabs) {
		tabs[i].className += ' translated';
	}
}
,init_stats: function() {
	if (thisref.stats.length) {
		thisref.apply_stats(thisref.stats);
		return;
	}

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = thisref.xhr_state_changed.bind(thisref, thisref.apply_stats);
	xhr.open('GET', 'http://api.' + domain + '/stats', true);
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	xhr.send();
}
,apply_stats: function(data) {
	thisref.stats = data;

	document.querySelector('.stats').innerHTML = thisref.stats.files + ' ' + i18n.start.stats1 + ' ' + utils.human_readable_size(thisref.stats.size) + ' ' + i18n.start.stats2 +  ', ' + (thisref.stats.spent / 100000000) + ' ' + i18n.start.stats3;
}
}; // End of thisref =

// Wait for our dependencies to be loaded before we start up

var wait = function() {
	if (window.utils && (!utils.minimal_js_features_supported() || window.getComputedStyle(document.getElementById('css-loaded')).width == '1px')) {
		thisref.constructor();
	} else {
		setTimeout(wait, 1);
	}
}

wait();

})(); // End of big closure, used to avoid polluting window.* with domain, wait & startit