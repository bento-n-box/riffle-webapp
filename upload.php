<? php

var_dump($_POST);
bool move_uploaded_file ( string $filename , string $destination ):

$uploads_dir = '/recordings';
foreach ($_FILES["audio"]["error"] as $key => $error) {
    if ($error == UPLOAD_ERR_OK) {
        $tmp_name = $_FILES["audio"]["tmp_name"][$key];
        $name = $_FILES["audio"]["name"][$key];
        move_uploaded_file($tmp_name, "$uploads_dir/$name");
    }
}

?>
