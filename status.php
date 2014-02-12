<?php

set_time_limit(0);
ignore_user_abort(true);

require_once __DIR__.'/phplibs/bitcoin.php';
require_once __DIR__.'/phplibs/utils.php';

$alert_file = sys_get_temp_dir() . '/bitcoind_is_down';
$info = array();

try {
	$info = Bitcoin::get_info();
	if (is_array($info)) {
		if (!isset($info['errors']) || !strlen($info['errors'])) {
			if (file_exists($alert_file)) {
				unlink($alert_file);
				Utils::email('', 'Bitcoind came back up', print_r($info, true));
				Utils::sms('', 'Bitcoind came back up ' . print_r($info, true));
			}
			echo 'OK';
			exit(0);
		}
	}
} catch (Exception $e) {}

echo 'ERROR';

// Don't send the alert more than once until it comes back to life. When bitcoind is down it's really down
if (file_exists($alert_file)) {
	exit(0);
}

Utils::email('', 'Bitcoind failed', print_r($info, true));
Utils::sms('', 'Bitcoind failed ' . print_r($info, true));

touch($alert_file);