<?php

set_time_limit(0);
ignore_user_abort(true);

require_once __DIR__.'/phplibs/s3er.php';
require_once __DIR__.'/phplibs/zipper.php';
require_once __DIR__.'/phplibs/db.php';
require_once __DIR__.'/phplibs/utils.php';
require_once __DIR__.'/phplibs/ga.php';

Utils::options_headers();
Utils::no_cache_headers();

function echo_json_and_close_connection($data, $exit = false) {
	ob_end_clean();

	header('Content-Type: text/plain; charset=utf-8');
	header('Cache-control: no-cache');
	header('Connection: close');
	header('Content-Encoding: none');

	ob_start();

	echo json_encode($data);

	header('Content-Length: '.ob_get_length());
    
    ob_end_flush();
    flush();

    if (function_exists('fastcgi_finish_request')) {
    	fastcgi_finish_request();
    }

    if ($exit) {
    	exit(0);
    }
}

$clean_files = array();

foreach ($_FILES as $file) {
	if ($file['error'] == 0) {
		$clean_files[] = $file;
	}
}

if (empty($clean_files) && !isset($_REQUEST['update_url'])) {
	echo_json_and_close_connection(array('error' => 'Upload failed for all files', 'files' => $_FILES), true);
} else {
	$metadata = array('price' => isset($_REQUEST['price']) ? (float)$_REQUEST['price'] : 0.1,
				  	  'address' => isset($_REQUEST['address']) ? trim($_REQUEST['address']) : '',
				  	  'currency' => isset($_REQUEST['currency']) ? trim($_REQUEST['currency']) : 'BTC',
				  	 );

	if (strlen($metadata['currency']) == 3) {
		$metadata['currency'] = strtoupper($metadata['currency']);
	}

	$id = false;
	$updateid = false;
	$download_filename = '';
	$files = array();

	if (isset($_REQUEST['update_url'])) {
		$lookup_id = array_pop(explode('/', trim($_REQUEST['update_url'])));

		$results = DB::statement('SELECT id, download_filename, price_float AS price, currency, address FROM download WHERE updateid = :updateid AND status = 0', array(':updateid' => $lookup_id));	

		if (empty($results)) {
			echo_json_and_close_connection(array('error' => 'No such update_url exists'), true);
		}

		$metadata = array_pop($results);
		$id = $metadata['id'];
		unset($metadata['id']);

		if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
			S3er::delete($id);

			DB::statement('UPDATE download SET status = 1 WHERE id = :id', array(':id' => $id));

			echo_json_and_close_connection('success', true);
		}
		
		$updateid = $lookup_id;

		$download_filename = $metadata['download_filename'];
		unset($metadata['download_filename']);

		$results = DB::statement('SELECT filename, size FROM download_file WHERE id = :id', array(':id' => $id));
		if (count($results)) {
			foreach ($results as $result) {
				$files[] = array('filename' => $result['filename'], 'size' => $result['size']);
			}
		}

		foreach ($metadata as $key => $value) {
			if (isset($_REQUEST[$key])) {
				if ($key == 'price') {
					$metadata[$key] =  (float)$_REQUEST[$key];
				} else {
					$metadata[$key] = trim($_REQUEST[$key]);
				}
			}
		}
	}

	if ($metadata['currency'] != 'BTC') {
		$rates = Utils::get_rates();

		if (!isset($rates[$metadata['currency']])) {
			echo_json_and_close_connection(array('error' => 'Currency unsupported'), true);
		} else {
			// If only the currency is changed and the amount isn't updated, we correct the price
			if (isset($_REQUEST['currency']) && !isset($_REQUEST['price'])) {
				$metadata['price'] = $metadata['price'] * $rates[$metadata['currency']];
			}

			$metadata['price'] = max(0.0001 * $rates[$metadata['currency']], $metadata['price']);
		}
	}

	if (!$id) {
		DB::statement('INSERT INTO download VALUES()', array());
		$id = DB::last_insert_id();
		$updateid = md5(uniqid($_SERVER['REMOTE_ADDR'], true));
	}

	if (strlen($download_filename) == 0 && count($clean_files)) {
		$rows = array();

		foreach ($clean_files as $file) {
			$rows[] = $id;
			$rows[] = $file['name'];
			$rows[] = $file['size'];
			$files[] = array('filename' => $file['name'], 'size' => (int)$file['size']);
		}

		$placeholders = implode(',', array_fill(0, count($clean_files), '(?, ?, ?)'));
		DB::statement('INSERT INTO download_file VALUES '.$placeholders, $rows);
	}

	$metadata = array('download_url' => 'http://' . Utils::domain() . '/' . base_convert($id, 10, 36),
					  'update_url' => 'http://' . Utils::domain() . '/update/' . $updateid,
					  'price' => (float)$metadata['price'],
					  'currency' => $metadata['currency'],
					  'address' => $metadata['address'],
					  'files' => $files);

	echo_json_and_close_connection($metadata);

	// Do the lengthy processing now that the connection is closed
	DB::statement('UPDATE download SET updateid = :updateid, price_float = :price, currency = :currency, address = :address WHERE id = :id',
		array(':id' => $id,
			  ':updateid' => $updateid,
			  ':price' => $metadata['price'],
			  ':currency' => $metadata['currency'],
			  ':address' => $metadata['address']));

	if (strlen($download_filename) == 0 && count($clean_files)) {
		if (count($clean_files) > 1) {
			$file = Zipper::compress($id, $clean_files);
		} else {
			$file = array_pop($clean_files);
		}
		S3er::upload($file, $id);

		$download_filename = $file['name'];

		DB::statement('UPDATE download SET download_filename = :download_filename WHERE id = :id',
			array(':id' => $id,
				  ':download_filename' => $download_filename));
	}

	GA::event('Producer', 'Upload', $metadata['currency'], $metadata['price']);
}