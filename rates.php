<?php

require_once __DIR__.'/phplibs/utils.php';

Utils::options_headers();

$expiry = 60 * 5; // 5 minutes
header('Pragma: public');
header('Cache-Control: maxage=' . $expiry);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $expiry) . ' GMT');

echo json_encode(Utils::get_rates(), true);