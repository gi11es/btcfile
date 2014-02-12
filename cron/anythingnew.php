<?php

$start_time = time();

require_once __DIR__.'/../phplibs/db.php';

do {
	$max = array();

	$results = DB::statement('SELECT id, last_value FROM last_value', array());
	foreach ($results as $result) {
		$max[$result['id']] = $result['last_value'];
	}

	$result = array_pop(DB::statement('SELECT MAX(id) AS max FROM download', array()));
	$current_max_uploads = $result['max'];

	if (!isset($max['download']) || $max['download'] < $current_max_uploads) {
		DB::statement('UPDATE last_value SET last_value = :last_value WHERE id = :id', array(':id' => 'download', ':last_value' => $current_max_uploads));
		$new_uploads = $current_max_uploads - $max['download'];
		exec('say "' . $new_uploads . ' upload' . ($new_uploads > 1 ? 's' : '') . '"');
	}

	$result = array_pop(DB::statement('SELECT COUNT(*) AS count FROM download_address', array()));
	$current_max_visits = $result['count'];

	if (!isset($max['download_address']) || $max['download_address'] < $current_max_visits) {
		DB::statement('UPDATE last_value SET last_value = :last_value WHERE id = :id', array(':id' => 'download_address', ':last_value' => $current_max_visits));
		$new_visits = $current_max_visits - $max['download_address'];
		exec('say "' . $new_visits . ' visit' . ($new_visits > 1 ? 's' : '') . '"');
	}

	$result = array_pop(DB::statement('SELECT COUNT(*) AS count FROM download_address WHERE status IN (6,8,10)', array()));
	$current_max_paid = $result['count'];

	if (!isset($max['download_address']) || $max['download_address_paid'] < $current_max_paid) {
		DB::statement('UPDATE last_value SET last_value = :last_value WHERE id = :id', array(':id' => 'download_address_paid', ':last_value' => $current_max_paid));
		$new_downloads = $current_max_paid - $max['download_address_paid'];
		exec('say "' . $new_downloads . ' download' . ($new_downloads > 1 ? 's' : '') . '"');
	}
	
	sleep(5);
} while (time() - $start_time < 55);