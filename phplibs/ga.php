<?php

require_once 'autoload.php';
require_once 'utils.php';

use UnitedPrototype\GoogleAnalytics;

class GA {
	private static $tracker;

	private static function init_ga() {
		if (!is_null(self::$tracker)) {
			return;
		}

		self::$tracker = new GoogleAnalytics\Tracker('', Utils::domain());
		date_default_timezone_set('Europe/Paris');
	}

	public static function event($category = null, $action = null, $label = null, $value = null) {
		self::init_ga();

		$visitor = new GoogleAnalytics\Visitor();

		if (isset($_SERVER['REMOTE_ADDR'])) {
			$visitor->setIpAddress($_SERVER['REMOTE_ADDR']);
		}
		
		if (isset($_SERVER['HTTP_USER_AGENT'])) {
			$visitor->setUserAgent($_SERVER['HTTP_USER_AGENT']);
		}

		$session = new GoogleAnalytics\Session();
		$event = new GoogleAnalytics\Event();

		if (!is_null($category)) {
			$event->setCategory($category);
		}

		if (!is_null($action)) {
			$event->setAction($action);
		}

		if (!is_null($label)) {
			$event->setLabel($label);
		}

		if (!is_null($value)) {
			$event->setValue($value);
		}

		self::$tracker->trackEvent($event, $session, $visitor);
	}
}