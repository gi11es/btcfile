<?php

$jslist = array('utils.js',
                'i18n/fr.js',
                'i18n/en.js',
                'main.js');

if ($handle = opendir(dirname(__FILE__))) {
    $remote_html = file_get_contents(dirname(__FILE__) . '/../root/remote.html');
    preg_match("/'ga','-([\d]+)'/", $remote_html, $matches);

    if (!isset($matches[1])) {
        echo 'Failed to find current cachebusting version';
        exit(0);
    }

    $concatenated_js = '';

    foreach ($jslist as $js) {
        $concatenated_js .= file_get_contents(dirname(__FILE__) . '/' . $js);
    }

    file_put_contents(dirname(__FILE__) . '/' . 'btcfile.js', $concatenated_js);

	while (false !== ($filename = readdir($handle))) {
        if (substr($filename, -3, 3) != '.gz'
        	&& substr($filename, 0, 1) != '.'
        	&& $filename != 'upload_static.php'
        	&& $filename != 'yuicompressor-2.4.7.jar'
            && !in_array($filename, $jslist)) {
            $path_parts = pathinfo($filename);
        	$filepath = dirname(__FILE__) . '/' . $path_parts['basename'];

            if (!isset($path_parts['extension'])) {
                continue;
            }

            $extension = $path_parts['extension'];

            if ($extension == 'css' || $extension == 'js') {
                $cashebusted_filename = $path_parts['filename'] . '-' . $matches[1] . '.' . $extension;
                $minified_filepath = dirname(__FILE__) . '/compressed/' . $cashebusted_filename;
                exec('java -jar '.escapeshellarg(dirname(__FILE__) . '/yuicompressor-2.4.7.jar').' '.escapeshellarg($filepath).' -o '.escapeshellarg($minified_filepath));
            }
        }
    }

    unlink(dirname(__FILE__) . '/' . 'btcfile.js');

    closedir($handle);
}