<?php

require_once __DIR__.'/phplibs/utils.php';

Utils::options_headers();
Utils::no_cache_headers();

$json = array();

$results = DB::statement('SELECT COUNT(*) as count, SUM(size) AS size FROM ' . Utils::table('download_file') 
						 . ' LEFT JOIN ' . Utils::table('download')
						 . ' ON ' . Utils::table('download_file'). '.id = ' . Utils::table('download') . '.id WHERE '
						 . Utils::table('download') . '.status != 1' , array());

$row = array_pop($results);

$json['files'] = $row['count'];
$json['size'] = $row['size'];

$results = DB::statement('SELECT SUM(paid) AS sum FROM ' . Utils::table('download_address') . ' WHERE status = :status', array(':status' => 10));

$row = array_pop($results);

$json['spent'] = $row['sum'];

echo json_encode($json);