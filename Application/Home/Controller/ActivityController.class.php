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
class ActivityController extends HomeController{
	//没有任何方法，直接执行HomeController的_empty方法
	//请不要删除该控制器
	
	public final function index() {
				
		$activitys = M('score_goods')->where(array('enable'=>1, 'startTime'=>array('elt',time())))->select();
		
//		$this->recordList($activitys,3);
		$this->assign('data', $activitys);
		$this->xiaofei();
		$this->display('Activity/indexs');
	}
	
	/**
	 * 兑换页
	 */
	public final function swap(){

		$good = M('score_goods')->where(array('id'=>I('id'), 'enable'=>1))->find();
		if ($good) {
			$this->success($good);
		}
	}

	/**
	 * 兑换
	 */
	public final function swapGood(){
		$id = intval(I('goodId'));
		$getcount =intval(I('getcount'));
		
		$good = M('score_goods')->where(array('id'=>$id, 'enable'=>1))->find();
		
		$para['swapTime']=$this->time;
		$para['swapIp']=$this->ip(true)?$this->ip(true):0;
		$para['uid']=$this->user['uid'];
		$para['score']=$good['score'];
		if($good['price']>0){//积分直接兑奖
			$para['state']=0;
		}
		$para['number']=$getcount;
		$para['goodId']=$id;
		
		
		if(!$good) $this->error('兑换商品不存在');
		if($good['stopTime']>0 && $good['stopTime']<$this->time) $this->error('这活动已经过期了');
		if($good['sum']>0 && $good['surplus']==$good['sum']) $this->error('这礼品已经兑换完了');
		
		$this->user = M('members')->find($this->user['uid']);
		if($good['score']*$para['number']>$this->user['score']) $this->error('你拥有积分不足，不能兑换');
		if(think_ucenter_md5(I('coinpwd'), UC_AUTH_KEY)!=$this->user['coinPassword']) $this->error('出款密码不正确');
		
		
		
		M()->startTrans();
		// 
		if($lastid = M('score_swap')->add($para))
		{
			$score_plus=$good['score']*$para['number'];
			if(M('members')->where(array('uid'=>$this->user['uid']))->setDec('score',$score_plus))
			{
				$return1 = M('score_goods')->where(array('id'=>$id))->setInc('surplus',$getcount);
				$return2 = M('score_goods')->where(array('id'=>$id))->setInc('persons',1);

				
				$return3 = true;
				if($good['price']>0){//积分直接兑奖
					$rechargeAmount=$good['price']*$para['number']; //元
						
						$return3 = $this->addCoin(array(
							'uid'=>$this->user['uid'],
							'coin'=>$rechargeAmount,
							'liqType'=>1,
							'extfield0'=>0,
							'extfield1'=>0,
							'info'=>'积分兑换'
						));	
				}//兑换积分结束
				
				if($return1 && $return2 && $return3)
				{
					M()->commit();//成功则提交
					$this->success('兑换礼品成功');
				}
			}
		}
		
		M()->rollback();//不成功，则回滚
		$this->error('兑换礼品出错');
	}
	public final function activity(){
		$where=array();
		$where['uid']=$this->user['uid'];
		$where['isDelete']=0;
		$where['lotteryNo']=array('neq','');
		$where['actionTime']=array('between',array(strtotime('03:00'),strtotime('03:00')+24*60*60));
		$myxf = M('bets')->where($where)->field('sum(mode*beiShu*actionNum) as xiaofei')->find();
		$this->assign('myxf',$myxf);
		$this->display();
	}
	
	public final function xiaofei() {
				
		$xiaofei = M('activity')->where(array())->order('id')->select();		
		$this->assign('xiaofei',$xiaofei);	
		
		$where=array();
		$where['uid']=$this->user['uid'];
		$where['liqType']=array('in',array('101','102','103','7'));
		$time = strtotime('03:00');
		if(time()<$time)
			$time=$time-24*3600;
		$where['actionTime']=array('between',array($time,$time+24*3600));		
		$myxf = M('coin_log')->where($where)->field('-sum(coin) as xiaofei')->find();
		$this->assign('myxf',$myxf);
		if($coin = M('coin_log')->where(array('uid'=>$this->user['uid'],'liqType'=>53,'actionTime'=>array('between',array($time,$time+24*3600))))->select())
			$this->assign('have',true);
		else
			$this->assign('have',false);
//        if (IS_POST) {
//            $this->json($this->view->get());
//        } else {
//            $this->display();
//        }
	}
	public final function onxiaofei() {
		$time=time();
		if($time<strtotime($this->settings['activity_first_time']) || $time>strtotime($this->settings['activity_end_time']))
			$this->error('活动不在有效期');
		$where=array();
		$where['uid']=$this->user['uid'];
		$where['liqType']=array('in',array('101','102','103','7'));
		$time = strtotime('03:00');
		if(time()<$time)
			$time=$time-24*3600;
		$where['actionTime']=array('between',array($time,$time+24*3600));
		$myxf = M('coin_log')->where($where)->field('-sum(coin) as xiaofei')->find();
		
		$xiaofei = M('activity')->where(array('id'=>I('id')))->order('id')->find();
		
		if(!$xiaofei)
			$this->error('该活动id不存在');
		
		if($myxf['xiaofei']<$xiaofei['all'])
			$this->error('您的消费不足'.$xiaofei['all'].'元');
		
		if($coin = M('coin_log')->where(array('uid'=>$this->user['uid'],'liqType'=>53,'actionTime'=>array('between',array($time,$time+24*3600))))->select())
			$this->error('您今日已经领取，请明日再来');
		$return3 = $this->addCoin(array(
			'uid'=>$this->user['uid'],
			'coin'=>$xiaofei['amount'],
			'liqType'=>53,
			'extfield0'=>0,
			'extfield1'=>0,
			'info'=>'消费活动'
		));	
		
		$this->success('领取成功，请查收');
	}
	
	public final function qiandao() {
		$user = M('members')->find($this->user['uid']);
		if($user['coin']<$this->settings['qiandao_base'])
			$this->error('您的本金不足'.$this->settings['qiandao_base'].'元，不能签到');
		
		if($coin = M('coin_log')->where(array('uid'=>$this->user['uid'],'liqType'=>50,'actionTime'=>array('gt',strtotime('03:00'))))->select())
			$this->error('您今日已经签到，请明日再来');
		
		$amount = $this->settings['qiandao_base'] * $this->settings['qiandao_lv']/100;
		$return3 = $this->addCoin(array(
			'uid'=>$this->user['uid'],
			'coin'=>$amount,
			'liqType'=>50,
			'extfield0'=>0,
			'extfield1'=>0,
			'info'=>'签到活动'
		));
		
		$this->success('签到成功，请查收');
	}
}
