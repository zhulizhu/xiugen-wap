<?php 
error_reporting(1);



$conn = mysql_pconnect("localhost","root","ssc1314520");
if (!$conn)
  {
  die('Could not connect: '.mysql_error());
  }

mysql_select_db("lafei_gai2",$conn);
mysql_query( "SET NAMES 'utf8'" );
/*
if($issuecount>=30){
	$sql="select * from gy_data where type='".$id."' order by number desc limit ".$issuecount."";
	$rs=mysql_query($sql) or  die("数据库修改出错!!!!".mysql_error());
	$total= mysql_num_rows($rs);
} */
$issueno=1; 
for($issueno=1;$issueno<289;$issueno++)
{
	$time=date('H:i:s',strtotime(date("00:00:00"))+($issueno)*5*60);
	//echo '"'.$time.'",';
	$sql="insert into gygy_data_time (type,actionNo,actionTime,stopTime) values(36,'{$issueno}','{$time}','00:00:00')";
	//$rs=mysql_query($sql) or  die("数据库修改出错!!!!".mysql_error());
	echo $issueno.'insert success,the time is:'.$time.'<br>';
}



mysql_close($conn);


?>

