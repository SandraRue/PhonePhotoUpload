<?php 
if ($_SERVER['REQUEST_METHOD'] == "POST"){
	
	$ip = $_SERVER["REMOTE_ADDR"];
	$time = date("Y-m-d H:i:s", time());
	$from = '';
	if(isset($_SERVER['HTTP_REFERER']))
	{
		$from = $_SERVER['HTTP_REFERER'];
	}
	$myfile = 'upload_log.txt';
	$str = "\r\nip='".$ip."' from='".$from."' time='".$time."' \r\n";
	$postd = var_export( $_POST,true);
	$str = $str . $postd . " \r\n";
	
	
	$file_pointer = fopen($myfile,"a");
	fwrite($file_pointer,$str);
	fclose($file_pointer);
	
	
	$dirname = time();
	mkdir($dirname);
	
	//保存图片数据为文件
	foreach ($_POST as $key=>$image ){
		
		$data = explode(",", $image);
		$data = base64_decode($data[1]);
		
		file_put_contents($dirname.'/'.$key.'.png', $data);
		
	}
	
	
	
	
	echo json_encode( array('status'=>'success'));
	
	exit();
}