<?php

require_once __DIR__.'/../phplibs/db.php';
require_once __DIR__.'/../phplibs/utils.php';

if (!Utils::is_local()) {
	exit(0);
}

$ids = array();
$results = DB::statement('SELECT id, updateid FROM download WHERE status = 0', array());

foreach ($results as $result) {
	$ids[$result['id']] = $result['updateid'];
}

$files = array();
$results = DB::statement('SELECT id, filename, size FROM download_file', array());

foreach ($results as $result) {
	if (!isset($file[$result['id']])) {
		$file[$result['id']] = array();
	}

	$files[$result['id']][] = array('filename' => htmlspecialchars($result['filename']), 'size' => $result['size']);
}?>

<html>
<head>
<meta charset="UTF-8">
</head>
<body>
<table><?php

foreach ($ids as $id => $updateid) {
	$file_string = '';
	foreach ($files[$id] as $file) {
		$file_string .= $file['filename'] . ' - ' .$file['size'] . '<br>';
	}
	echo '<tr><td><a target=_blank href="http://' . Utils::domain() .'/update/' . $updateid . '">' . $id . '</a></td><td>' . $file_string . '</td><tr>';
}?>

</table>
</body>
</html>