<?php

require_once __DIR__.'/phplibs/db.php';
require_once __DIR__.'/phplibs/bitcoin.php';
require_once __DIR__.'/phplibs/utils.php';
require_once __DIR__.'/phplibs/ga.php';

Utils::options_headers();
Utils::no_cache_headers();

if (isset($_REQUEST['address'])) {
	$address = trim($_REQUEST['address']);

	$results = DB::statement('SELECT id, price, downloadid, status, paid FROM ' . Utils::table('download_address') . ' WHERE address = :address', array(':address' => $address));

	if (!$results) {
		echo json_encode(array('error' => 'Invalid address ('.$address.')'));
		exit(0);
	}

	$result = array_pop($results);
	$id = $result['id'];
	$price = $result['price'];
	$paid = 0;
	$paid_download_url = '';

	if ($result['status'] == 6 || $result['status'] == 8 || $result['status'] == 10) {
		$paid = $price;
		if (strlen($result['downloadid'])) {
			$paid_download_url = 'http://api.' . Utils::domain() . '/download/' . $result['downloadid'];
		}
	} elseif ($result['status'] == 7 || $result['status'] == 9) {
		$paid = $result['paid'];
	}
} elseif (isset($_REQUEST['download_url'])) {
	$url = trim($_REQUEST['download_url']);
	$exploded_url = explode('/', $url);

	$id = base_convert(array_pop($exploded_url), 36, 10);

	$results = DB::statement('SELECT price_float AS price, currency, address FROM download WHERE id = :id AND status = 0', array(':id' => $id));

	if (!$results) {
		echo json_encode(array('error' => 'Invalid id'));
		exit(0);
	}

	$rates = Utils::get_rates();

	$result = array_pop($results);

	if (!isset($rates[$result['currency']])) {
		echo json_encode(array('error' => 'Invalid currency'));
		exit(0);
	}

	$price = (int)round(((float)$result['price'] / $rates[$result['currency']]) * 1e8);
	$paid = 0;
	$paid_download_url = '';

	$address = Bitcoin::get_address($id);

	DB::statement('INSERT INTO ' . Utils::table('download_address') . '(id, address, seller_address, price) VALUES(:id, :address, :seller_address, :price)',
				  array(':id' => $id,
				  		':address' => $address,
				  		':seller_address' => $result['address'],
				  		':price' => $price,
				  		));

	$download_url = 'http://' . Utils::domain() . '/' . base_convert($id, 10, 36);

	GA::event('Consumer', 'Visit', $download_url);
} else {
	echo json_encode(array('error' => 'Must specifiy download_url or address'));
}

$files = array();
$results = DB::statement('SELECT filename, size FROM download_file WHERE id = :id', array(':id' => $id));
if (count($results)) {
	foreach ($results as $result) {
		$files[] = array('filename' => $result['filename'], 'size' => $result['size']);
	}
}

echo json_encode(array('price' => round((float)$price / 1e8, 8),
					   'address' => $address,
					   'files' => $files,
					   'paid' => round((float)$paid / 1e8, 8),
					   'paid_download_url' => $paid_download_url));