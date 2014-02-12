<?php

require_once __DIR__.'/jsonrpc/jsonRPCClient.php';
require_once __DIR__.'/db.php';

class Bitcoin {
	private static $bitcoin;
	public static $btcfile_address = '';

	private static function init_bitcoin() {
		if (!is_null(self::$bitcoin)) {
			return;
		}

		self::$bitcoin = new jsonRPCClient('http://btcfile:password@127.0.0.1:8332/');
	}

	public static function get_address($id) {
		self::init_bitcoin();

		$address = self::$bitcoin->getnewaddress($id);

		return $address;
	}

	public static function get_recent_transactions($count = 10) {
		self::init_bitcoin();

		return self::$bitcoin->listtransactions('*', $count);
	}

	public static function send_from($id, $address, $amount, $comment, $comment_to) {
		self::init_bitcoin();

		return self::$bitcoin->sendfrom($id, $address, floatval($amount), 6, $comment, $comment_to);
	}

	public static function set_transaction_fee($amount) {
		self::init_bitcoin();

		return self::$bitcoin->settxfee($amount);
	}

	public static function send_many($id, $destinations) {
		self::init_bitcoin();

		return self::$bitcoin->sendmany($id, $destinations);
	}

	public static function get_balance($account) {
		self::init_bitcoin();

		return self::$bitcoin->getbalance($account);
	}

	public static function move($from_account, $to_account, $amount) {
		self::init_bitcoin();

		return self::$bitcoin->move($from_account, $to_account, $amount);
	}

	public static function get_info() {
		self::init_bitcoin();

		return self::$bitcoin->getinfo();
	}
}