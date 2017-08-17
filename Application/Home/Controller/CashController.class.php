<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Home\Controller;

/**
 * 空模块，主要用于显示404页面，请不要删除
 */
class CashController extends HomeController{
	//没有任何方法，直接执行HomeController的_empty方法
	//请不要删除该控制器
	
	public final function index(){
		$user=M('members')->find($this->user['uid']);
		if(!$user['coinPassword']){
			show_api_json(0,"请先设置出款密码",'');
			$this->error('请先设置出款密码',U('user/password'));
		}

		
		$bank = M('member_bank')->where(array('enable'=>1,'uid'=>$this->user['uid']))->select();
		if(!$bank){
			show_api_json(0,"请先绑定银行卡",'');
			$this->error('请先绑定银行卡',U('user/bank'));
		}

		$bankList = M('bank_list')->where(array('isDelete'=>0))->field('id as lid,name')->select();
		$bankList2=array();
		foreach($bankList as $b)
		{
			$bankList2[$b['lid']]=$b;
		}
		foreach($bank as $key=>$b){
			if($bbb=$bankList2[$b['bankId']])
			{
				$bank[$key] = array_merge($b,$bbb);
			}
		}
	
		$this->assign('bank',$bank);
		
		$cash = M('member_cash')->where(array('actionTime'=>array('egt',$time), 'uid'=>$this->user['uid']))->field('count(*) as count')->find();
		$this->assign('cashTimes', $cash['count']);
		
		$rechargeTime=strtotime(' 00:00');
		$bet = M('bets')->where(array('actionTime'=>array('egt',$rechargeTime), 'uid'=>$this->user['uid'], 'isDelete'=>0, 'lotteryNo'=>array('neq','')))->field('sum(mode*beiShu*actionNum) as betAmout')->find();
		$betAmout=$bet['betAmout'];
		$this->assign('betAmout', $betAmout);
		//dump($betAmout);
		$gRs = M('member_recharge')->where(array('uid'=>$this->user['uid'], 'state'=>array('in','1,2,9'), 'isDelete'=>0 , 'rechargeTime'=>array('egt',$rechargeTime)))->field('sum(case when rechargeAmount>0 then rechargeAmount else amount end) as rechargeAmount')->find();
		$this->assign('rechargeAmount', $gRs["rechargeAmount"]);

        if (IS_POST || I('api')) {
			$info = [
				'coin' => $user['coin'],
				'cashFromTime' => $this->settings['cashFromTime'],
				'cashToTime' => $this->settings['cashToTime'],
				'cashMin' => $this->settings['cashMin'],
				'cashMax' => $this->settings['cashMax'],
			];
			foreach($bank as $b){
				$info['bank'] = $b;
			}
			$info['bank']['username'] = mb_substr($info['bank']['username'],0,1,'utf-8').'**';
			$info['bank']['account'] = '****'.preg_replace('/^.*(\w{4})$/', '\1', $info['bank']['account']);
			show_api_json(1,'提现信息',$info);
            $this->json($this->view->get());
        } else {
            $this->display();
        }
	}
	
	/**
	 * 提现申请
	 */
	public final function cash(){
		
		$this->getSystemSettings();
		
		$user = M('members')->find($this->user['uid']);
		if($user['coinPassword']!=think_ucenter_md5(I('coinpwd'), UC_AUTH_KEY)){
			show_api_json(0,"出款密码不正确",'');
			$this->error('出款密码不正确');
		}
		if($user['coin']<intval(I('amount'))){
			show_api_json(0,"你帐户资金不足",'');
			$this->error('你帐户资金不足');
		}
		
		// 查询最大提现次数与已经提现次数
		$time=strtotime(date('Y-m-d', $this->time));
		$cash = M('member_cash')->where(array('actionTime'=>array('egt',$time), 'uid'=>$this->user['uid']))->field('count(*) as count')->find();
		$grade = M('member_level')->where(array('level'=>$this->user['grade']))->field('maxToCashCount')->find();
		
		if($times=$cash['count']){
			//$cashTimes=$grade['maxToCashCount'];
			//$cashTimes=$this->settings['cashTimes'];
			$grade = M('member_level')->where(array('minScore'=>array('elt',$user['score'])))->order('minScore desc')->find();
			$cashTimes = $grade['maxToCashCount'];
			if($times>=$cashTimes){
				show_api_json(0,"对不起，今天你提现次数已达到最大限额，请明天再来",'');
				$this->error('对不起，今天你提现次数已达到最大限额，请明天再来');
			}
		}
		
		
		//增加黑客修改提现金额为负数不合法的判断
		if(I('amount')<1){
			show_api_json(0,"提现金额不得低于1元",'');
			$this->error('提现金额不得低于1元');
		}
		$amount = I('amount','','intval');
		if($amount<$this->settings['cashMin'] || $amount>$this->settings['cashMax']){
			show_api_json(0,'提现金额必须介于'.$this->settings['cashMin'].'和'.$this->settings['cashMax'].'之间','');
			$this->error('提现金额必须介于'.$this->settings['cashMin'].'和'.$this->settings['cashMax'].'之间');
		}
		//提示时间检查
		$baseTime=strtotime(date('Y-m-d ',$this->time).'06:00');
		$fromTime=strtotime(date('Y-m-d ',$this->time).$this->settings['cashFromTime'].':00');
		$toTime=strtotime(date('Y-m-d ',$this->time).$this->settings['cashToTime'].':00');
		//if($toTime<$baseTime) $toTime.=24*3600;
		if(($fromTime>$toTime && $this->time < $fromTime && $this->time > $toTime) 
			|| ($fromTime<$toTime && ($this->time < $fromTime || $this->time > $toTime))){
			show_api_json(0,"提现时间：从".$this->settings['cashFromTime']."到".$this->settings['cashToTime'],'');
			$this->error("提现时间：从".$this->settings['cashFromTime']."到".$this->settings['cashToTime']);
		}

		
		//近2天来的消费判断
		$cashAmout=0;
		$rechargeAmount=0;
		$rechargeTime=strtotime(' 00:00');
		if($this->settings['cashMinAmount']){
			$cashMinAmount=$this->settings['cashMinAmount']/100;
			
			$gRs = M('member_recharge')->where(array('uid'=>$this->user['uid'], 'state'=>array('in','1,2,9'), 'isDelete'=>0 , 'rechargeTime'=>array('egt',$rechargeTime)))->field('sum(case when rechargeAmount>0 then rechargeAmount else amount end) as rechargeAmount')->find();
			if($gRs){
				$rechargeAmount=$gRs["rechargeAmount"]*$cashMinAmount;
			}
			
			if($rechargeAmount){
				//近2天来消费总额
				$bet = M('bets')->where(array('actionTime'=>array('egt',$rechargeTime), 'uid'=>$this->user['uid'], 'isDelete'=>0, 'lotteryNo'=>array('neq','')))->field('sum(mode*beiShu*actionNum) as betAmout')->find();
				$betAmout=$bet['betAmout'];
				if(floatval($betAmout)<floatval($rechargeAmount)){
					show_api_json(0,"消费满".$this->settings['cashMinAmount']."%才能提现",'');
					$this->error("消费满".$this->settings['cashMinAmount']."%才能提现");
				}
			}
			
		
		}/////近2天来的消费判断结束
		
				
		$bank = M('member_bank')->where(array('uid'=>$this->user['uid'], 'id'=>I('id')))->select();
		//dump(M('member_bank')->getLastSql());
		if(!$bank){
			show_api_json(0,"提现银行卡不存在",'');
			$this->error('提现银行卡不存在');
		}
		$para['username']=$bank[0]['username'];
		$para['account']=$bank[0]['account'];
		$para['amount']=I('amount');
		$para['bankId']=$bank[0]['bankId'];
		$para['actionTime']=$this->time;
		$para['uid']=$this->user['uid'];
		
		M()->startTrans();
		// 插入提现请求表
		if($lastid = M('member_cash')->add($para))
		{
			// 流动资金
			$return = $this->addCoin(array(
				'coin'=>0-$para['amount'],
				'fcoin'=>$para['amount'],
				'uid'=>$para['uid'],
				'liqType'=>106,
				
				'info'=>"提现[$lastid]资金冻结",
				'extfield0'=>$lastid
			));
			
			if($return)
			{
				M()->commit();//成功则提交
				show_api_json(1,"申请提现成功，提现3分钟内到帐。",'');
				$this->success('申请提现成功，提现3分钟内到帐。（如遇高峰期，可能需要延迟到24小时内到帐）如未到账请联系在线客服。');
			}
		}
		
		M()->rollback();//不成功，则回滚
		show_api_json(0,"提交提现请求出错",'');
		$this->error('提交提现请求出错');
	}
	
	/**
	 * 提现结果
	 */
	public final function result(){
		
		$cash = M('member_cash')->where(array('state'=>1))->field('count(id) as count')->find();
		
		$this->assign('txcount',$cash['count']);
		$this->assign('settings',$this->getSystemSettings());
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display();
        }
	}
	
	//提现详单
	public final function info(){
		$cashInfo = M('member_cash')->where(array('id'=>I('id')))->find();		
		$bankInfo = M('member_bank')->where(array('uid'=>$cashInfo['uid']))->find();
		$list = M('bank_list')->order('id')->select();
		
		$bankList = array();
		if($list) foreach($list as $var){
			$bankList[$var['id']]=$var;
		}
		
		$this->assign('cashInfo',$cashInfo);
		$this->assign('bankInfo',$bankInfo);
		$this->assign('bankList',$bankList);
		
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display('Cash/cash-info');
        }
	}

	/**
	 * 提现是否成功
	 */
	public final function cash_notice(){
		if (IS_POST) {
			$cashInfo = M('member_cash')
				->where(array('uid'=>$this->user['uid'],'state'=>0,'notice'=>0))
				->find();
			if($cashInfo){
				$up = M('member_cash')
					->where(array('id'=>$cashInfo['id']))
					->setField('notice',1);
				if($up){
					$this->success($cashInfo);
				}
			}
		}
	}

}
