<?php

require_once 'AWSSDKforPHP/aws.phar';

use Aws\S3\S3Client;
use Aws\Common\Enum\Region;

class S3er {
	private static $client;
	public static $bucket_name = '';

	private static function init_client() {
		if (!is_null(self::$client)) {
			return;
		}

		self::$client = S3Client::factory(array(
		    'key'    => '',
		    'secret' => '',
		    'region' => Region::US_WEST_2,
		));
	}

	public static function upload($file, $id, $content_encoding = null, $content_type = null, $expires = null) {
		self::init_client();
		$object = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $id,
		    'SourceFile' => $file['tmp_name'],
		);

		if (!is_null($content_encoding)) {
			$object['ContentEncoding'] = $content_encoding;
		}

		if (!is_null($content_type)) {
			$object['ContentType'] = $content_type;
		}

		if (!is_null($expires)) {
			$object['Expires'] = $expires;
		}

		self::$client->putObject($object);

		unlink($file['tmp_name']);
	}

	public static function get_temporary_download_url($id, $original_filename) {
		self::init_client();

		$extra = urlencode('attachment; filename="'.$original_filename.'"');
		$request = self::$client->get('http://' . self::$bucket_name . '/'.$id.'?response-content-disposition='.$extra);

		return self::$client->createPresignedUrl($request, '+5 minutes');
	}

	public static function delete($id) {
		self::init_client();

		$object = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $id,
		   );

		self::$client->deleteObject($object);
	}

	public static function upload_file($path, $filename) {
		self::init_client();
		$object = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $filename,
		    'SourceFile' => $path,
		);

		self::$client->putObject($object);
	}

	public static function exists($key) {
		self::init_client();
		return self::$client->doesObjectExist(self::$bucket_name, $key);
	}

	public static function get_random_key() {
		self::init_client();

		$args = array(
		    'Bucket'     => self::$bucket_name
		   );

		$object = self::$client->listObjects($args);
		$entries = $object->get('Contents');

		return $entries[array_rand($entries)]['Key'];
	}

	public static function get_all_keys() {
		self::init_client();

		$keys = array();

		$args = array(
		    'Bucket'     => self::$bucket_name
		   );

		$object = self::$client->listObjects($args);
		$entries = $object->get('Contents');

		foreach ($entries as $entry) {
			$keys[] = $entry['Key'];
		}

		return $keys;
	}

	public static function get_object_acl($key) {
		self::init_client();

		$args = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $key,
		   );

		$object = self::$client->getObjectAcl($args);

		return $object->get('Grants');
	}

	public static function make_object_public($key) {
		self::init_client();

		$args = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $key,
		    'ACL'		 => 'public-read',
		   );

		$object = self::$client->putObjectAcl($args);
	}

	public static function make_object_private($key) {
		self::init_client();

		$args = array(
		    'Bucket'     => self::$bucket_name,
		    'Key'        => $key,
		    'ACL'		 => 'private',
		   );

		$object = self::$client->putObjectAcl($args);
	}
}