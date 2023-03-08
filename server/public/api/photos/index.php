<?=json_encode(array_reverse(array_slice(scandir(dirname(__FILE__,3)."/photos"), 2)));?>
