<?php

require_once __DIR__.'/../phplibs/db.php';
require_once __DIR__.'/../phplibs/bitcoin.php';
require_once __DIR__.'/../phplibs/utils.php';
require_once __DIR__.'/../phplibs/ga.php';

/* download_address status:
8 => paid, 6+ confirmations
10 => paid, 6+ confirmations, moneys sent
*/

$recipients = array();
$addresses = array();
$total_to_payout = 0.0;
$results = DB::statement('SELECT id, address, seller_address, paid FROM ' . Utils::table('download_address') . ' WHERE status = 8 LIMIT 100', array());

foreach ($results as $result) {
	$addresses[$result['address']] = $result['address'];
	$seller_address = $result['seller_address'];

	if (!isset($recipients[$seller_address])) {
		$recipients[$seller_address] = 0;
	}

	$paid = max(10000, $result['paid']) / 1e8; // In case the buyer paid more than the minimum

	$total_to_payout += $paid;
	$recipients[$seller_address] += $paid;

	// Move the account moneys to the payout account
	Bitcoin::move($result['id'], 'payout', $paid);

	$download_url = 'http://' . Utils::domain() . '/' . base_convert($result['id'], 10, 36);

	GA::event('Producer', 'Earn', $download_url, $paid);
}

$miners_fee = 0.0005;
$total_in_payout_account = Bitcoin::get_balance('payout');

if (!count($recipients)) {
	if ($total_in_payout_account - $miners_fee < $miners_fee * 30) {
		echo ' Warning: less than a month\'s worth of miners fees left in the payout account';
	}
	exit(0);
}

if ($total_to_payout + $miners_fee > $total_in_payout_account) {
	echo 'Something went wrong. Total to send: ' . ($total_to_payout + $miners_fee) . ' total in the payout account: ' . $total_in_payout_account . ' miners fee: ';
	exit(0);
} elseif ($total_in_payout_account - $total_to_payout - $miners_fee < $miners_fee * 30) {
	echo 'Warning: less than a month\'s worth of miners fees left in the payout account';
	// No need to exit, we have enough funds to proceed
}

Bitcoin::set_transaction_fee($miners_fee);

try {
	Bitcoin::send_many('payout', $recipients);
} catch (Exception $e) {
	echo 'Sending the daily payout failed: ' . $e->getmessage();
	exit(0);
}

$placeholders = implode(',', array_fill(0, count($addresses), '?'));

DB::statement('UPDATE ' . Utils::table('download_address') . ' SET status = 10 WHERE address IN (' . $placeholders . ')', array_keys($addresses));