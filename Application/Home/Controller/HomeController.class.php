<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Home\Controller;
use Think\Controller;

/**
 * 前台公共控制器
 * 为防止多分组Controller名称冲突，公共Controller名称统一使用分组名称
 */
class HomeController extends Controller {

	/* 空操作，用于输出404页面 */
	// public function _empty(){
	// 	echo 404; //TODO:完成404页面
	// }
	// TODO: 为了调试方便，暂时注释

	public $memberSessionName='session-name';
	public $time;
	public $settings;
	public $prename;
	public $user;
	
	public $types;
	public $playeds;
	public $groups;
	
    protected function _initialize(){
        
		$this->time = time();
		$this->prename = C('DB_PREFIX');
		
		$this->time=intval($_SERVER['REQUEST_TIME']);


		if(CONTROLLER_NAME === 'User' && ACTION_NAME === 'repass'){
			return;
		}
		if(empty(I('api'))){
			if(session('user_auth_sign2')!=data_auth_sign($_SERVER['HTTP_USER_AGENT'])){//检测ip信息是否与session中存储的一致，防止session被盗，他人登录

				if(strpos(__ACTION__,'login')===false &&
					strpos(__ACTION__,'register')===false &&
					strpos(__CONTROLLER__,'wufencai')===false &&
					strpos(__ACTION__,'verify')===false){
					//没有登录
					show_api_json(-3,'您还没有登录','');
					$this->log_out();
					//$this->error('您还没有登录',U('User/login'));
					return;
				}
			}
		}

		if(session('user')){
			$u = M('Members')->where(array('uid' => session('user')['uid']))->find();
			$sessionId = session('user')['sessionId'];
			$u['sessionId'] = $sessionId;
			session('user', null);
			session('user', $u);
			$this->user = session('user');
			$sess = M('member_session')->where('uid=' . $this->user['uid'] . ' and id=' . $this->user['sessionId'])->find();
			if($sess['isOnLine'] == 0 && I('api')){
					session('user', null);
					session('user_auth_sign2', null);
					show_api_json(-3,'您的账号在别处登录','');
			}
			if(!IS_POST){
				if(empty(I('api'))){
					if((time()-$sess['accessTime'])>900){
						$this->log_out();
					}
				}
				//更新session
				$data['id']=$this->user['sessionId'];
				$data['accessTime'] = time();
				M('member_session')->save($data);
			}
			if(I('api')){
				$data['id']=$this->user['sessionId'];
				$data['accessTime'] = time();
				M('member_session')->save($data);
			}
		}else{
			if(strpos(__ACTION__,'login')===false &&
				strpos(__ACTION__,'register')===false &&
				strpos(__CONTROLLER__,'wufencai')===false &&
				strpos(__ACTION__,'verify')===false){
				//没有登录
				show_api_json(-3,'您的登录已失效','');
				return;
			}
		}
		
		$this->assign('user',$this->user);
		
		$this->settings = $this->getSystemSettings();;
		S('WEB_NAME',$this->settings['webName'],15*60);
		$this->assign('settings',$this->settings);
		$switchWeb = $this->settings['switchWeb'];
		if($switchWeb && $switchWeb == '1')
		{
			
		}
		else
		{
			$this->error('站点已经关闭，请稍后访问~');
		}
		//dump(C('LOG_RECORD'));
    }

	protected function getTypes(){
		$this->types = M('type')->cache(true,10*60,'xcache')->where(array('isDelete'=>0))->order('sort')->select();
		$data=array();
		if($this->types) foreach($this->types as $var){
			$data[$var['id']]=$var;
		}
		return $this->types = $data;
	}

	final function getTypesByType(){
		$types = M('type')->where(array('isDelete'=>0,'type'=>I('type'),'enable'=>1))->order('sort')->select();
		show_api_json(1,'彩种',$types);
	}
	
	protected function getPlayeds(){
	
		$this->playeds = M('played')->cache(true,10*60,'xcache')->where(array('enable'=>1))->order('sort')->select();
		$data=array();
		if($this->playeds) foreach($this->playeds as $var){
			$data[$var['id']]=$var;
		}
		return $this->playeds = $data;		
	}
	
	protected function getGroups(){
		
		$this->groups = M('played_group')->cache(true,10*60,'xcache')->where(array('enable'=>1))->order('sort,id')->select();
		$data=array();
		if($this->groups) foreach($this->groups as $var){
			$data[$var['id']]=$var;
		}
		return $this->groups = $data;			
	}
	
	/**
	 * 获取系统配置
	 */
	protected function getSystemSettings(){
		$this->settings=array();

		if($data=M('params')->cache(true,10*60,'xcache')->where()->select()){		
			foreach($data as $var){
				$this->settings[$var['name']]=$var['value'];
			}
		}
		
		return $this->settings;
	}
	
	protected function getGameLastNo($type, $time=null){

		if($time===null) $time=$this->time;
		$kjTime=$this->getTypeFtime($type);
		$atime=date('H:i:s', $time+$kjTime);
		
		//$sql="select actionNo, actionTime from {$this->prename}data_time where type=$type and actionTime<='".$atime."' order by actionTime desc limit 1";		
		$return = M('data_time')->where(array('type'=>$type, 'actionTime'=>array('elt',$atime)))->order('actionTime desc')->limit(1)->find();
		
		if(!$return){
			//$sql="select actionNo, actionTime from {$this->prename}data_time where type=$type order by actionNo desc limit 1";
			$return =M('data_time')->where(array('type'=>$type))->order('actionNo desc')->limit(1)->find();
			$time=$time-24*3600;
		}
		
		$types=$this->getTypes();
		foreach($types as $play){
			if($play['id']==$type)
			{
				$fun=$play['onGetNoed'];
			}
		}
		if(method_exists($this, $fun)){
			$this->$fun($return['actionNo'], $return['actionTime'], $time);
		}
		
		return $return;
	}
	
	/**
	 * 读取将要开奖期号
	 *
	 * @params $type		彩种ID
	 * @params $time		时间，如果没有，当默认当前时间
	 * @params $flag		如果为true，则返回最近过去的一期（一般是最近开奖的一期），如果为flase，则是将要开奖的一期
	 */
	protected function getGameNo($type, $time=null){
		if($time===null) $time=$this->time;
		$kjTime=$this->getTypeFtime($type);
		$atime=date('H:i:s', $time+$kjTime);
		
		$return = M('data_time')->where(array('type'=>$type, 'actionTime'=>array('gt',$atime)))->order('actionTime')->limit(1)->find();

		if(!$return){
			$return = M('data_time')->where(array('type'=>$type))->order('actionTime')->limit(1)->find();
			$time=$time+24*3600;
		}
		
		$types=$this->getTypes();
		foreach($types as $play){
			if($play['id']==$type)
			{
				$fun=$play['onGetNoed'];
			}
		}

		if(method_exists($this, $fun)){
			$this->$fun($return['actionNo'], $return['actionTime'], $time);
		}

		return $return;
	}
	
	//获取延迟时间
	protected function getTypeFtime($type){		
		if($type){
			//$Ftime=$this->getValue("select data_ftime from {$this->prename}type where id = ".$type);
			$data = M('type')->where(array('id'=>$type))->field('data_ftime')->find();
			$Ftime = $data['data_ftime'];
		}
		if(!$Ftime) 
			$Ftime=0;
		return intval($Ftime);
	 }
	 //////
	 
	  //获取当期时间
	protected function getGameActionTime($type,$old=0){
		$actionNo=$this->getGameNo($type);
		
		if($type==1 && $actionNo['actionTime']=='00:00'){
			$actionTime=strtotime($actionNo['actionTime'])+24*3600;
		}else{
			$actionTime=strtotime($actionNo['actionTime']);
		}
		if(!$actionTime) $actionTime=$old;
		return $actionTime;
	}/////
	
	//获取当期期数
	protected function getGameActionNo($type){
		$actionNo=$this->getGameNo($type);
		return $actionNo['actionNo'];
	}/////
	
	//重庆时时彩
	private function noHdCQSSC(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		if($actionNo==0||$actionNo==120){
			//echo 999;
			$actionNo=date('Ymd-120', $time - 24*3600);
			$actionTime=date('Y-m-d 00:00', $time);
			
		}else{
			$actionNo=date('Ymd-', $time).substr(1000+$actionNo,1);
		}
	}
	
	//江西时时彩
	private function no0Hd(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo=date('Ymd-', $time).substr(1000+$actionNo,1);
	}
	//天津快乐十分
	private function no0Hd2(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo=date('Ymd-', $time).substr(1001+$actionNo,1);
	}
	private function no0Hd1(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo=date('Ymd-', $time).substr(1003+$actionNo,1);
	}
	
	private function noFF0Hd(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo=date('Ymd-', $time).substr(10000+$actionNo,1);
	}
	
	//五分 二分彩
	private function noWF0Hd(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		if($actionNo==1 && time()>strtotime(' 23:55:00')){
			//echo 999;
			if($time > time()+ 23*3600) $time = $time-24*3600;
			$actionNo=date('Ymd-001', $time + 24*3600);
			$actionTime=date('Y-m-d 00:00', $time + 24*3600);
			
		}elseif($actionNo==2 && time()>strtotime(' 23:55:00')){
			//echo 999;
			$actionNo=date('Ymd-002', strtotime($actionTime) + 24*3600);
			$actionTime=date('Y-m-d H:i:s', strtotime($actionTime) + 24*3600);			
		}
		else{
			$actionNo=date('Ymd-', $time).substr(1000+$actionNo,1);
		}
	}
	
	//新疆时时彩
	private function noxHd(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		if($actionNo>=84){
			$time-=24*3600;
		}
		
		$actionNo=date('Ymd-', $time).substr(1000+$actionNo,1);
	}
	
	//福彩3D、排列三
	private function pai3(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo=date('Yz', $time);
		$actionNo=substr($actionNo,0,4).substr(substr($actionNo,4)+994,1);

		if($actionTime >= date('Y-m-d H:i:s', $time)){

		}else{
			$kjTime=$this->getTypeFtime($this->type);
			if(date('Y-m-d H:i:s', time()+$kjTime)<date('Y-m-d 23:59:59',time()))
				$actionTime=date('Y-m-d 19:30', time()+24*60*60);
			else
			{
				$actionNo = $actionNo+1;
				$actionTime=date('Y-m-d 19:30', time()+24*60*60);
			}
		}
	}

    private function pai5(&$actionNo, &$actionTime, $time=null){
        $this->setTimeNo($actionTime, $time);
        $actionNo=date('Yz', $time);
        $actionNo=substr($actionNo,0,4).substr(substr($actionNo,4)+994,1);

        if($actionTime >= date('Y-m-d H:i:s', $time)){

        }else{
            $kjTime=$this->getTypeFtime($this->type);
            if(date('Y-m-d H:i:s', time()+$kjTime)<date('Y-m-d 23:59:59',time()))
                $actionTime=date('Y-m-d 19:30', time()+24*60*60);
            else
            {
                $actionNo = $actionNo+1;
                $actionTime=date('Y-m-d 19:30', time()+24*60*60);
            }
        }
    }

	//北京PK10
	private function BJpk10(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo = 179*(strtotime(date('Y-m-d', $time))-strtotime('2007-11-11'))/3600/24+$actionNo-3793;
	}

    private function hg1d5(&$actionNo, &$actionTime, $time=null){
        $this->setTimeNo($actionTime, $time);
        $actionNo = date('Ymd', $time).($actionNo+39);
    }

    private function jnd3d5(&$actionNo, &$actionTime, $time=null){
        $this->setTimeNo($actionTime, $time);
        $actionNo = 398*(strtotime(date('Y-m-d', $time))-strtotime('2007-11-11'))/3600/24+$actionNo+757938;
    }

    private function tw5(&$actionNo, &$actionTime, $time=null){
        $this->setTimeNo($actionTime, $time);
        $actionNo = 203*(strtotime(date('Y-m-d', $time))-strtotime('2007-11-11'))/3600/24+$actionNo+105322183;
    }
	//北京5分彩
	private function bj5(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo = 179*(strtotime(date('Y-m-d', $time))-strtotime('2007-11-11'))/3600/24+$actionNo+201636;
	}

	//北京快乐8
	private function Kuai8(&$actionNo, &$actionTime, $time=null){
		$this->setTimeNo($actionTime, $time);
		$actionNo = 179*(strtotime(date('Y-m-d', $time))-strtotime('2004-09-19'))/3600/24+$actionNo-3837;
	}

    //北京28
    private function luck28bj(&$actionNo, &$actionTime, $time=null){
        $this->setTimeNo($actionTime, $time);
        $actionNo = 179*(strtotime(date('Y-m-d', $time))-strtotime('2004-09-19'))/3600/24+$actionNo-3856;
    }

	private function setTimeNo(&$actionTime, &$time=null){
		if(!$time) $time=$this->time;
		$actionTime=date('Y-m-d ', $time).$actionTime;
	}
	/**
	 * 用户资金变动
	 *
	 * 请在一个事务里使用
	 */
	protected function addCoin($log){
		
		if(!isset($log['uid'])) $log['uid']=$this->user['uid'];
		if(!isset($log['info'])) $log['info']='';
		if(!isset($log['coin'])) $log['coin']=0;
		if(!isset($log['type'])) $log['type']=0;
		if(!isset($log['fcoin'])) $log['fcoin']=0;
		if(!isset($log['extfield0'])) $log['extfield0']=0;
		if(!isset($log['extfield1'])) $log['extfield1']='';
		if(!isset($log['extfield2'])) $log['extfield2']='';
		
		$sql=" call setCoin({$log['coin']}, {$log['fcoin']}, {$log['uid']}, {$log['liqType']}, {$log['type']}, '{$log['info']}', {$log['extfield0']}, '{$log['extfield1']}', '{$log['extfield2']}')";
		
		//echo $sql;exit;
		$Model = new \Think\Model();
		if($Model->query($sql)===false)
			return false;
		else
			return true;
		return false;
	}
	
	/**
	 * 获取来访IP地址
	 */
	protected static final function ip($outFormatAsLong=false){
		$ip = get_client_ip(1);
		
		return $ip;
	}
	
	/**
     * 数据集分页
     * @param array $records 传入的数据集
     */
    public function recordList($records , $count=15){
        $request    =   (array)I('request.');
        $total      =   $records? count($records) : 1 ;
        if( isset($request['r']) ){
            $listRows = (int)$request['r'];
        }else{
            $listRows = C('LIST_ROWS') > 0 ? C('LIST_ROWS') : $count;
        }
        $page       =   new \COM\Page($total, $listRows, $request);
		
        $voList     =   array_slice($records, $page->firstRow, $page->listRows);
        $p			=	$page->show();
        $this->assign('data', $voList);
        $this->assign('_page', $p? $p: '');
    }
	
	/**
	 * 查询
	 */
	// protected function getValue($sql){
		// $param = substr($sql,6,strpos($sql,'from')-6);
		// $param = str_replace(' ','',$param);
		// $Model = new \Think\Model();
		// $return=$Model->query($sql);
		// return $return[0][$param];
	// }
	
	/**
	 * 查询结果
	 */
	// protected function getRow($sql){
		// $Model = new \Think\Model();
		// $return=$Model->query($sql);
		// return $return[0];
	// }
	
	/**
	 * 查询结果集
	 */
	// protected function getRows($sql){
		// $Model = new \Think\Model();
		// $return=$Model->query($sql);
		// return $return;
	// }
	/* 退出登录 */
	public function log_out()
	{
		if (session('user')) {
			M('member_session')->where(array('uid' => $_SESSION['user']['uid']))->save(array('isOnLine' => 0));
		}
		session('user', null);
		session('user_auth_sign2', null);
		exit('<script>top.location.href="'.U("user/login").'"</script>');
	}
}
