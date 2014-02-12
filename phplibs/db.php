<?php

require_once 'AWSSDKforPHP/aws.phar';

use Aws\Rds\RdsClient;
use Aws\Common\Enum\Region;

class DB {
	private static $pdo;
	private static $dsn = 'mysql:dbname=;host=;charset=utf8';
	private static $username = '';
	private static $password = '';

	private static function init_pdo() {
		if (!is_null(self::$pdo)) {
			return;
		}

		self::$pdo = new PDO(self::$dsn, self::$username, self::$password);
	}

	public static function query($sql) {
		self::init_pdo();

		return self::$pdo->query($sql);
	}

	public static function statement($statement, $values) {
		self::init_pdo();

		$sth = self::$pdo->prepare($statement, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute($values);
		return $sth->fetchAll();
	}

	public static function last_insert_id() {
		self::init_pdo();

		return self::$pdo->lastInsertId();
	}
}