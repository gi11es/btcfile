<?php

require_once __DIR__.'/db.php';

class Utils {
	public static function domain() {
		return self::is_local() ? 'btcfile.dev' : 'btcfile.com';
	}

	public static function is_local() {
		return !strcasecmp(gethostname(), 'Ta-Mere.local');
	}

	public static function table($name) {
		$lowered_name = strtolower($name);

		if (self::is_local()) {
			switch ($lowered_name) {
				case 'transaction':
				case 'transaction_confirmed':
				case 'download_address':
					return $lowered_name . '_local';
			}
		}

		return $lowered_name;
	}

	public static function get_rates() {
		$results = DB::statement('SELECT currency, rate FROM currencies', array());

		$rates = array();

		foreach ($results as $result) {
			$rates[$result['currency']] = (float)$result['rate'];
		}

		return $rates;
	}

	public static function options_headers() {
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Headers: pragma,X-Requested-With');
		header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');

		if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
			header('Access-Control-Max-Age: 3600');
			exit();
		}
	}

	public static function no_cache_headers() {
		header('Content-Type: text/plain; charset=utf-8');
		header('Cache-control: no-cache');
	}
}