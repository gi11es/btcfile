<?php

require_once __DIR__.'/phplibs/s3er.php';
require_once __DIR__.'/phplibs/bitcoin.php';
require_once __DIR__.'/phplibs/utils.php';
require_once __DIR__.'/phplibs/ga.php';

Utils::options_headers();
Utils::no_cache_headers();

$downloadid = trim($_REQUEST['downloadid']);

$results = DB::statement('SELECT id, address FROM ' . Utils::table('download_address') . ' WHERE downloadid = :downloadid', array(':downloadid' => $downloadid));

if (!count($results)) {
	echo 'Download link already used or invalid. Download links can only be used once. A recovery feature will soon be available.';
	exit(0);
}

$result = array_pop($results);
$id = $result['id'];
$address = $result['address'];

$results = DB::statement('SELECT download_filename FROM download WHERE id = :id', array(':id' => $id));

if (!count($results)) {
	echo 'Download link already used or invalid. Download links can only be used once. A recovery feature will soon be available.';
	exit(0);
}

$result = array_pop($results);

$download_filename = $result['download_filename'];

header('Location: '.S3er::get_temporary_download_url($id, $download_filename));

DB::statement('UPDATE ' . Utils::table('download_address') . ' SET downloadid = NULL WHERE address = :address', array(':address' => $address));

$download_url = 'http://' . Utils::domain() . '/' . base_convert($id, 10, 36);

GA::event('Consumer', 'Download', $download_url);