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
class RechargeController extends HomeController{
	//没有任何方法，直接执行HomeController的_empty方法
	//请不要删除该控制器
	public final function index(){
		if(IS_POST){
			$this->user = M('members')->where(array('uid'=>$_POST["extra_return_param"]))->find();
			$para['rechargeId']=$_POST["order_no"];
			$para['actionTime']=strtotime($_POST["order_time"]);
			$para['rechargeTime']=time();
			$para['uid']=$this->user['uid'];
			$para['username']=$this->user['username'];
			$para['coin']=$this->user['coin'];
			$para['actionIP']=$this->ip(true);
			$para['mBankId']=I('mBankId');
			$para['info']='自动到账';
			$para['state']=2;
			$para['flag']=1;
			$para['actionUid']=0;
			$para['amount']=$_POST["order_amount"];
			$para['rechargeAmount']=$_POST["order_amount"];
			if(M('member_recharge')->add($para)){
				$this->assign('state','1');
				$Model = new \Think\Model();
				$Model->startTrans();
				$return = $this->addCoin(array(
					'uid'=>$this->user['uid'],
					'coin'=>$para['rechargeAmount'],
					'liqType'=>1,
					'extfield0'=>$this->user['id'],
					'extfield1'=>$para['rechargeId'],
					'info'=>'充值'
				));
				if($return){
					$Model->commit();//成功则提交
				}
				$Model->rollback();//不成功，则回滚
			}
		}
		$set=$this->getSystemSettings();
		$this->assign('set',$set);
		$this->assign('coinPassword',$this->user['coinPassword']);
		$data = [
			'notify_url' => 'http://www.jiuxinyule8.com'.U('recharge/recharge'),
			'return_url' => 'http://www.jiuxinyule8.com'.U('recharge/index'),
			'pay_type' => '',
			'order_no' => $this->getRechId(),
			'extra_return_param' => $this->user['uid']
		];
		$this->assign('data',$data);
		$this->display();
	}
	
	/* 进入充值，生产充值订单 */
	public final function recharge(){
			// 插入提现请求表
		}

	
	private final function getRechId(){
		$rechargeId=mt_rand(100000,999999);
		if(M('member_recharge')->where(array('rechargeId'=>$rechargeId))->find()){
			getRechId();
		}else{
			return $rechargeId;
		}
	}
	
	//充值详单
	public final function info(){
		$rechargeInfo = M('member_recharge')->where(array('id'=>I('id')))->find();		
		$bankInfo = M('member_bank')->where(array('uid'=>$rechargeInfo['uid']))->find();
		$list = M('bank_list')->order('id')->select();
		
		$bankList = array();
		if($list) foreach($list as $var){
			$bankList[$var['id']]=$var;
		}
		
		$this->assign('rechargeInfo',$rechargeInfo);
		$this->assign('bankInfo',$bankInfo);
		$this->assign('bankList',$bankList);
		
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display('Recharge/recharge-info');
        }
	}

	/**
	 * 充值是否成功
	 */
	public final function recharge_notice(){
		if (IS_POST) {
			$Info = M('member_recharge')
				->where(array('uid'=>$this->user['uid'],'state'=>1,'notice'=>0))
				->find();
			if($Info){
				$up = M('member_recharge')
					->where(array('id'=>$Info['id']))
					->setField('notice',1);
				if($up){
					$this->success($Info);
				}
			}
		}
	}
	public final function indexRecharge(){
		if(I('api')){
			$data = [
				'notify_url' => 'http://www.jiuxinyule8.com'.U('recharge/recharge'),
				'return_url' => '',
				'pay_type' => 'b2c,plateform,dcard,express,weixin,alipay',
				'order_no' => $this->getRechId(),
				'extra_return_param' => $this->user['uid']
			];
			show_api_json(1,'充值信息',$data);
		}else{
			if(IS_POST){
				$this->user = M('members')->where(array('uid'=>$_POST["extra_return_param"]))->find();
				$para['rechargeId']=$_POST["order_no"];
				$para['actionTime']=strtotime($_POST["order_time"]);
				$para['rechargeTime']=time();
				$para['uid']=$this->user['uid'];
				$para['username']=$this->user['username'];
				$para['coin']=$this->user['coin'];
				$para['actionIP']=$this->ip(true);
				$para['mBankId']=I('mBankId');
				$para['info']='自动到账';
				$para['state']=2;
				$para['flag']=1;
				$para['actionUid']=0;
				$para['amount']=$_POST["order_amount"];
				$para['rechargeAmount']=$_POST["order_amount"];
				if(M('member_recharge')->add($para)){
					$this->assign('state','1');
					$Model = new \Think\Model();
					$Model->startTrans();
					$return = $this->addCoin(array(
						'uid'=>$this->user['uid'],
						'coin'=>$para['rechargeAmount'],
						'liqType'=>1,
						'extfield0'=>$this->user['id'],
						'extfield1'=>$para['rechargeId'],
						'info'=>'充值'
					));
					if($return){
						$Model->commit();//成功则提交
					}
					$Model->rollback();//不成功，则回滚
				}
			}
		}
	}
}
