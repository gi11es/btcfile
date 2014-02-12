<?php

class Zipper {
	public static function compress($id, $files) {
		$temporary_folder = '/tmp/' . uniqid() . '/';
		mkdir($temporary_folder);

		$filepaths = array();
		$shell_filepaths = array();

		foreach ($files as $file) {
			$filepath = $temporary_folder . $file['name'];
			rename($file['tmp_name'], $filepath);
			$shell_filepaths[] = escapeshellarg($filepath);
			$filepaths[] = $filepath;
		}

		$zip_filename = 'btcfile-' . $id . '.zip';
		$zip_path = '/tmp/' . $zip_filename;

		exec('zip -j '.$zip_path.' '.implode(' ', $shell_filepaths), $output);

		foreach ($filepaths as $filepath) {
			unlink($filepath);
		}

		rmdir($temporary_folder);

		return array('tmp_name' => $zip_path, 'name' => $zip_filename);
	}
}