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
class TeamController extends HomeController
{

	/*游戏记录*/
	public final function record()
	{
		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);

		$this->search();

		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/record');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/record-list');
			}
		}
	}

	public final function search()
	{
		$para = I('param.');

		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);


		$where = array();
		$page = $para['page'];
		// 用户名限制
		if(I('username')){
			$para['username'] = I('username');
		}
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		}
		//用户类型限制
		if(I('utype') && I('api')){
			$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$map['uid'] = array('NEQ',$this->user['uid']);
			$map['_logic'] = 'and';
		}else{
			switch ($para['utype']) {
				case 1:
					//我自己
					$map['uid'] = $this->user['uid'];
					break;
				case 2:
					//直属下线
					$map['parentId'] = $this->user['uid'];
					break;
				case 3:
//				// 所有下级
//				$map['parents'] = array('like','%,'.$this->user['uid'].',%');
//				break;
					$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
					$map['uid'] = $this->user['uid'];
					$map['_logic'] = 'or';
					break;
				default:
					//所有人
					$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
					$map['uid'] = $this->user['uid'];
					$map['_logic'] = 'or';
					break;
			}
		}


		$where['_complex'] = $map;
		if(empty(I('api')) || I('utype')){
			$userList = M('members')->field('uid,username')->where($where)->select();
		}else{
			$userList = M('members')->field('uid,username')->where(array('uid'=>$this->user['uid']))->select();
		}
		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();
		// 彩种限制
		if(I('type')){
			$para['type'] = I('type');
		}
		if ($para['type']) {
			$where['type'] = $para['type'];
		}
		// 玩法限制
		if(I('played')){
			$para['played'] = I('played');
		}
		if ($para['played']) {
			$where['playedId'] = $para['played'];
		}

		// 时间限制
		if((I('fromTime') || I('toTime')) && I('api')){
			$para['fromTime'] = I('fromTime');
			$para['toTime'] = I('toTime')." 23:59:59";
		}
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime'] && empty(I('api'))) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		// 投注状态限制
		if ($para['state']) {
			switch ($para['state']) {
				case 1:
					// 已派奖
					$where['zjCount'] = array('gt', 0);
					break;
				case 2:
					// 未中奖
					$where['zjCount'] = 0;
					$where['lotteryNo'] = array('neq', '');
					$where['isDelete'] = 0;

					break;
				case 3:
					// 未开奖
					$where['lotteryNo'] = array('eq', '');
					break;
				case 4:
					// 追号
					$where['zhuiHao'] = 1;
					break;
				case 5:
					// 撤单
					$where['isDelete'] = 1;
					break;
			}
		}

		//追号接口限制

		if(I('api')){
			if ($para['status']) {
				switch ($para['status']) {
					case 1:
						//已完成
						$where['lotteryNo'] = array('neq', '');
						break;
					case 2:
						// 取消
						$where['lotteryNo'] = array('eq', '');
						$where['isDelete'] = 1;

						break;
					case 3:
						// 进行中
						$where['lotteryNo'] = array('eq', '');
						break;
				}
			}
		}


		//单号
		if ($para['betId'] && $para['betId'] != '输入单号') $where['wjorderId'] = $para['betId'];
//		$types[$var['type']]['title'];
		$where['uid'] = array('in', $userStr);
		$betList = M('bets')->where($where)->order('id desc,actionTime desc')->select();
		if(I('api')){
			$total = count($betList);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$betLists = M('bets')->where($where)->order('id desc,actionTime desc')->limit($offset,$num)->select();
			foreach($betLists as $k=> $v){
				$betLists[$k]['title'] = $this->types[$v['type']]['title'];
				$betLists[$k]['played'] = $this->playeds[$v['playedId']]['name'];
				$betLists[$k]['betCoin'] = $v['mode']*$v['beiShu']*$v['actionNum']*($v['fpEnable']+1);
				$betLists[$k]['yingKui'] = $v['bonus'] - $v['betCont'] - $v['fanDianCount'];
				if($v['isDelete']==1){
					$betLists[$k]['state'] = '已撤单';
				}elseif(!$v['lotteryNo']){
					$betLists[$k]['state'] = '未开奖';
				}elseif($v['zjCount']){
					$betLists[$k]['state'] = '已中奖';
				}else{
					$betLists[$k]['state'] = '未中奖';
				}
			}
			$info = [
				'betLists' =>$betLists,
				'total' =>$total,
			];
			if(I('utype')){
				$info['types'] = M('type')->where(array('isDelete'=>0,'enable'=>1))->order('sort')->select();
			}
			if(empty($betLists)){
				show_api_json(0,'暂无记录',$info);
			}else{
				show_api_json(1,'记录',$info);
			}
		}
		$this->recordList($betList);
	}

	public final function searchRecord()
	{
		$this->search();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/record-list');
		}
	}

//根据彩种查找玩法
	function getPlayedsByType()
	{
		$id = I('type');
		$type = M('type')->where(array('id' => $id))->getField('type');
		$playeds = M('played')->cache(true, 10 * 60, 'xcache')->where(array('enable' => 1, 'type' => $type))->order('sort')->select();
		show_api_json(1,'玩法',$playeds);
		$data = array();
		if ($playeds) foreach ($playeds as $var) {
			$data[$var['id']] = $var;
		}
		$playeds = $data;
		$this->success($playeds);
	}

	/*合买记录*/
	public final function hemai()
	{
		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);

		$this->Hemaisearch();

		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/hemai');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/hemai_list');
			}
	}

	public final function searchHemai()
	{
		$this->Hemaisearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/hemai_list');
		}
	}

	public final function Hemaisearch()
	{
		$para = I('get.');

		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);

		$where = array();
		// 彩种限制
		if ($para['type']) {
			$where['type'] = $para['type'];
		}
		// 时间限制
		$map_hm = array();
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
			$map_hm['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
			$map_hm['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
			$map_hm['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
				$map_hm['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}
		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		}
		$where['hmEnable'] = 1;
		$where['hmIsFa'] = 1;
		$betList = M('bets')->where($where)->order('id desc,actionTime desc')->select();

		$hemailist = M('bets_hemai')->where($map_hm)->order('id desc')->select();
		$hemaiData = array();
		foreach ($hemailist as $hemai) {
			$hemaiData[$hemai['id']] = $hemai;
		}
		foreach ($betList as $bet) {
			if ($bet['hmId'])
				$hemai = $hemaiData[$bet['hmId']];
			if ($hemai) {
				unset($hemai['id']);
				$data[$bet['id']] = array_merge($bet, $hemai);
			}
		}

		$this->recordList($data);
	}

	/*盈亏报表*/
	public final function report()
	{

		$this->reportSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/report');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/report-list');
			}
	}

	public final function searchReport()
	{
		$this->reportSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/report-list');
		}
	}

	public final function reportSearch()
	{
		$para = I('get.');

		$where = array();
		$parentWhere = array();
		// 用户限制
		$uid = $this->user['uid'];
		if ($para['parentId'] = intval($para['parentId'])) {
			// 直属下级
			$where['parentId'] = $para['parentId'];

			$parentWhere['parents'] = array('like', "%," . $para['parentId'] . ",%");
			$parentWhere['uid'] = $para['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['uid']) {
			// 上级
			$user = M('members')->where(array('uid' => $para['uid']))->find();
			$where['uid'] = $user['parentId'];

			$parentWhere['parents'] = array('like', "%," . $user['parentId'] . ",%");
			$parentWhere['uid'] = $user['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['username'] && $para['username'] != '用户名') {
			// 用户名限制

			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = $para['username'];
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");

			$user = M('members')->where(array('username' => $para['username']))->find();
			$parentWhere['parents'] = array('like', "%," . $user['uid'] . ",%");
			$parentWhere['uid'] = $user['uid'];
			$parentWhere['_logic'] = 'or';
		} else {
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$where['uid'] = $this->user['uid'];
			$where['_logic'] = 'or';

			$parentWhere['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$parentWhere['uid'] = $this->user['uid'];
			$parentWhere['_logic'] = 'or';
		}

		$userList = M('members')->field('uid,username,parentId,coin')->where($where)->order('uid')->select();

		$userData = array();
		foreach ($userList as $user) {
			//$userStr = $userStr.$user['uid'].',';
			$userData[$user['uid']] = $user;
		}

		$map = array();
		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$map['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$map['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}
		//dump($map['actionTime']);
		//$map['uid'] = array('in',$userStr);

		$coinList = M('coin_log')->where($map)->field("actionTime,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount, 
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount, 
		sum(case when liqType=6 then coin else 0 end) as zjAmount, 
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount, 
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount, 
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('uid')->select();

		$allList = M('members')->where($parentWhere)->field('uid,coin')->order('uid')->select();

		foreach ($coinList as $coin) {
			$user2 = $userData[$coin['uid']];
			if ($user2) {
				$data[$coin['uid']] = array_merge($coin, $user2);
			}

			foreach ($allList as $user) {
				if ($coin['uid'] == $user['uid']) {
					$all['betAmount'] += $coin['betAmount'];
					$all['zjAmount'] += $coin['zjAmount'];
					$all['fanDianAmount'] += $coin['fanDianAmount'];
					$all['brokerageAmount'] += $coin['brokerageAmount'];
					$all['cashAmount'] += $coin['cashAmount'];
					$all['rechargeAmount'] += $coin['rechargeAmount'];
				}
				$all['coin'] += $user['coin'];
			}
		}
		//将没有消费的用户补上为0，显示出来，提高用户体验
		foreach ($userData as $u) {
			if (!$data[$u['uid']]) {
				$data[$u['uid']] = array('uid' => $u['uid'],
					'parentId' => $u['parentId'],
					'username' => $u['username'],
					'betAmount' => 0.0000,
					'zjAmount' => 0.0000,
					'fanDianAmount' => 0.0000,
					'brokerageAmount' => 0.0000,
					'cashAmount' => 0.0000,
					'coin' => $u['coin'],
					'rechargeAmount' => 0.0000,
				);
			}
		}

		$info = [
			'data' => $data,
			'all' =>$all
		];
		show_api_json(1,'盈亏报表',$info);
		$this->recordList($data);

		//团队
		$this->assign('all', $all);

		$this->assign('para', $para);
		$this->assign('user', $this->user);
	}

	/*个人报表*/
	public final function personal_report()
	{
		$this->personal_reportSearch();
		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/personal_report');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/personal_report_list');
			}
		}
	}

	public final function personal_searchReport()
	{
		$this->personal_reportSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/personal_report_list');
		}
	}

	public final function personal_reportSearch()
	{
		$para = I('get.');

		// 用户限制
		$uid = $this->user['uid'];
		$map = array();
		$map['uid'] = $uid;
		// 时间限制
		if((I('fromTime') || I('toTime')) && I('api')){
			$para['fromTime'] = I('fromTime');
			$para['toTime'] = I('toTime')." 23:59:59";
		}
		if ($para['fromTime'] && $para['toTime']) {
			$map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$map['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$map['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime'] && empty(I('api'))) {
				$map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$coinList = M('coin_log')->where($map)->field("FROM_UNIXTIME(actionTime, '%Y-%m-%d') as time,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount,
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount,
		count(case when liqType in ('101','102','103','7') then coin else null end) as betSum,
		sum(case when liqType=6 then coin else 0 end) as zjAmount,
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount,
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount,
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('time')->order('time desc')->select();

		if(I('api')){
			$total = count($coinList);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$coinLists = M('coin_log')->where($map)->field("FROM_UNIXTIME(actionTime, '%Y-%m-%d') as time,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount,
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount,
		count(case when liqType in ('101','102','103','7') then coin else null end) as betSum,
		sum(case when liqType=6 then coin else 0 end) as zjAmount,
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount,
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount,
		sum(case when liqType=12 then coin else 0 end) as transferAmount,
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('time')->order('time desc')->limit($offset,$num)->select();

			$data = $coinLists;
			foreach($data as $k=>$v){
				$data[$k]['yingKui'] = sprintf("%.5f",($v['zjAmount']-$v['betAmount']+$v['fanDianAmount']));
			}
		}else{
			$data = $coinList;
		}


		$parentWhere = array();
		if ($para['parentId'] = intval($para['parentId'])) {
			// 直属下级
			$where['parentId'] = $para['parentId'];
			$parentWhere['parents'] = array('like', "%," . $para['parentId'] . ",%");
			$parentWhere['uid'] = $para['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['uid']) {
			// 上级
			$user = M('members')->where(array('uid' => $para['uid']))->find();
			$where['uid'] = $user['parentId'];
			$parentWhere['parents'] = array('like', "%," . $user['parentId'] . ",%");
			$parentWhere['uid'] = $user['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['username'] && $para['username'] != '用户名') {
			// 用户名限制

			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = $para['username'];
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");

			$user = M('members')->where(array('username' => $para['username']))->find();
			$parentWhere['parents'] = array('like', "%," . $user['uid'] . ",%");
			$parentWhere['uid'] = $user['uid'];
			$parentWhere['_logic'] = 'or';
		} else {
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$where['uid'] = $this->user['uid'];
			$where['_logic'] = 'or';

			$parentWhere['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$parentWhere['uid'] = $this->user['uid'];
			$parentWhere['_logic'] = 'or';
		}
		$allList = M('members')->where($parentWhere)->field('uid,coin')->order('uid')->select();
		foreach ($coinList as $coin) {
			$user2 = $userData[$coin['uid']];
			if ($user2) {
				$data[$coin['uid']] = array_merge($coin, $user2);
			}

			foreach ($allList as $user) {
				if ($coin['uid'] == $user['uid']) {
					$all['betAmount'] += $coin['betAmount'];
					$all['zjAmount'] += $coin['zjAmount'];
					$all['fanDianAmount'] += $coin['fanDianAmount'];
					$all['brokerageAmount'] += $coin['brokerageAmount'];
					$all['cashAmount'] += $coin['cashAmount'];
					$all['rechargeAmount'] += $coin['rechargeAmount'];
				}
				$all['coin'] += $user['coin'];
			}
		}
		//将没有消费的用户补上为0，显示出来，提高用户体验

			$info = [
				'data' =>$data,
				'total' =>$total,
			];
		if(empty($data)){
			show_api_json(0,'暂无数据',$info);
		}else{
			show_api_json(1,'个人报表',$info);
		}


		$this->recordList($data);

		//团队
		$this->assign('all', $all);

		$this->assign('para', $para);
		$this->assign('user', $this->user);
	}

	/*彩票报表*/
	public final function lottery_report()
	{
		$this->lottery_reportSearch();
		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/lottery_report');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/lottery_report_list');
			}
		}
	}

	public final function lottery_searchReport()
	{
		$this->lottery_reportSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/lottery_report_list');
		}
	}

	public final function lottery_reportSearch()
	{
		$para = I('get.');

		// 用户限制
		$uid = $this->user['uid'];
		$map = array();
		if ($para['sear'] == 1) {
			$map['uid'] = $uid;
		}else{
			$ma['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$ma['uid'] = $this->user['uid'];
			$ma['_logic'] = 'or';
			$whe['_complex'] = $ma;
			$userList = M('members')->field('uid,username')->where($whe)->select();
			$userStr = '';
			foreach ($userList as $user) {
				$userStr = $userStr . $user['uid'] . ',';
			}
			$userStr = substr($userStr, 0, -1);
			$map['uid'] = array('in', $userStr);
		}
		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$map['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$map['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$coinList = M('coin_log')->where($map)->field("FROM_UNIXTIME(actionTime, '%Y-%m-%d') as time,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount,
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount,
		count(case when liqType in ('101','102','103','7') then coin else null end) as betSum,
		sum(case when liqType=6 then coin else 0 end) as zjAmount,
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount,
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount,
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('time')->order('time desc')->select();

		$data = $coinList;

		$parentWhere = array();
		if ($para['parentId'] = intval($para['parentId'])) {
			// 直属下级
			$where['parentId'] = $para['parentId'];
			$parentWhere['parents'] = array('like', "%," . $para['parentId'] . ",%");
			$parentWhere['uid'] = $para['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['uid']) {
			// 上级
			$user = M('members')->where(array('uid' => $para['uid']))->find();
			$where['uid'] = $user['parentId'];
			$parentWhere['parents'] = array('like', "%," . $user['parentId'] . ",%");
			$parentWhere['uid'] = $user['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['username'] && $para['username'] != '用户名') {
			// 用户名限制

			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = $para['username'];
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");

			$user = M('members')->where(array('username' => $para['username']))->find();
			$parentWhere['parents'] = array('like', "%," . $user['uid'] . ",%");
			$parentWhere['uid'] = $user['uid'];
			$parentWhere['_logic'] = 'or';
		} else {
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$where['uid'] = $this->user['uid'];
			$where['_logic'] = 'or';

			$parentWhere['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$parentWhere['uid'] = $this->user['uid'];
			$parentWhere['_logic'] = 'or';
		}
		$userList = M('members')->field('uid,username,parentId,coin')->where($where)->order('uid')->select();
		$userData = array();
		foreach ($userList as $user) {
			//$userStr = $userStr.$user['uid'].',';
			$userData[$user['uid']] = $user;
		}
		$allList = M('members')->where($parentWhere)->field('uid,coin')->order('uid')->select();
		foreach ($coinList as $coin) {
			$user2 = $userData[$coin['uid']];
//			if ($user2) {
//				$data[$coin['uid']] = array_merge($coin, $user2);
//			}

			foreach ($allList as $user) {
				if ($coin['uid'] == $user['uid']) {
					$all['betAmount'] += $coin['betAmount'];
					$all['betSum'] += $coin['betSum'];
					$all['zjAmount'] += $coin['zjAmount'];
					$all['fanDianAmount'] += $coin['fanDianAmount'];
					$all['brokerageAmount'] += $coin['brokerageAmount'];
					$all['cashAmount'] += $coin['cashAmount'];
					$all['rechargeAmount'] += $coin['rechargeAmount'];
				}
				$all['coin'] += $user['coin'];
			}
		}
		//将没有消费的用户补上为0，显示出来，提高用户体验
		$info = [
			'data' => $data,
			'all' => $all,
		];
		show_api_json(1,'彩票报表',$info);
		$this->recordList($data);

		//团队
		$this->assign('all', $all);

		$this->assign('para', $para);
		$this->assign('user', $this->user);
	}

	/*平台报表*/
	public final function platform_report()
	{
		$this->platform_reportSearch();
		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/platform_report');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/platform_report_list');
			}
		}
	}

	public final function platform_searchReport()
	{
		$this->platform_reportSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/platform_report_list');
		}
	}

	public final function platform_reportSearch()
	{
		$para = I('get.');

		$where = array();
		$parentWhere = array();
		// 用户限制
		$uid = $this->user['uid'];
		if ($para['parentId'] = intval($para['parentId'])) {
			// 直属下级
			$where['parentId'] = $para['parentId'];

			$parentWhere['parents'] = array('like', "%," . $para['parentId'] . ",%");
			$parentWhere['uid'] = $para['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['uid']) {
			// 上级
			$user = M('members')->where(array('uid' => $para['uid']))->find();
			$where['uid'] = $user['parentId'];

			$parentWhere['parents'] = array('like', "%," . $user['parentId'] . ",%");
			$parentWhere['uid'] = $user['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['username'] && $para['username'] != '用户名') {
			// 用户名限制

			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = $para['username'];
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");

			$user = M('members')->where(array('username' => $para['username']))->find();
			$parentWhere['parents'] = array('like', "%," . $user['uid'] . ",%");
			$parentWhere['uid'] = $user['uid'];
			$parentWhere['_logic'] = 'or';
		} else {
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$where['uid'] = $this->user['uid'];
			$where['_logic'] = 'or';

			$parentWhere['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$parentWhere['uid'] = $this->user['uid'];
			$parentWhere['_logic'] = 'or';
		}

		$userList = M('members')->field('uid,username,parentId,coin')->where($where)->order('uid')->select();

		$userData = array();
		foreach ($userList as $user) {
			//$userStr = $userStr.$user['uid'].',';
			$userData[$user['uid']] = $user;
		}

		$map = array();
		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$map['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$map['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}
		//dump($map['actionTime']);
		//$map['uid'] = array('in',$userStr);

		$coinList = M('coin_log')->where($map)->field("actionTime,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount,
		count(case when liqType in ('2','3') then coin else null end) as fanDianCount,
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount,
		count(case when liqType in ('101','102','103','7') then coin else null end) as betCount,
		sum(case when liqType=6 then coin else 0 end) as zjAmount,
		count(case when liqType=6 then coin else null end) as zjCount,
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount,
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount,
		count(case when liqType=1 then coin else null end) as rechargeCount,
		count(case when liqType=107 then coin else null end) as cashCount,
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount,
		count(case when liqType in ('50','51','52','53') then coin else null end) as brokerageCount
		")->group('uid')->select();

		$allList = M('members')->where($parentWhere)->field('uid,coin')->order('uid')->select();

		foreach ($coinList as $coin) {
			$user2 = $userData[$coin['uid']];
			if ($user2) {
				$data[$coin['uid']] = array_merge($coin, $user2);
			}

			foreach ($allList as $user) {
				if ($coin['uid'] == $user['uid']) {
					$all['betAmount'] += $coin['betAmount'];
					$all['zjAmount'] += $coin['zjAmount'];
					$all['fanDianAmount'] += $coin['fanDianAmount'];
					$all['brokerageAmount'] += $coin['brokerageAmount'];
					$all['cashAmount'] += $coin['cashAmount'];
					$all['rechargeAmount'] += $coin['rechargeAmount'];
				}
				$all['coin'] += $user['coin'];
			}
		}
		//将没有消费的用户补上为0，显示出来，提高用户体验
		foreach ($userData as $u) {
			if (!$data[$u['uid']]) {
				$data[$u['uid']] = array('uid' => $u['uid'],
					'parentId' => $u['parentId'],
					'username' => $u['username'],
					'betAmount' => 0.0000,
					'zjAmount' => 0.0000,
					'fanDianAmount' => 0.0000,
					'brokerageAmount' => 0.0000,
					'cashAmount' => 0.0000,
					'coin' => $u['coin'],
					'rechargeAmount' => 0.0000,
				);
			}
		}
		$info = [
			'data' => $data,
			'all' => $all
		];
		show_api_json(1,'平台报表',$info);
		$this->recordList($data);

		//团队
		$this->assign('all', $all);

		$this->assign('para', $para);
		$this->assign('user', $this->user);
	}


//会员管理
	public final function member()
	{
		//dump(I('get.'));
		$this->memberSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/member');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/member-list');
			}
	}

	public final function searchMember()
	{
		$this->memberSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/member-list');
		}
	}

	public final function memberSearch()
	{

		$where = [];

		//用户类型
		if (I('usertype') == 1) {
			$where['type'] = 1;
		} elseif (I('usertype') == 2) {
			$where['type'] = 0;
		}

		if (I('balancebegin') && I('balanceend')) {
			$where['coin'] = array('between', array(I('balancebegin'), I('balanceend')));
		}
		if (I('rebatebegin') && I('rebateend')) {
			$where['fanDian'] = array('between', array(I('rebatebegin'), I('rebateend')));
		}

		//根据排序
		if (I('by') == 1 && I('sort') == 1) {
			$order = 'username asc';
		} elseif (I('by') == 1 && I('sort') == 2) {
			$order = 'username desc';
		} elseif (I('by') == 2 && I('sort') == 1) {
			$order = 'coin asc';
		} elseif (I('by') == 2 && I('sort') == 2) {
			$order = 'coin desc';
		} elseif (I('by') == 0 && I('sort') == 2) {
			$order = 'regTime desc';
		} else {
			$order = 'regTime asc';
		}

		if (I('username') && I('username') != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where1['username'] = array('like', "%" . I('username') . "%");
			$where1['parents'] = array('like', "%," . $this->user['uid'] . ",%");

		} else {
//			switch(I('utype')){
//				case 1:
//					// 我自己
//					$where['uid'] = $this->user['uid'];
//					break;
//				case 2:
//					// 直属下级
//					$uid = $this->user['uid'];
//					if(I('uid')) {
//						$uid = I('uid');
//					}
//					$where['parentId'] = $uid;
//					break;
//				case 3:
//					// 所有下级
//					$where['parents'] = array('like',"%".$this->user['uid'].",%");
//					break;
//				default:
			//所有人
//					$where1['parents'] = array('like',"%,".$this->user['uid'].",%");
//					$where1['uid'] = $this->user['uid'];
//					$where1['_logic'] = 'or';
//					break;
//			}
			//范围
			if (I('range') == 1) {
				$where1['parents'] = array('like', "%" . $this->user['uid'] . ",%");
			} else {
				$uid = $this->user['uid'];
				if (I('uid')) {
					$uid = I('uid');
				}
				$where1['parentId'] = $uid;
			}
		}
		$where['_complex'] = $where1;
		$logins = M('member_session')->where(array('accessTime' => array('gt', time() - 15 * 60), 'isOnLine' => 1))->order('id')->select();
		foreach ($logins as $l) {
			$logins2[$l['uid']] = $l;
		}

		$this->assign('user', $this->user);
		$this->assign('logins2', $logins2);

		$userList = M('members')->where($where)->order($order)->select();
		//dump($where);
		if(I('api')){
			$total = count($userList);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$userList = M('members')->where($where)->order($order)->limit($offset,$num)->select();
			foreach ($userList as $k => $value) {
				if ($logins2[$value['uid']]) {
					$userList[$k]['state'] = '在线';
				}else{
					$userList[$k]['state'] = '离线';
				}
			}
		}
		$userListApi = array();
		//在线状态
		if (I('state') == 1) {
			foreach ($userList as $k => $value) {
				if ($logins2[$value['uid']]) {
					unset($userList[$k]);
				}else{
					$userListApi[] = $userList[$k];
				}
			}
		} elseif (I('state') == 2) {
			foreach ($userList as $k => $value) {
				if (!$logins2[$value['uid']]) {
					unset($userList[$k]);
				}else{
					$userListApi[] = $userList[$k];
				}
			}
		}else{
			$userListApi = $userList;
		}

		$info = [
			'data' =>$userListApi,
			'total' =>$total,
		];
		if(empty($userListApi)){
			show_api_json(0,'暂无数据',$info);
		}else{
			show_api_json(1,'会员列表',$info);
		}
		$this->recordList($userList, 10);
		$this->assign('user', $this->user);
	}

	public final function userUpdate()
	{

		$user = M('members')->find(I('id'));
		$this->assign('userData', $user);

		$parentData = M('members')->find($user['parentId']);

		if ($userData['parentId']) {
			$parentData = $parentData;
		} else {
			$this->getSystemSettings();
			$parentData['fanDian'] = $this->settings['fanDianMax'];
			$parentData['fanDianBdw'] = $this->settings['fanDianBdwMax'];
		}
		$sonFanDianMax = M('members')->where(array('isDelete' => 0, 'parentId' => I('uid')))->field('max(fanDian) sonFanDian, max(fanDianBdw) sonFanDianBdw')->find();

		$this->assign('parentData', $parentData);
		$this->assign('sonFanDianMax', $sonFanDianMax);
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/update-menber');
		}
	}

	public final function userUpdateed()
	{
		if (I('fanDian') < 0)
			$this->error('返点不能小于0');
		$user = M('members')->where(array('username' => I('username')))->find();
		if ($this->user['uid'] != $user['parentId'])
			$this->error('不是你的直属下级，不可以修改');

		if ($this->user['fanDian'] <= I('fanDian'))
			$this->error('返点不可以大于上级');

		$sonFanDianMax = M('members')->where(array('isDelete' => 0, 'parentId' => $user['uid']))->field('max(fanDian) sonFanDian, max(fanDianBdw) sonFanDianBdw')->find();

		if ($sonFanDianMax['sonFanDian']) {
			if ($sonFanDianMax['sonFanDian'] >= I('fanDian'))
				$this->error('返点不可以小于直属下级' . $sonFanDianMax['sonFanDian']);
		}

		$data['uid'] = $user['uid'];
		$data['fanDian'] = I('fanDian');
		$data['type'] = I('type');

		if (M('members')->save($data)) {
			$this->success('修改成功', U('Team/member'));
		} else {
			$this->error('修改失败');
		}
	}

	public final function addMember()
	{
		//print_r($this->getMyUserCount());
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/add-member');
		}
	}

	public final function insertMember()
	{
		$username = I('username');
		$password = I('password');
		if (!$username . trim() || !$password . trim())
			$this->error('用户名或密码不能为空');

		if (!preg_match("/^[0-9a-zA-Z]{4,30}$/", I('username'))) {
			$this->error('用户名只能由英文和数字组成，长度4-30个字符');
		}

		if (M('members')->where(array('username' => I('username')))->find())
			$this->error('用户' . I('username') . '已经存在');


		if (I('fanDian') < 0)
			$this->error('返点不能小于0');

		if ($this->user['fanDian'] <= I('fanDian'))
			$this->error('返点不可以大于上级');

		$para['parentId'] = $this->user['uid'];
		$para['parents'] = $this->user['parents'];
		$para['parents2'] = $this->user['parents2'] . '>' . I('username');
		$para['password'] = think_ucenter_md5(I('password'), UC_AUTH_KEY);
		$para['username'] = I('username');
		$para['qq'] = I('qq');
		$para['type'] = I('type');
		$para['regIP'] = $this->ip(true);
		$para['regTime'] = $this->time;

		if (!$para['nickname']) $para['nickname'] = $para['username'];
		if (!$para['name']) $para['name'] = $para['username'];


		// 查检返点设置
		if ($para['fanDian'] = floatval(I('fanDian'))) {
			$this->getSystemSettings();
			if ($para['fanDian'] % $this->settings['fanDianDiff']) $this->error(sprintf('返点只能是%.1f%的倍数', $this->settings['fanDianDiff']));
		} else {
			$para['fanDian'] = 0;
		}

		M()->startTrans();
		if ($lastid = M('members')->add($para)) {
			if (M('members')->save(array('uid' => $lastid, 'parents' => $this->user['parents'] . ',' . $lastid))) {
				M()->commit();//成功则提交
				$this->success('添加会员成功', U('team/member'));
			}
		}

		M()->rollback();//不成功，则回滚
		$this->error('添加会员失败');

	}

	/*帐变列表*/
	public final function coin()
	{
		$this->coinSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/coin');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/coin-list');
			}
	}

	public final function searchCoin()
	{
		$this->coinSearch();

		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/coin-list');
		}
	}

	public final function coinSearch()
	{
		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);

		$para = I('get.');
		$where = array();

		// 用户名限制
		if(I('username')){
			$para['username'] = I('username');
		}
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . $para['username'] . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		}
		//用户类型限制
		if(I('utype')){
			$para['utype'] = I('utype');
		}
		switch ($para['utype']) {
			case 1:
				//我自己
				$map['uid'] = $this->user['uid'];
				break;
			case 2:
				//直属下线
				$map['parentId'] = $this->user['uid'];
				break;
			case 3:
				// 所有下级
//				$map['parents'] = array('like','%,'.$this->user['uid'].',%');
//				break;
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
			default:
				//所有人
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
		}
		if(I('utype')==3 && I('api')){
			$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$map['uid'] = array('NEQ', $this->user['uid']);
			$map['_logic'] = 'and';
		}

		$where['_complex'] = $map;
		$userList = M('members')->field('uid,username')->where($where)->select();
		//dump($userList);
		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();
		// 账变类型限制
		if(I('liqType')){
			$para['liqType'] = I('liqType');
		}
		if ($para['liqType']) {
			$where['liqType'] = $para['liqType'];
			if ($para['liqType'] == 2) {
				$where['liqType'] = array('between', '2,3');
			} elseif ($para['liqType'] == 106) {
				$where['liqType'] = array('between', '106,107');
			}
		}

		// 时间限制
		if((I('fromTime') || I('toTime')) && I('api')){
			$para['fromTime'] = I('fromTime');
			$para['toTime'] = I('toTime')." 23:59:59";
		}
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime'] && empty(I('api'))) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$userStr = substr($userStr, 0, -1);
		$where['uid'] = array('in', $userStr);
		//dump($where);
		$coinList = M('coin_log')->field('uid,actionTime,liqType,extfield0,extfield1,coin,userCoin')->where($where)->order('id desc')->select();

		if(I('api')){
			$total = count($coinList);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$coinList = M('coin_log')->field('uid,actionTime,liqType,extfield0,extfield1,coin,userCoin,info')->where($where)->order('id desc')->limit($offset,$num)->select();
		}
		//dump($coinList);
		unset($where['liqType']);
		$betList = M('bets')->field('id,actionNo,mode,type,playedId,wjorderId')->where($where)->order('id desc')->select();
		$betData = array();
		foreach ($betList as $bet) {
			$betData[$bet['id']] = $bet;
		}

		$data = array();
		$i = 0;
		foreach ($coinList as $coin) {
			$b = $betData[$coin['extfield0']];
			$b = $b ? $b : array();
			$data[$i] = array_merge($coin, $userData[$coin['uid']], $b);
			$i++;
		}
		//dump($data);
		$info = [
			'data' =>$data,
			'total' =>$total,
		];
		if(empty($data)){
			show_api_json(0,'暂无数据',$info);
		}else{
			show_api_json(1,'资金',$info);
		}
		$this->recordList($data);
	}

	/*帐变列表*/
	public final function fenhong()
	{
		$this->fenhongSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/fenhong');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/fenhong-list');
			}
	}

	public final function searchFenhong()
	{
		$this->fenhongSearch();

		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/fenhong-list');
		}
	}

	public final function fenhongSearch()
	{
		$para = I('get.');
		$para['liqType'] = 110;
		$where = array();

		$where['uid'] = $this->user['uid'];
		$userList = M('members')->field('uid,username')->where($where)->select();
		//dump($userList);
		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();
		// 账变类型限制
		if ($para['liqType']) {
			$where['liqType'] = $para['liqType'];
			if ($para['liqType'] == 2) $where['liqType'] = array('between', '2,3');
		}

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$userStr = substr($userStr, 0, -1);
		$where['uid'] = array('in', $userStr);
		//dump($where);
		$coinList = M('coin_log')->field('uid,actionTime,liqType,extfield0,extfield1,coin,userCoin')->where($where)->order('id desc')->select();
		//dump($coinList);
		unset($where['liqType']);
		$betList = M('bets')->field('id,actionNo,mode,type,playedId,wjorderId')->where($where)->order('id desc')->select();
		$betData = array();
		foreach ($betList as $bet) {
			$betData[$bet['id']] = $bet;
		}

		$data = array();
		$i = 0;
		foreach ($coinList as $coin) {
			$b = $betData[$coin['extfield0']];
			$b = $b ? $b : array();
			$data[$i] = array_merge($coin, $userData[$coin['uid']], $b);
			$i++;
		}
		//dump($data);

		$this->recordList($data);
	}


	//团队统计
	public final function team()
	{

		$teamAll = M('members')->where(array('isDelete' => 0, 'parents' => array('like', '%,' . $this->user['uid'] . ',%')))->field('sum(coin) coin, count(uid) count')->find();
		$teamAll2 = M('members')->where(array('isDelete' => 0, 'parentId' => $this->user['uid']))->field('count(uid) count')->find();

		$this->assign('teamAll', $teamAll);
		$this->assign('teamAll2', $teamAll2);
		$this->assign('user', $this->user);
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/team');
		}
	}

	//提现记录
	public final function cashRecord()
	{
		$this->cashSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/cashRecord');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/cash-list');
			}
	}

	public final function searchCashRecord()
	{
		$this->cashSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/cash-list');
		}
	}

	public final function cashSearch()
	{

		$para = I('get.');

		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		} else {
			//用户类型限制
			switch ($para['utype']) {
				case 1:
					//我自己
					$map['uid'] = $this->user['uid'];
					break;
				case 2:
					//直属下线
					$map['parentId'] = $this->user['uid'];
					break;
				case 3:
					// 所有下级
					$map['parents'] = array('like', '%,' . $this->user['uid'] . ',%');
					break;
				default:
					//所有人
					$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
					$map['uid'] = $this->user['uid'];
					$map['_logic'] = 'or';
					break;
			}
			$where['_complex'] = $map;
		}

		//dump($where);
		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}
		$userStr = substr($userStr, 0, -1);
		$where = array();

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$where['uid'] = array('in', $userStr);
		$where['isDelete'] = 0;
		$cashList = M('member_cash')->field('id,uid,actionTime,amount,account,username,state,bankId,info')->where($where)->order('id desc')->select();

		$i = 0;
		foreach ($cashList as $cash) {
			$data[$i] = array_merge($cash, $userData[$cash['uid']]);
			$i++;
		}

		$bankList = M('bank_list')->field('id,name')->where(array('isDelete' => 0))->order('id')->select();
		$bankData = array();
		foreach ($bankList as $bank) {
			$bankData[$bank['id']] = $bank;
		}
		$this->assign('bankData', $bankData);
		$info = [
			'bankData' => $bankData,
			'data' => $data
		];
		show_api_json(1,'提现记录',$info);
		$this->recordList($data);
	}


	//充值记录
	public final function rechargeRecord()
	{
		$this->rechargeSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/rechargeRecord');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/recharge-list');
			}
	}

	public final function searchrechargeRecord()
	{
		$this->rechargeSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/recharge-list');
		}
	}

	public final function rechargeSearch()
	{

		$para = I('get.');

		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		} else {
			//用户类型限制
			switch ($para['utype']) {
				case 1:
					//我自己
					$map['uid'] = $this->user['uid'];
					break;
				case 2:
					//直属下线
					$map['parentId'] = $this->user['uid'];
					break;
				case 3:
					// 所有下级
					$map['parents'] = array('like', '%,' . $this->user['uid'] . ',%');
					break;
				default:
					//所有人
					$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
					$map['uid'] = $this->user['uid'];
					$map['_logic'] = 'or';
					break;
			}
			$where['_complex'] = $map;
		}

		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$where['uid'] = array('in', $userStr);
		$where['isDelete'] = 0;
		$cashList = M('member_recharge')->field('id,uid,username,rechargeId,amount,rechargeAmount,mBankId,state,info,actionTime')->where($where)->order('id desc')->select();

		$i = 0;
		foreach ($cashList as $cash) {
			$data[$i] = array_merge($cash, $userData[$cash['uid']]);
			$i++;
		}

		$bankList = M('bank_list')->field('id,name')->where(array('isDelete' => 0))->order('id')->select();
		$bankData = array();
		foreach ($bankList as $bank) {
			$bankData[$bank['id']] = $bank;
		}
		$this->assign('bankData', $bankData);
		$info = [
			'bankData' => $bankData,
			'data' => $data
		];
		show_api_json(1,'充值记录',$info);
		$this->recordList($data);
	}

	//推广链接
	public final function linkList()
	{
		if ($this->user['type'] == 0) {
			show_api_json(0,'您不是代理','');
			$this->error('您不是代理');
		}
		$list = M('links')->where(array('uid' => $this->user['uid']))->order('fanDian desc')->select();
		$this->assign('data', $list);
		if(I('api')){
			$lists = M('links')->where(array('uid' => $this->user['uid'],'type'=>I('type')))->order('fanDian desc')->select();
			$total = count($lists);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$lists = M('links')->where(array('uid' => $this->user['uid'],'type'=>I('type')))->order('fanDian desc')->limit($offset,$num)->select();
			foreach($lists as $k=>$v){
				$url = 'http://'.$_SERVER['HTTP_HOST'].U('user/register?lid='.$v['lid'].'&uid='.$v['uid']);
				$lists[$k]['url'] = $url;
			}
			$info = [
				'data' =>$lists,
				'total' =>$total,
			];
			if(empty($lists)){
				show_api_json(0,'暂无数据',$info);
			}else{
				show_api_json(1,'链接管理',$info);
			}
		}
		$this->display('Team/link-list');

	}


	public final function addLink()
	{
		if (IS_POST) {
			//$para=$_POST;
			$para['regIP'] = $this->ip(true);
			$para['regTime'] = $this->time;
			$para['uid'] = $this->user['uid'];
			$para['type'] = I('type', '', 'intval');
			// 查检返点设置
			if ($para['fanDian'] = floatval(I('fanDian'))) {
				if ($para['fanDian'] % $this->settings['fanDianDiff']) {
					show_api_json(0,sprintf('返点只能是%.1f%的倍数', $this->settings['fanDianDiff']),'');
					$this->error(sprintf('返点只能是%.1f%的倍数', $this->settings['fanDianDiff']));
				}


			} else {
				$para['fanDian'] = 0;
			}

			if (I('fanDian') >= $this->user['fanDian']){
				show_api_json(0,'下级返点不能大于自己的返点','');
				$this->error('下级返点不能大于自己的返点');
			}

			$para['fanDianBdw'] = floatval(I('fanDianBdw'));

			if (M('links')->where(array('uid' => $this->user['uid'], 'fanDian' => $para['fanDian']))->find()){
				show_api_json(0,'此链接已经存在','');
				$this->error('此链接已经存在');
			}


			if (M('links')->add($para)){
				show_api_json(1,'添加链接成功','http://'.$_SERVER['HTTP_HOST'].U('user/register?lid='.$para['lid'].'&uid='.$para['uid']));
				$this->success('添加链接成功', U('Team/linklist'));
			}
			else{
				show_api_json(0,'添加链接失败','');
				$this->error('添加链接失败');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/add-link');
			}
		}
	}

	/*编辑注册链接*/
	public final function linkUpdate()
	{
		if (IS_POST) {

			// 查检返点设置
			if ($para['fanDian'] = floatval(I('fanDian'))) {
				if ($para['fanDian'] % $this->settings['fanDianDiff']) $this->error(sprintf('返点只能是%.1f%的倍数', $this->settings['fanDianDiff']));

			} else {
				$para['fanDian'] = 0;
			}

			if (I('fanDian') >= $this->user['fanDian'] || I('fanDianBdw') >= $this->user['fanDianBdw'])
				$this->error('下级返点不能大于自己的返点');

			$para['fanDianBdw'] = floatval(I('fanDianBdw'));
			$para['lid'] = intval(I('lid'));

			if (!M('links')->where(array('uid' => $this->user['uid'], 'lid' => I('lid')))->find())
				$this->error('此链接不存在');

			if (M('links')->save($para))
				$this->success('修改链接成功');
			else
				$this->error('修改链接失败');
		} else {
			$linkData = M('links')->where(array('lid' => I('lid'), 'uid' => $this->user['uid']))->find();

			if ($linkData['uid']) {
				$parentData = M('members')->field('fanDian, fanDianBdw')->find($this->user['uid']);
			} else {
				$parentData['fanDian'] = $this->settings['fanDianMax'];
				$parentData['fanDianBdw'] = $this->settings['fanDianBdwMax'];
			}

			$this->assign('linkData', $linkData);
			$this->assign('parentData', $parentData);

			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/update-link');
			}
		}

	}

	public final function deletelink()
	{
		if (IS_POST) {
			if (M('links')->where(array('lid' => I('lid'), 'uid' => $this->user['uid']))->delete())
				$this->success('删除成功', U('Team/linklist'));
			else
				$this->error('删除失败');
		}
	}

	public final function getlink()
	{
		$linkData = M('links')->where(array('lid' => I('lid'), 'uid' => $this->user['uid']))->find();

		if ($linkData['uid']) {
			$parentData = M('members')->field('fanDian, fanDianBdw')->find($this->user['uid']);
		} else {
			$parentData['fanDian'] = $this->settings['fanDianMax'];
			$parentData['fanDianBdw'] = $this->settings['fanDianBdwMax'];
		}

		$this->assign('linkData', $linkData);
		$this->assign('parentData', $parentData);
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('get-link');
		}
	}

	public final function turnMoney()
	{
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/turn-money');
		}
	}

	public final function turnRecharge()
	{
		$me = M('members')->find($this->user['uid']);
		//dump($me);
		//dump('--'.think_ucenter_md5(I('coinpwd'), UC_AUTH_KEY));
		if ($me['coinPassword'] != think_ucenter_md5(I('coinpwd'), UC_AUTH_KEY))
			$this->error('出款密码不正确');

		if (intval(I('amount')) <= 0)
			$this->error('转账金额必须大于0');
		if ($me['coin'] - I('amount') < 0)
			$this->error('您的余额不足');

		$where['username'] = I('username');
		$child = M('members')->where($where)->find();
		if (!$child)
			$this->error('此用户不存在');
		if (strpos($child['parents'], ',' . $me['uid'] . ',') === false)
			$this->error('此用户不是你的下级');

		// 添加本人资金流动日志
		$this->addCoin(array(
			'uid' => $me['uid'],
			'type' => 0,
			'liqType' => 12,
			'info' => '用户[' . $me['username'] . ']转账给其下级[' . I('username') . ']' . I('amount') . '元',
			'extfield0' => I('amount'),
			'coin' => -I('amount'),
			'fcoin' => 0
		));

		// 添加下级资金流动日志
		$this->addCoin(array(
			'uid' => $child['uid'],
			'type' => 0,
			'liqType' => 12,
			'info' => '用户[' . $me['username'] . ']转账给其下级[' . I('username') . ']' . I('amount') . '元',
			'extfield0' => I('amount'),
			'coin' => I('amount'),
			'fcoin' => 0
		));
		$this->success('给下级转账成功');
	}

	//下级充值
	public final function lowerRecharge()
	{
		$this->lowerRechargeSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/lowerRecharge');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/lowerRecharge-list');
			}
	}

	public final function searchlowerRecharge()
	{
		$this->lowerRechargeSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/lowerRecharge-list');
		}
	}

	public final function lowerRechargeSearch()
	{

		$para = I('get.');

		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		} else {
			// 所有下级
			$map['parents'] = array('like', '%,' . $this->user['uid'] . ',%');
			$where['_complex'] = $map;
		}

		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$where['uid'] = array('in', $userStr);
		$where['isDelete'] = 0;
		$cashList = M('member_recharge')->field('id,uid,username,rechargeId,amount,rechargeAmount,mBankId,state,info,actionTime')->where($where)->order('id desc')->select();

		$i = 0;
		foreach ($cashList as $cash) {
			$data[$i] = array_merge($cash, $userData[$cash['uid']]);
			$i++;
		}

		$bankList = M('bank_list')->field('id,name')->where(array('isDelete' => 0))->order('id')->select();
		$bankData = array();
		foreach ($bankList as $bank) {
			$bankData[$bank['id']] = $bank;
		}
		$this->assign('bankData', $bankData);

		$this->recordList($data);
	}

	//下级取款
	public final function withdrawingMoney()
	{
		$this->withdrawingMoneySearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/withdrawingMoney');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/withdrawingMoney-list');
			}
	}

	public final function searchwithdrawingMoney()
	{
		$this->withdrawingMoneySearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/withdrawingMoney-list');
		}
	}

	public final function withdrawingMoneySearch()
	{

		$para = I('get.');

		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		} else {
			//用户类型限制
			// 所有下级
			$map['parents'] = array('like', '%,' . $this->user['uid'] . ',%');
			$where['_complex'] = $map;
		}

		//dump($where);
		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}
		$userStr = substr($userStr, 0, -1);
		$where = array();

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$where['uid'] = array('in', $userStr);
		$where['isDelete'] = 0;
		$cashList = M('member_cash')->field('id,uid,actionTime,amount,account,username,state,bankId,info')->where($where)->order('id desc')->select();

		$i = 0;
		foreach ($cashList as $cash) {
			$data[$i] = array_merge($cash, $userData[$cash['uid']]);
			$i++;
		}

		$bankList = M('bank_list')->field('id,name')->where(array('isDelete' => 0))->order('id')->select();
		$bankData = array();
		foreach ($bankList as $bank) {
			$bankData[$bank['id']] = $bank;
		}
		$this->assign('bankData', $bankData);

		$this->recordList($data);
	}

	//红包管理
	public final function redPacket()
	{
		$this->display('Team/redPacket');
	}

	//追号记录
	public final function zhuihao()
	{
		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);

		$this->searchZhuihao();

		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/zhuihao');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/zhuihao-list');
			}
		}
	}

	public final function searchZhuihao()
	{
		$para = I('param.');

		$this->getTypes();
		$this->getPlayeds();
		$this->assign('types', $this->types);
		$this->assign('playeds', $this->playeds);


		$where = array();
		$page = $para['page'];
		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		}
		//用户类型限制
		switch ($para['utype']) {
			case 1:
				//我自己
				$map['uid'] = $this->user['uid'];
				break;
			case 2:
				//直属下线
				$map['parentId'] = $this->user['uid'];
				break;
			case 3:
//				// 所有下级
//				$map['parents'] = array('like','%,'.$this->user['uid'].',%');
//				break;
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
			default:
				//所有人
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
		}

		$where['_complex'] = $map;
		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}

		$where = array();
		// 彩种限制
		if ($para['type']) {
			$where['type'] = $para['type'];
		}
		// 玩法限制
		if ($para['played']) {
			$where['playedId'] = $para['played'];
		}

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		// 投注状态限制
		$where['zhuiHao'] = 1;

		$where['uid'] = array('in', $userStr);
		$betList = M('bets')->where($where)->order('id desc,actionTime desc')->select();
		$this->recordList($betList);
	}

	public final function searchzhuih()
	{
		$this->search();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/record-list');
		}
	}

	//其他游戏
	public final function otherGame()
	{
		$this->display('Team/otherGame');
	}

	//佣金记录
	public final function brokerage()
	{
		$this->display('Team/brokerage');
	}

	//工资记录
	public final function wage()
	{
		$this->display('Team/wage');
	}

	//分红记录
	public final function profit()
	{
		$this->display('Team/profit');
	}

	//转账记录
	public final function transfer()
	{
		$this->display('Team/transfer');
	}

	//转入游戏记录
	public final function shift()
	{
		$this->display('Team/shift');
	}

	//转出游戏记录
	public final function roll()
	{
		$this->display('Team/roll');
	}
	//团队统计
//	public final function teamStatistics(){
//		$teamAll = M('members')->where(array('isDelete'=>0, 'parents'=>array('like','%,'.$this->user['uid'].',%')))->field('sum(coin) coin, count(uid) count')->find();
//		$teamAll2 = M('members')->where(array('isDelete'=>0, 'parentId'=>$this->user['uid']))->field('count(uid) count')->find();
//
//		$parentWhere['parents'] = array('like',"%,".$this->user['uid'].",%");
//		$parentWhere['uid'] = $this->user['uid'];
//		$parentWhere['_logic'] = 'or';
//
//		$logins = M('member_session')->where(array('accessTime'=>array('gt',time()-15*60),'isOnLine'=>1))->order('id')->select();
//		foreach($logins as $l){
//			$logins2[$l['uid']]=$l;
//		}
//		$userList = M('members')->where($parentWhere)->select();
//		$sum = 0;
//		foreach($userList as $k=>$value){
//			if($logins2[$value['uid']]){
//				$sum++;
//			}
//		}
//
//		$this->assign('teamAll',$teamAll);
//		$this->assign('teamAll2',$teamAll2);
//		$this->assign('sum',$sum);
//		$this->assign('user',$this->user);
//		$this->display('Team/teamStatistics');
//	}
//}
	public final function teamStatistics()
	{

		$this->teamStatisticsSearch();
		if (!I('get.')) {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/teamStatistics');
			}
		} else {
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/teamStatistics-list');
			}
		}
	}

	public final function searchteamStatistics()
	{
		$this->teamStatisticsSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/teamStatistics-list');
		}
	}

	public final function teamStatisticsSearch()
	{
		$teamAll = M('members')->where(array('isDelete'=>0, 'parents'=>array('like','%,'.$this->user['uid'].',%')))->field('sum(coin) coin, count(uid) count')->find();
		$teamAll2 = M('members')->where(array('isDelete'=>0, 'parentId'=>$this->user['uid']))->field('count(uid) count')->find();
		$parentWhere['parents'] = array('like',"%,".$this->user['uid'].",%");
		$parentWhere['uid'] = $this->user['uid'];
		$parentWhere['_logic'] = 'or';

		$logins = M('member_session')->where(array('accessTime'=>array('gt',time()-15*60),'isOnLine'=>1))->order('id')->select();
		foreach($logins as $l){
			$logins2[$l['uid']]=$l;
		}
		$users = M('members')->where($parentWhere)->select();
		$sum = 0;
		foreach($users as $k=>$value){
			if($logins2[$value['uid']]){
				$sum++;
			}
		}
		$this->assign('sum',$sum);
		$this->assign('teamAll',$teamAll);
		$this->assign('teamAll2',$teamAll2);

		$para = I('get.');


		// 时间限制
		if((I('fromTime') || I('toTime')) && I('api')){
			$para['fromTime'] = I('fromTime');
			$para['toTime'] = I('toTime')." 23:59:59";
		}
		if ($para['fromTime'] && $para['toTime']) {
			$map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$map['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$map['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime'] && empty(I('api'))) {
				$map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		$coinList = M('coin_log')->where($map)->field("FROM_UNIXTIME(actionTime, '%Y-%m-%d') as time,uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount,
		0-sum(case when liqType in ('101','102','103','7') then coin else 0 end) as betAmount,
		count(case when liqType in ('101','102','103','7') then coin else null end) as betSum,
		sum(case when liqType=6 then coin else 0 end) as zjAmount,
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount,
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount,
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('time')->order('time desc')->select();

		$data = $coinList;

		$parentWhere = array();
		if ($para['parentId'] = intval($para['parentId'])) {
			// 直属下级
			$where['parentId'] = $para['parentId'];
			$parentWhere['parents'] = array('like', "%," . $para['parentId'] . ",%");
			$parentWhere['uid'] = $para['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['uid']) {
			// 上级
			$user = M('members')->where(array('uid' => $para['uid']))->find();
			$where['uid'] = $user['parentId'];
			$parentWhere['parents'] = array('like', "%," . $user['parentId'] . ",%");
			$parentWhere['uid'] = $user['parentId'];
			$parentWhere['_logic'] = 'or';
		} elseif ($para['username'] && $para['username'] != '用户名') {
			// 用户名限制

			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = $para['username'];
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");

			$user = M('members')->where(array('username' => $para['username']))->find();
			$parentWhere['parents'] = array('like', "%," . $user['uid'] . ",%");
			$parentWhere['uid'] = $user['uid'];
			$parentWhere['_logic'] = 'or';
		} else {
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$where['uid'] = $this->user['uid'];
			$where['_logic'] = 'or';

			$parentWhere['parents'] = array('like', "%," . $this->user['uid'] . ",%");
			$parentWhere['uid'] = $this->user['uid'];
			$parentWhere['_logic'] = 'or';
		}
		$userList = M('members')->field('uid,username,parentId,coin')->where($where)->order('uid')->select();
		$userData = array();
		foreach ($userList as $user) {
			//$userStr = $userStr.$user['uid'].',';
			$userData[$user['uid']] = $user;
		}
		$allList = M('members')->where($parentWhere)->field('uid,coin')->order('uid')->select();
		$i = 0;
		foreach ($coinList as $coin) {
			$user2 = $userData[$coin['uid']];
//			if ($user2) {
//				$data[$coin['uid']] = array_merge($coin, $user2);
//			}

			foreach ($allList as $user) {
				if ($coin['uid'] == $user['uid']) {
					$all['betAmount'] += $coin['betAmount'];
					$all['betSum'] += $coin['betSum'];
					$all['zjAmount'] += $coin['zjAmount'];
					$all['fanDianAmount'] += $coin['fanDianAmount'];
					$all['brokerageAmount'] += $coin['brokerageAmount'];
					$all['cashAmount'] += $coin['cashAmount'];
					$all['rechargeAmount'] += $coin['rechargeAmount'];
					$i = 1;
				}
				$all['coin'] += $user['coin'];
			}
		}
		$all['yingKui'] = $all['zjAmount']-$all['betAmount']+$all['fanDianAmount'];
		//将没有消费的用户补上为0，显示出来，提高用户体验
		if($i == 0 && I('api')){
			$all['betAmount'] = 0;
			$all['betSum'] = 0;
			$all['zjAmount'] = 0;
			$all['fanDianAmount'] = 0;
			$all['brokerageAmount'] = 0;
			$all['cashAmount'] = 0;
			$all['rechargeAmount'] = 0;
		}
		$info = [
			'all' => $all,
			'sum' => $sum,
			'teamAll' => $teamAll['count']+1,
			'teamAllCoin' =>$teamAll['coin'] + $this->user['coin']

		];
		show_api_json(1,'团队统计',$info);
		//团队
		$this->assign('all', $all);

		$this->assign('para', $para);
		$this->assign('user', $this->user);
	}
	public final function team_center(){
		$this->display('Dialog/team-center');
	}
	public final function report_center(){
		$this->display('Dialog/report-center');
	}
	public final function record_set(){
		$this->display('Dialog/record-set');
	}
	public final function record_set2(){
		$this->display('Dialog/record-set2');
	}
	public final function message_set(){
		$this->display('Dialog/personal-center');
	}
	public final function loadi(){
		$this->display('Dialog/load');
	}
	public final function lined(){
		$this->display('Dialog/line');
	}

	//奖金详情
	public final function prizeDetail(){
		$this->display('Team/prizeDetail');
	}
	//登录记录
	public final function checkIn()
	{
		$this->checkInSearch();
		if (!I('get.'))
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/checkIn');
			}
		else
			if (IS_POST) {
				$this->json($this->view->get());
			} else {
				$this->display('Team/checkIn-list');
			}
	}

	public final function searchcheckIn()
	{
		$this->checkInSearch();
		if (IS_POST) {
			$this->json($this->view->get());
		} else {
			$this->display('Team/checkIn-list');
		}
	}

	public final function checkInSearch()
	{

		$para = I('get.');

		$where = array();
		$page = $para['page'];
		// 用户名限制
		if ($para['username'] && $para['username'] != '用户名') {
			// 按用户名查找时
			// 只要符合用户名且是自己所有下级的都可查询
			// 用户名用模糊方式查询
			$where['username'] = array('like', "%" . I('username') . "%");
			$where['parents'] = array('like', "%," . $this->user['uid'] . ",%");
		}
		//用户类型限制
		switch ($para['utype']) {
			case 1:
				//我自己
				$map['uid'] = $this->user['uid'];
				break;
			case 2:
				//所有人
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
			default:
				//所有人
				$map['parents'] = array('like', "%," . $this->user['uid'] . ",%");
				$map['uid'] = $this->user['uid'];
				$map['_logic'] = 'or';
				break;
		}

		$where['_complex'] = $map;

		//dump($where);
		$userList = M('members')->field('uid,username')->where($where)->select();

		$userData = array();
		foreach ($userList as $user) {
			$userStr = $userStr . $user['uid'] . ',';
			$userData[$user['uid']] = $user;
		}
		$userStr = substr($userStr, 0, -1);
		$where = array();

		// 时间限制
		if ($para['fromTime'] && $para['toTime']) {
			$where['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
		} elseif ($para['fromTime']) {
			$where['actionTime'] = array('egt', strtotime($para['fromTime']));
		} elseif ($para['toTime']) {
			$where['actionTime'] = array('elt', strtotime($para['toTime']));
		} else {
			if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
				$where['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
			}
		}

		//结果限制
		if($para['result'] == 1){
			$where['result'] = 1;
		}elseif($para['result'] == 2){
			$where['result'] = 0;
		}

		//网址限制
		if($para['url']){
			$where['login_url'] = array('like', "%" . $para['url'] . "%");
		}
		//ip限制
		if($para['ip']){
			$where['login_ip'] = array('like', "%" . $para['ip'] . "%");
		}

		$where['uid'] = array('in', $userStr);
		$where['isDelete'] = 0;
		$cashList = M('login_log')->where($where)->order('id desc')->select();

		$i = 0;
		foreach ($cashList as $cash) {
			$data[$i] = array_merge($cash, $userData[$cash['uid']]);
			$i++;
		}

		$this->recordList($data);
	}
	//安全中心
	public final function securityCenter(){
		$this->display('Team/securityCenter');
	}
	//手机客户端
	 public final function load(){
	 	$this->display('Team/load');
	 }
	public final function load2(){
		$this->display('Team/load2');
	}
	//线路检测
	public final function lineRoad(){
		$this->display('Team/line-road');
	}
}


