<?php

$start_time = time();

require_once __DIR__.'/../phplibs/db.php';
require_once __DIR__.'/../phplibs/bitcoin.php';
require_once __DIR__.'/../phplibs/utils.php';
require_once __DIR__.'/../phplibs/ga.php';

/* download_address status:
0 => nothing happened
6 => paid, 0 confirmations
7 => partially paid, 0 confirmations
8 => paid, 6+ confirmations
9 => partially paid, 6+ confirmations
*/

function process_unknown_transactions($transactions, $transaction_table, $paid_value, $partially_paid_value, $set_downloadid) {
	$paid_addresses = array();
	$partially_paid_addresses = array();

	foreach ($transactions as $transaction) {
		$address = $transaction['address'];

		$results = DB::statement('SELECT price, downloadid, status, paid FROM ' . Utils::table('download_address') . ' WHERE address = :address', array(':address' => $address));

		if (count($results)) {
			$result = array_pop($results);

			$transaction_amount = $transaction['amount'] * 1e8;
			$income = $result['paid'] + $transaction_amount;

			if ($set_downloadid) {
				DB::statement('UPDATE ' . Utils::table('download_address') . ' SET paid = paid + :amount WHERE address = :address', array(':amount' => $transaction_amount, ':address' => $address));
			}

			$price = max(10000, $result['price']) / 1e8;

			if ($income >= $price) {
				$paid_addresses[$address] = $address;
			} else {
				$partially_paid_addresses[$address] = $address;
			}
		}
	}

	if (count($paid_addresses)) {
		if ($set_downloadid) {
			foreach ($paid_addresses as $address) {
				$downloadid = md5(uniqid());
				DB::statement('UPDATE ' . Utils::table('download_address') . ' SET status = :status, downloadid = :downloadid WHERE address = :address', array(':status' => $paid_value, ':downloadid' => $downloadid, ':address' => $address));
			}
		} else {
			$placeholders = implode(',', array_fill(0, count($paid_addresses), '?'));
			DB::statement('UPDATE ' . Utils::table('download_address') . ' SET status = ' . $paid_value . ' WHERE address IN ('.$placeholders.')', array_keys($paid_addresses));
		}
	}

	if (count($partially_paid_addresses)) {
		$placeholders = implode(',', array_fill(0, count($partially_paid_addresses), '?'));
		DB::statement('UPDATE ' . Utils::table('download_address') . ' SET status = ' . $partially_paid_value . ' WHERE address IN ('.$placeholders.')', array_keys($partially_paid_addresses));
	}

	$placeholders = implode(',', array_fill(0, count($transactions), '(?)'));
	DB::statement('INSERT IGNORE INTO ' . $transaction_table . ' VALUES '.$placeholders,
				  array_keys($transactions));
}

$count = 10;

do {
	$new_transactions = array();
	$confirmed_transactions = array();
	$transactions = Bitcoin::get_recent_transactions($count);

	$txids = array();

	foreach ($transactions as $transaction) {
		if (isset($transaction['txid'])) {
			$txids[$transaction['txid']] = $transaction['txid'];
		}
	}

	if (!count($txids)) {
		// We've reached the end of txids, restart from the beginning
		$count = 0;
		usleep(100000);
		continue;
	}

	$known_txids = array();
	$placeholders = implode(',', array_fill(0, count($txids), '?'));

	$results = DB::statement('SELECT txid FROM ' . Utils::table('transaction') . ' WHERE txid IN ('.$placeholders.')', array_values($txids));
	foreach ($results as $result) {
		$txid = $result['txid'];
		$known_txids[$txid] = $txid;
	}

	$known_confirmed_txids = array();
	$placeholders = implode(',', array_fill(0, count($txids), '?'));

	$results = DB::statement('SELECT txid FROM ' . Utils::table('transaction_confirmed') . ' WHERE txid IN ('.$placeholders.')', array_values($txids));
	foreach ($results as $result) {
		$txid = $result['txid'];
		$known_confirmed_txids[$txid] = $txid;
	}

	foreach ($transactions as $transaction) {
		if (!isset($transaction['txid'])) {
			continue;
		}

		$txid = $transaction['txid'];

		if (isset($transaction['category']) 
			&& !strcasecmp($transaction['category'], 'receive')
			&& isset($transaction['account'])
			&& isset($transaction['address'])
			&& isset($transaction['amount'])) {

			if (!isset($known_txids[$txid])) {
				$new_transactions[$txid] = $transaction;
			}

			if (isset($transaction['confirmations'])
				&& ((int)$transaction['confirmations'] > (Utils::is_local() ? 0 : 5))
				&& !isset($known_confirmed_txids[$txid])) {
				$confirmed_transactions[$txid] = $transaction;

				GA::event('Consumer', 'Pay', $transaction['address'], $transaction['amount']);
			}
		}
	}

	if (count($new_transactions)) {
		process_unknown_transactions($new_transactions, Utils::table('transaction'), 6, 7, true);
	}

	if (count($confirmed_transactions)) {
		process_unknown_transactions($confirmed_transactions, Utils::table('transaction_confirmed'), 8, 9, false);
	}

	$count += 10;
	usleep(100000);
} while (time() - $start_time < 55); // Loop for 55 seconds