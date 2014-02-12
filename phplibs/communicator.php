<?php

class Communicator {
	public static function email($to, $subject, $body) {
		$arguments = array(
			'recipients' => array($to),
			'headers' => array('subject' => $subject, 'from' => ''),
			'content' => $body,
		);
 
		$content = json_encode(array('api_key' => '', 'uid' => uniqid(), 'arguments' => $arguments));
 
		$ch = curl_init('https://api.postageapp.com/v.1.0/send_message.json');
		curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));  
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$output = curl_exec($ch);
		curl_close($ch);
		$result = json_decode($output, true);
 
		return (isset($result['response']) && isset($result['response']['status']) && !strcasecmp($result['response']['status'], 'ok'));
	}

	public static function sms($to, $body) {
		$ch = curl_init('https://api.smsmode.com/http/1.6/sendSMS.do?pseudo=&pass=&message=' . urlencode($body) . '&numero=' . $to);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$output = curl_exec($ch);
		curl_close($ch);

		return $output;
	}
}