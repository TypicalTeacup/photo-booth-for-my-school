<?php

$uploaddir = scandir(dirname(__FILE__,3)."/photos";
$uploadfile = $uploaddir . basename($_FILES['photo']['name']);

if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadfile)) {
  echo '{"success": 1}';
} else {
   echo '{"success": 0}';
}
?>