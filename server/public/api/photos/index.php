<?php
header("Content-Type: application/json; charset=UTF-8");
echo json_encode(array_slice(scandir(dirname(__FILE__,3)."/photos"), 2));
?>
