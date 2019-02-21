<?php
header('Content-type: image/svg+xml');
header("Content-Disposition: attachment; filename=mapsvg.svg");
echo file_get_contents($_SERVER['DOCUMENT_ROOT'].$_GET['file']);
?>