<?php

require_once __DIR__.'/../phplibs/db.php';
require_once __DIR__.'/../phplibs/utils.php';

$ch = curl_init('http://api.bitcoincharts.com/v1/weighted_prices.json');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$currencies = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!empty($currencies)) {
	foreach ($currencies as $currency => $rate) {
		if (is_array($rate) && isset($rate['24h'])) {
			DB::statement('UPDATE currencies SET rate = :rate WHERE currency = :currency', array(':currency' => $currency, ':rate' => $rate['24h']));
		}
	}
}