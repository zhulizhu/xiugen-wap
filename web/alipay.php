<?php
/************************************
Author		: 老曹
Time		: 2014.12.23
Version		: V1.0
Description : 支付宝自动交易异步通知接口文件.
************************************/

$key = '!@#$%^^%$#@!';//通信秘钥，跟easyPay.exe上填写的接口秘钥保持一致

$sig = $_POST['sig'];//签名
$tradeNo = $_POST['tradeNo'];//交易号
$desc = $_POST['desc'];//交易名称（付款说明）
$time = $_POST['time'];//付款时间
$username = $_POST['username'];//客户名称
$userid = $_POST['userid'];//客户id
$amount = $_POST['amount'];//交易额
$status = $_POST['status'];//交易状态


$orderid=$desc;
$ovalue=$amount;

//验证签名
if(strtoupper(md5("$tradeNo|$desc|$time|$username|$userid|$amount|$status|$key")) == $sig){

	//这里做订单业务，在下面写您的代码即可
	/*
	 * 下面做业务处理，例如充值、开通订单等
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 * 务必注意：必须做重复交易号检测，防止重复充值、开通业务
	 */
	//↓↓↓↓↓↓↓在这里写业务代码↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

	
	
		$dbname = 'xx_ssc';
		$host = 'localhost';
		$user = 'root';
		$pass = 'chuanshuo2013#@!#@!';
		//echo $host."<br>".$dbname."<br>".$user."<br>".$pass;
		$link = mysql_connect($host, $user, $pass);
		if (!$link) {
			die('Could not connect: ' . mysql_error());
		}
		mysql_select_db($dbname);
		//	需要比较返回的金额与商家数据库中订单的金额是否相等，只有相等的情况下才认为是交易成功.
		//	并且需要对返回的处理进行事务控制，进行记录的排它性处理，在接收到支付结果通知后，判断是否进行过业务逻辑处理，不要重复进行业务逻辑处理，防止对同一条交易重复发货的情况发生.
		$actionTime = time();
		$result = mysql_query("select count(*) from gygy_member_recharge where rechargeId='{$orderid}'");
		$num = mysql_result($result, "0");
		if (!$num) {
			echo "<tr align=center bgcolor=#FFFFFF><td colspan=16>暂无充值数据</td></tr>";
			exit;
		} else {
			$result2 = mysql_query("select * from gygy_member_recharge where rechargeId='{$orderid}'");
			$row = mysql_fetch_array($result2);
			if ($row['state'] == '0') {
				$uid = $row['uid'];
				$result21 = mysql_query("select * from gygy_members where uid='{$uid}'");
				$row1 = mysql_fetch_array($result21);
				$oldcoin = $row1['coin'];
				$afmoney=$row1["coin"]+$ovalue;
				$s = "update gygy_members set coin=coin+{$ovalue} where  uid={$row['uid']}";
				if (mysql_db_query($dbname, $s)) {
					echo "";
				} else {
					echo "Error creating database: " . mysql_error();
				}
				$ss = "update gygy_member_recharge set state='1',rechargeAmount={$ovalue},coin={$oldcoin},rechargeTime={$actionTime} where  rechargeId='" . $orderid . "'";
				if (mysql_db_query($dbname, $ss)) {
					$sql_2="insert into gygy_coin_log (uid,type,playedID,coin,userCoin,fcoin,liqType,actionUID,actionTime,ActionIP,info,extfield0,extfield1,extfield2)values('".$uid."','0','0','".$ovalue."','".$afmoney."','0','1','0','".$actionTime."','0','充值','".$orderid."','".$orderid."','')";
					mysql_query($sql_2);
					echo "";
				} else {
					echo "Error creating database: " . mysql_error();
				}
				mysql_close();
				echo '<script>alert("充值成功")</script>';
			} else {
				echo '<script>alert("此订单已经处理，不能重复处理")</script>';
			}
		}	
	
	//↑↑↑↑↑↑↑业务代码结束    ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

	echo "ok";
}
else
	echo "签名错误";

?>