<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Home\Controller;

use User\Api\UserApi as UserApi;

/**
 * 用户控制器
 * 包括用户中心，用户登录及注册
 */
class UserController extends HomeController
{

    /* 用户中心首页 */
    public function index()
    {
        //$login = A('User/User', 'Api')->login('麦当苗儿ss', 'aoiujz');
        //$login = A('User/User', 'Api')->register('麦当苗儿ss', 'aoiujz', 'xiaoxiaoxiao@qq.com');
        //$login = A('User/User', 'Api')->checkEmail('zuojiazi@vip.qq.com');


        // dump($login);

    }


    public function test()
    {
        // $Model = new \Think\Model();
        // $sql = 'select * from ssc_members where uid=%d';
        // dump($sql);
        // //$return=$Model->query($sql,$_GET['id']);
        // dump($Model->getLastSql());
        // dump($return);exit;
    }

    /**
     * 推广注册
     */
    public final function register()
    {

        if (IS_POST) {
            if (!preg_match("/^[0-9a-zA-Z]{4,30}$/", I('username'))) {
                $this->error('用户名只能由英文和数字组成，长度4-30个字符');
            }
            /* 检测验证码 */
            if (!check_verify(I('verify'))) {
                $this->error('验证码输入错误！');
            }

            $pwd = I('password');
            if (strlen($pwd) < 6) {
                $this->error('密码至少6位');
            }
            $linkData = M('links')->where(array('lid' => I('lid'), 'uid' => I('uid')))->find();

            if (!$linkData) {
                $this->error('此链接不存在');
            }
            if (!$user2 = M('members')->find($linkData['uid'])) {
                $this->error('上级不存在');
            }
            if (M('members')->where(array('username' => I('username')))->find()) {
                $this->error('用户名' . I('username') . '已存在');
            }
            $para = array(
                'username' => I('username'),
                'type' => $linkData['type'],
                'password' => think_ucenter_md5(I('password'), UC_AUTH_KEY),
                'parentId' => $linkData['uid'],
                'parents' => $user2['parents'],
                'parents2' => $user2['parents2'] . '>' . I('username'),
                'fanDian' => $linkData['fanDian'],
                'fanDianBdw' => $linkData['fanDianBdw'],
                'qq' => I('qq'),
                'regIP' => $this->ip(true),
                'regTime' => $this->time,
                'regPath' => I('regPath')
            );

            M()->startTrans();
            if ($lastid = M('members')->add($para)) {
                if (M('members')->save(array('uid' => $lastid, 'parents' => $user2['parents'] . ',' . $lastid))) {
                    M()->commit();//成功则提交

                    $user = M('members')->find($lastid);
                    $ip = $this->ip(true);
                    $session = array(
                        'uid' => $user['uid'],
                        'username' => $user['username'],
                        'session_key' => 0,//session_id(),
                        'loginTime' => $this->time,
                        'accessTime' => $this->time,
                        'loginIP' => $ip,
                    );

                    if (!($lastid = M('member_session')->add($session))) {
                        $this->error('插入登陆记录表失败，登陆失败');
                    };
                    $user['sessionId'] = $lastid;
                    session('user', $user);
                    session('user_auth_sign2', data_auth_sign($_SERVER['HTTP_USER_AGENT']));
                    $this->success('注册成功', U('index/index'));
                }
            }

            M()->rollback();//不成功，则回滚
            $this->error('注册失败');
        } else {
            //如果手机打开，跳到手机站
            $agent = $_SERVER['HTTP_USER_AGENT'];
            if (strpos($agent, "comFront") || strpos($agent, "iPhone") || strpos($agent, "MIDP-2.0") || strpos($agent,
                    "Opera Mini") || strpos($agent, "UCWEB") || strpos($agent, "Android") || strpos($agent,
                    "Windows CE") || strpos($agent, "SymbianOS")
            ) {
                header('location: ' . U('Mobile/User/register?lid=' . I('lid') . '&uid=' . I('uid')));
                return;
            }
            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display('User/register');
            }
        }
    }

    public $test;

    public function login()
    {
        if (I('api')  || IS_POST) {
            /* 检测验证码 */
            if (!check_verify(I('verify'))) {
                show_api_json(0,'验证码输入错误','');
                $this->error('验证码输入错误！');
            }

            $username = I('username');
            $password = I('password');

            if ($username == '') {
                $error = '用户名不能为空';
                show_api_json(0,$error,'');
                $this->error($error);
            }
            if ($password == '') {
                $error = '密码不能为空';
                show_api_json(0,$error,'');
                $this->error($error);
            }

            $Members = M('Members');
            $map = array();
            $map['username'] = $username;
            $map['password'] = think_ucenter_md5($password, UC_AUTH_KEY);
            $user = $Members->where($map)->find();
            if ($user) {
                //$this->ip(true);
                if ($user['isDelete'] == 1) {
                    $error = '用户已被删除';
                    $log = [
                        'uid' => $user['uid'],
                        'username' => $user['username'],
                        'login_time' => $this->time,
                        'login_url' => $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"],
                        'login_ip' => $_SERVER["REMOTE_ADDR"],
                        'result' => 0,
                        'info' => $error,
                    ];
                    $this->login_log($log);
                    show_api_json(0,$error,'');
                    $this->error($error);
                } else {
                    if ($user['enable'] == 0) {
                        $error = '用户已被冻结';
                        $log = [
                            'uid' => $user['uid'],
                            'username' => $user['username'],
                            'login_time' => $this->time,
                            'login_url' => $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"],
                            'login_ip' => $_SERVER["REMOTE_ADDR"],
                            'result' => 0,
                            'info' => $error,
                        ];
                        $this->login_log($log);
                        show_api_json(0,$error,'');
                        $this->error($error);
                    } else {
                        $ip = $_SERVER["REMOTE_ADDR"];
                        $ip = ip2long($ip);
                        $session = array(
                            'uid' => $user['uid'],
                            'username' => $user['username'],
                            'session_key' => 0,//session_id(),
                            'loginTime' => $this->time,
                            'accessTime' => $this->time,
                            'loginIP' => $ip,
                        );

                        //$session=array_merge($session, $this->getBrowser());

                        if (!($lastid = M('member_session')->add($session))) {
                            show_api_json(0,'插入登陆记录表失败，登陆失败','');
                            $this->error('插入登陆记录表失败，登陆失败');
                        };
                        $user['sessionId'] = $lastid;

                        $data['isOnLine'] = '0';
                        M('member_session')->where('uid=' . $user['uid'] . ' and id<' . $user['sessionId'])->save($data);

                        session('username', null);
                        session('safepwd', null);
                        session('user', null);
                        session('user', $user);
                        session('user_auth_sign2',
                            data_auth_sign($_SERVER['HTTP_USER_AGENT']));//session实现ip认证，防止session被盗取时别人可以登录。在adminControll中验证ip是否一致

                        $log = [
                            'uid' => $user['uid'],
                            'username' => $user['username'],
                            'login_time' => $this->time,
                            'login_url' => $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"],
                            'login_ip' => $_SERVER["REMOTE_ADDR"],
                            'result' => 1,
                            'info' => '',
                        ];
                        $this->login_log($log);
                        show_api_json(1,'登录成功','');
                        $this->success($user['safepwd'], U('Index/main'));
                    }
                }

            } else {
                $error = '用户名或密码错误';
                show_api_json(0,$error,'');
                $this->error($error);
            }
        } else {
            //如果手机打开，跳到手机站
//			$agent = $_SERVER['HTTP_USER_AGENT'];
//			if(strpos($agent,"comFront") || strpos($agent,"iPhone") || strpos($agent,"MIDP-2.0") || strpos($agent,"Opera Mini") || strpos($agent,"UCWEB") || strpos($agent,"Android") || strpos($agent,"Windows CE") || strpos($agent,"SymbianOS"))
//			{
//				header('location: '.U('Mobile/index/index'));
//				return;
//			}

            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display();
            }
        }
    }
    /**
     * 登录日志
     */
    public function login_log($log){
        if (!($lastid = M('login_log')->add($log))) {
            show_api_json(0,'插入登陆日志表失败，登陆失败','');
            $this->error('插入登陆日志表失败，登陆失败');
        };
    }

    /* 登录页面 */
    public function logined()
    {
        if (IS_POST) { //登录验证

            $username = session('username');
            $password = I('password');

            if ($username == '' || $password == '') {
                $error = '用户名或密码不能为空';
                $this->error($error);
            }

            $Members = M('Members');
            $map = array();
            $map['username'] = $username;
            $map['password'] = think_ucenter_md5($password, UC_AUTH_KEY);
            $user = $Members->where($map)->find();

            if ($user) {
                if ($user['isDelete'] == 1) {
                    $error = '用户已被删除';
                    $this->error($error);
                } else {
                    if ($user['enable'] == 0) {
                        $error = '用户已被冻结';
                        $this->error($error);
                    } else {
                        $ip = $_SERVER["REMOTE_ADDR"];//$this->ip(true);
                        $ip = ip2long($ip);
                        $session = array(
                            'uid' => $user['uid'],
                            'username' => $user['username'],
                            'session_key' => 0,//session_id(),
                            'loginTime' => $this->time,
                            'accessTime' => $this->time,
                            'loginIP' => $ip,
                        );

                        //$session=array_merge($session, $this->getBrowser());

                        if (!($lastid = M('member_session')->add($session))) {
                            $this->error('插入登陆记录表失败，登陆失败');
                        };
                        $user['sessionId'] = $lastid;

                        $data['isOnLine'] = '0';
                        M('member_session')->where('uid=' . $user['uid'] . ' and id<' . $user['sessionId'])->save($data);

                        session('username', null);
                        session('safepwd', null);
                        session('user', null);
                        session('user', $user);
                        session('user_auth_sign2',
                            data_auth_sign($_SERVER['HTTP_USER_AGENT']));//session实现ip认证，防止session被盗取时别人可以登录。在adminControll中验证ip是否一致

                        $this->success('登录成功！', U('Index/index'));
                    }
                }
            } else {
                $error = '密码错误';
                $this->error($error);
            }

        } else { //显示登录表单

            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display();
            }
        }
    }


    /* 验证码，用于登录和注册 */
    public function verify()
    {
        $verify = new \COM\Verify();
        $verify->imageL = 90;
        $verify->imageH = 43;
        $verify->fontSize = 18;
        $verify->fontttf = '4.ttf';
        $verify->entry(1);
    }

    /* 退出登录 */
    public function logout()
    {
        if (session('user')) {
            M('member_session')->where(array('uid' => $_SESSION['user']['uid']))->save(array('isOnLine' => 0));
        }
        session('user', null);
        session('user_auth_sign2', null);
        show_api_json(1,'退出成功','');
        $this->redirect('User/login');
    }

    /*通知被顶下线*/
    public function notice(){
        $sessionId = session('user')['sessionId'];
        $sess = M('member_session')->where(array('id' => $sessionId))->find();
        if($sess['isOnLine'] == 0){
            $this->success("被顶下线",U('User/login'));
        }
    }

    /* 忘记密码 */
    public function repass(){
        if (IS_POST) {
            $username = I('username');
            $password = I('password');
            $re_password = I('re_password');
            if ($username == '') {
                $error = '用户名不能为空';
                $this->error($error);
            }
            if ($password == '') {
                $error = '新密码不能为空';
                $this->error($error);
            }
            if (strlen($password) < 6) {
                $this->error('密码至少6位');
            }
            if ($re_password == '') {
                $error = '确认密码不能为空';
                $this->error($error);
            }
            if ($password != $re_password) {
                $error = '密码输入不一致';
                $this->error($error);
            }
            /* 检测验证码 */
            if (!check_verify(I('verify'))) {
                $this->error('验证码输入错误！');
            }

            $Members = M('Members');
            $map = array();
            $map['username'] = $username;
            $user = $Members->where($map)->find();
            if ($user) {

                if ($user['isDelete'] == 1) {
                    $error = '用户已被删除';
                    $this->error($error);
                } else {
                    if ($user['enable'] == 0) {
                        $error = '用户已被冻结';
                        $this->error($error);
                    } else {
                        if (M('members')->where('uid=' . $user['uid'])->save(array(
                            'password' => think_ucenter_md5($password, UC_AUTH_KEY)
                        ))
                        ) {
                            $this->success('修改密码成功');
                        }else{
                            $this->error('修改密码失败');
                        }
                    }
                }
            } else {
                $error = '用户名不存在';
                $this->error($error);
            }
        } else {
            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display();
            }
        }
    }


    /* 个人信息 */
    public function info()
    {
        if (I('nickname') && I('safepwd')) {
            $user = M('members')->find($this->user['uid']);
            $this->assign('user', $user);
            if (think_ucenter_md5(I('password'), UC_AUTH_KEY) != $user['password']) {
                show_api_json(0,'登录密码错误','');
            } else {
                if (M('members')->where('uid=' . $this->user['uid'])->save(array(
                    'nickname' => I('nickname'),
                    'safepwd' => I('safepwd')
                ))
                ) {
                    show_api_json(1,'修改成功','');
                    $this->success('修改成功');
                } else {
                    show_api_json(0,'没有改动','');
                    $this->error('没有改动');
                }
            }
        } else {
            $user = M('members')->find($this->user['uid']);
            $this->assign('user', $user);

            $map = array();
            $map['uid'] = $this->user['uid'];
            $mybank = M('member_bank')->where($map)->find();
            $this->assign('mybank', $mybank);

            $map = array();
            $map['uid'] = $this->user['uid'];
            if(I('api')){
                $map['isOnLine'] = 0;
            }else{
                $map['isOnLine'] = 1;
            }
            $login = M('member_session')->where($map)->order('id desc')->find();
            import('ORG.Net.IpLocation');
            $ip = new \IpLocation();
            $addr = $ip->getlocation($login['loginIP']);
            $login['addr'] = $addr['country'];
            $this->assign('login', $login);


            $map = array();
            $map['parents'] = array('like', '%,' . $this->user['uid'] . ',%');
            $childs = M('members')->where($map)->select();
            $regcount = 0;
            $time = strtotime('00:00:00');
            $logins = M('member_session')->where(array(
                'accessTime' => array('gt', time() - 15 * 60),
                'isOnLine' => 1
            ))->order('id')->select();
            foreach ($logins as $l) {
                $logins2[$l['uid']] = $l;
            }

            foreach ($childs as $child) {
                $coins += $child['coin'];
                if ($child['regTime'] > $time) {
                    $regcount++;
                }
                if ($logins2[$child['uid']]) {
                    $linecount++;
                }
            }
            $childinfo['coins'] = $coins + $user['coin'];
            $childinfo['count'] = count($childs) + 1;
            $childinfo['linecount'] = $linecount + 1;
            $childinfo['regcount'] = $regcount;
            $this->assign('childinfo', $childinfo);
            $info = [
                'user' => $user,
                'mybank' =>$mybank,
                'login' => $login,
                'childinfo' => $childinfo
            ];
            show_api_json(1,'个人信息',$info);
            $this->display();
        }

    }

    /* 密码 */
    public function password()
    {

        $pwd = M('members')->where('uid=' . $this->user['uid'])->find();
        $this->assign('coinPassword',$pwd['coinPassword']);
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display();
        }
    }

    /* 设置密码 */
    public function setPasswd()
    {
        if (IS_POST || I('api')) {

            $opwd = I('oldpassword');
            if (!$opwd) {
                show_api_json(0,'原密码不能为空','');
                $this->error('原密码不能为空');
            }
            if (strlen($opwd) < 6) {
                show_api_json(0,'原密码至少6位','');
                $this->error('原密码至少6位');
            }
            if (!$npwd = I('newpassword')) {
                show_api_json(0,'密码不能为空','');
                $this->error('密码不能为空');
            }
            if (strlen($npwd) < 6) {
                show_api_json(0,'密码至少6位','');
                $this->error('密码至少6位');
            }

            $user = M('members')->where('uid=' . $this->user['uid'])->find();
            $pwd = $user['password'];

            $opwd = think_ucenter_md5($opwd, UC_AUTH_KEY);
            if ($opwd != $pwd) {
                show_api_json(0,'原密码不正确','');
                $this->error('原密码不正确');
            }

            if (M('members')->where('uid=' . $this->user['uid'])->save(array(
                'password' => think_ucenter_md5($npwd, UC_AUTH_KEY)
            ))
            ) {
                show_api_json(1,'修改密码成功','');
                $this->success('修改密码成功');
            }
            show_api_json(0,'修改密码失败或新密码与旧密码不一致','');
            $this->error('修改密码失败或新密码与旧密码不一致');
        }
    }

    /* 设置出款密码 */
    public function setCoinPwd()
    {
        if (IS_POST || I('api')) {

            $opwd = I('oldpassword');
            if (!$npwd = I('newpassword')) {
                show_api_json(0,'出款密码不能为空','');
                $this->error('出款密码不能为空');
            }
            if (strlen($npwd) < 6) {
                show_api_json(0,'出款密码至少6位','');
                $this->error('出款密码至少6位');
            }

            $pwd = M('members')->where('uid=' . $this->user['uid'])->find();

            if (!$pwd['coinPassword']) {
                $npwd = think_ucenter_md5($npwd, UC_AUTH_KEY);
                if ($npwd == $pwd['password']) {
                    show_api_json(0,'出款密码与登录密码不能一样','');
                    $this->error('出款密码与登录密码不能一样');
                }
            } else {
                if (think_ucenter_md5($opwd, UC_AUTH_KEY) != $pwd['coinPassword']) {
                    show_api_json(0,'原出款密码不正确','');
                    $this->error('原出款密码不正确');
                }
                $npwd = think_ucenter_md5($npwd, UC_AUTH_KEY);
                if ($npwd == $pwd['password']) {
                    show_api_json(0,'出款密码与登录密码不能一样','');
                    $this->error('出款密码与登录密码不能一样');
                }
            }
            if (M('members')->where('uid=' . $this->user['uid'])->save(array('coinPassword' => $npwd))) {
                $_SESSION['user']['coinPassword'] = think_ucenter_md5($npwd, UC_AUTH_KEY);
                show_api_json(1,'出款密码设置成功','');
                $this->success('出款密码设置成功');
            }
            show_api_json(0,'修改出款密码失败','');
            $this->error('修改出款密码失败');
        }
    }

    /* 银行信息 */
    public function bank()
    {
        $user = M('members')->find($this->user['uid']);
        if (!$user['coinPassword']) {
            show_api_json(0,'请先设置出款密码','');
            $this->error('请先设置出款密码', U('user/password'));
        }
        $map = array();
        $map['uid'] = $this->user['uid'];
        $mybank = M('member_bank')->where($map)->select();
        $this->assign('mybank', $mybank);

        $banks = M('bank_list')->where('isDelete=0')->order('sort')->select();
        foreach ($banks as $var) {
            $banks2[$var['id']] = $var;
        }
        $this->assign('banks', $banks2);

        if (IS_POST || I('api')) {
            if(!empty($mybank)){
                $mybank[0]['bankName'] = $banks2[$mybank[0]['bankId']]['name'];
            }
            $info = [
                'mybank' => $mybank,
                'banks' => $banks
            ];
            show_api_json(1,'银行卡',$info);
        } else {
            $this->display();
        }
    }

    /**
     * 获取余额
    */
    public function get_balance(){
        if (IS_POST) {
            $user = M('members')->find($this->user['uid']);
            if ($user) {
                    $this->success($user['coin']);
            }else{
                $this->error('无余额信息');
            }
        }

    }

    /**
     * 设置银行帐户
     */
    public function setCBAccount()
    {
        if (IS_POST || I('api')) {
            $user = M('members')->where('uid=' . $this->user['uid'])->find();

            if (think_ucenter_md5(I('coinPassword'), UC_AUTH_KEY) != $user['coinPassword']) {
                show_api_json(0,'出款密码不正确','');
                $this->error('出款密码不正确');
            }
            //验证姓名
            if(!preg_match('/^[\x7f-\xff]+$/', I('username'))){
                show_api_json(0,'请输入中文持卡人','');
                $this->error('请输入中文持卡人');
            }
            //验证卡号
            if(!preg_match('/^[0-9]*$/',I('account')) || strlen(I('account')) < 16 || strlen(I('account')) > 19 || !luhm(I('account'))){
                show_api_json(0,'卡号不正确','');
                $this->error('卡号不正确');
            }
            //检查银行账号唯一
            $map = array();
            $map['account'] = I('account');
            $bank = M('member_bank')->where($map)->find();
            if ($bank) {
                show_api_json(0,'该' . I('account') . '银行账号已经使用','');
                $this->error('该' . I('account') . '银行账号已经使用');
            }

            $map = array();
            $map['uid'] = $this->user['uid'];
            $bank = M('member_bank')->where($map)->select();
            if (count($bank) > 0) {
                show_api_json(0,'最多只能绑定1张银行卡','');
                $this->error('最多只能绑定1张银行卡');
            } else {

                if (count($bank) > 0 && I('username') != $bank[0]['username']) {
                    show_api_json(0,'绑定的新银行持卡人必须跟之前绑定的一致','');
                    $this->error('绑定的新银行持卡人必须跟之前绑定的一致');
                }
                $b['uid'] = $this->user['uid'];
                $b['editEnable'] = 0;
                $b['bankId'] = I('bankId');
                $b['account'] = I('account');
                $b['username'] = I('username');
                $b['actionTime'] = time();

                if (M('member_bank')->add($b)) {
                    // 如果是工行，参与工行卡首次绑定活动
                    if (I('bankId')) {
                        //读取系统配置
                        $this->getSystemSettings();
                        if ($coin = floatval($this->settings['huoDongRegister'])) {
                            $liqType = 51;
                            $info = '首次绑定银行卡赠送';
                            $ip = $this->ip(true);
                            $bankAccount = I('account');

                            if (!$ip) {
                                $ip = 0;
                            }

                            // 查找是否已经赠送过
                            //$sql="select id from {$this->prename}coin_log where liqType=$liqType and (`uid`={$this->user['uid']} or extfield0=$ip or extfield1=$bankAccount) limit 1";

                            $where['uid'] = $this->user['uid'];
                            $where['extfield0'] = $ip;
                            $where['extfield1'] = $bankAccount;
                            $where['_logic'] = 'or';
                            $map['_complex'] = $where;
                            $map['liqType'] = $liqType;

                            if (!M('coin_log')->where($map)->find()) {
                                $this->addCoin(array(
                                    'coin' => $coin,
                                    'liqType' => $liqType,
                                    'info' => $info,
                                    'extfield0' => $ip,
                                    'extfield1' => $bankAccount
                                ));
                                show_api_json(0,sprintf('更改银行信息成功，由于你第一次绑定银行卡，系统赠送%.2f元', $coin),'');
                                $this->success(sprintf('更改银行信息成功，由于你第一次绑定银行卡，系统赠送%.2f元', $coin));
                            }
                        }
                    }
                    show_api_json(1,'更改银行信息成功','');
                    $this->success('更改银行信息成功');
                } else {
                    show_api_json(0,'更改银行信息出错','');
                    $this->error('更改银行信息出错');
                }
            }
        }
    }


    /**
     * 取消绑定
     *
    */
    public function unbind()
    {
        if (IS_POST || I('api')) {
            $map['uid'] = $this->user['uid'];
            $bank = M('member_bank')->where($map)->select();
            if (count($bank) > 0) {
                if(M('member_bank')->where($map)->delete()){
                    show_api_json(1,'银行卡解绑成功','');
                    $this->success('银行卡解绑成功');
                }else{
                    show_api_json(0,'银行卡解绑出错','');
                    $this->error('银行卡解绑出错');
                }
            }else{
                show_api_json(0,'请先绑定银行卡','');
                $this->error('请先绑定银行卡');
            }
        }
    }

    /**
     * 获取投注信息
     */
    public function get_bet(){
        if (IS_POST) {
            $map = [
                'uid' => $this->user['uid'],
                'lotteryNo' => ''
            ];
            $bets = M('bets')->where($map)->order('id asc')->select();
            if ($bets) {
                $this->success($bets);
            }
        }
    }
    /**
     * 获取中奖信息
     */
    public function get_win(){
        if (IS_POST) {
            $map = [
                'uid' => $this->user['uid'],
                'id' => I('id')
            ];
            $win = M('bets')->where($map)->find();
            if ($win) {
                if($win['lotteryNo'] != ''){
                    $win['win'] = $win['bonus'] - $win['mode'] * $win['beiShu'] * $win['actionNum'] * ($win['fpEnable']+1);
                }
                $this->success($win);
            }
        }
    }

    /**
     * 获取用户注册错误信息
     * @param  integer $code 错误编码
     * @return string        错误信息
     */
    private function showRegError($code = 0)
    {
        switch ($code) {
            case -1:
                $error = '用户名长度必须在16个字符以内！';
                break;
            case -2:
                $error = '用户名被禁止注册！';
                break;
            case -3:
                $error = '用户名被占用！';
                break;
            case -4:
                $error = '密码长度必须在6-30个字符之间！';
                break;
            case -5:
                $error = '邮箱格式不正确！';
                break;
            case -6:
                $error = '邮箱长度必须在1-32个字符之间！';
                break;
            case -7:
                $error = '邮箱被禁止注册！';
                break;
            case -8:
                $error = '邮箱被占用！';
                break;
            case -9:
                $error = '手机格式不正确！';
                break;
            case -10:
                $error = '手机被禁止注册！';
                break;
            case -11:
                $error = '手机号被占用！';
                break;
            default:
                $error = '未知错误';
        }
        return $error;
    }


    private function getBrowser()
    {
        $flag = $_SERVER['HTTP_USER_AGENT'];
        $para = array();

        // 检查操作系统
        if (preg_match('/Windows[\d\. \w]*/', $flag, $match)) {
            $para['os'] = $match[0];
        }

        if (preg_match('/Chrome\/[\d\.\w]*/', $flag, $match)) {
            // 检查Chrome
            $para['browser'] = $match[0];
        } elseif (preg_match('/Safari\/[\d\.\w]*/', $flag, $match)) {
            // 检查Safari
            $para['browser'] = $match[0];
        } elseif (preg_match('/MSIE [\d\.\w]*/', $flag, $match)) {
            // IE
            $para['browser'] = $match[0];
        } elseif (preg_match('/Opera\/[\d\.\w]*/', $flag, $match)) {
            // opera
            $para['browser'] = $match[0];
        } elseif (preg_match('/Firefox\/[\d\.\w]*/', $flag, $match)) {
            // Firefox
            $para['browser'] = $match[0];
        } else {
            $para['browser'] = 'unkown';
        }
        //print_r($para);exit;
        $para = array();
        return $para;
    }

    /*盈亏报表*/
    public final function report()
    {

        $this->reportSearch();
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display('User/report');
        }
    }

    public final function searchReport()
    {
        $this->reportSearch();
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display('User/report-list');
        }
    }

    public final function reportSearch()
    {

        $para = I('get.');

        $where = array();
        // 用户限制
        $uid = $this->user['uid'];

        $where['uid'] = $uid;

        $userList = M('members')->where($where)->order('uid')->select();

        foreach ($userList as $user) {
            $userStr = $userStr . $user['uid'] . ',';
        }

        $map = array();
        // 时间限制
        if ($para['fromTime'] && $para['toTime']) {
            $map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
        } elseif ($para['fromTime']) {
            $where['actionTime'] = array('egt', strtotime($para['fromTime']));
        } elseif ($para['toTime']) {
            $where['actionTime'] = array('elt', strtotime($para['toTime']));
        } else {
            if ($GLOBALS['fromTime'] && $GLOBALS['toTime']) {
                $map['actionTime'] = array('between', array($GLOBALS['fromTime'], $GLOBALS['toTime']));
            }
        }
        $map['uid'] = array('in', $userStr);

        $coinList = M('coin_log')->where($map)->field("uid,sum(case when liqType in ('2','3') then coin else 0 end) as fanDianAmount, 
		0-sum(case when liqType in ('101','102','7') then coin else 0 end) as betAmount, 
		sum(case when liqType=6 then coin else 0 end) as zjAmount, 
		0-sum(case when liqType=107 then fcoin else 0 end) as cashAmount, 
		sum(case when liqType=1 then coin else 0 end) as rechargeAmount, 
		sum(case when liqType in ('50','51','52','53') then coin else 0 end) as brokerageAmount")->group('uid')->select();

        $i = 0;
        foreach ($userList as $user) {
            foreach ($coinList as $coin) {
                if ($coin['uid'] == $user['uid']) {
                    $data[$i] = array_merge($user, $coin);
                    $i++;
                }
            }
        }

        $this->recordList($data);
    }

    public final function getTip()
    {
        //提现
        if ($data = M('member_cash')->where(array(
            'uid' => $this->user['uid'],
            'state' => array('in', array('0', '4')),
            'isDelete' => 0,
            'qflag' => 0
        ))->order('id desc')->find()
        ) {

            if (intval($data['state']) == 4) {
                $return = array(
                    'flag' => true,
                    'message' => '提款失败！<br/>原因：' . $data['info']
                );
            } else {
                $return = array(
                    'flag' => true,
                    'message' => '提款成功！<br/>金额：' . $data['amount'] . '元'
                );
            }

            M('member_cash')->where(array('id' => $data['id']))->save(array('qflag' => 1));

            $this->ajaxReturn($return, 'JSON');
        }

        //充值
        if ($data = M('member_recharge')->where(array(
            'uid' => $this->user['uid'],
            'state' => array('in', array('1', '9')),
            'isDelete' => 0,
            'qflag' => 0
        ))->order('id desc')->find()
        ) {

            if ($data['rechargeAmount'] > 0) {
                $return = array(
                    'flag' => true,
                    'message' => '充值成功！<br/>系统充值：' . $data['rechargeAmount'] . '元'
                );
            } else {
                $return = array(
                    'flag' => true,
                    'message' => '扣款成功！<br/>系统扣款：' . abs($data['rechargeAmount']) . '元'
                );
            }

            M('member_recharge')->where(array('id' => $data['id']))->save(array('qflag' => 1));

            $this->ajaxReturn($return, 'JSON');
        }

        //盈亏
        if ($datas = M('bets')->where(array(
            'uid' => $this->user['uid'],
            'lotteryNo' => array('neq', ''),
            'isDelete' => 0,
            'flag' => 0
        ))->order('id desc')->select()
        ) {
            foreach ($datas as $data) {
                if ($data['hmEnable']) {
                    $data['tMoney'] = $data['bonus'] - $data['mode'] * $data['beiShu'] * $data['actionNum'] * ($data['hmMyFen'] + $data['hmBaoDi']) / ($data['hmAllFen']);
                } else {
                    $data['tMoney'] = $data['bonus'] - $data['mode'] * $data['beiShu'] * $data['actionNum'] * (1 - $data['fanDian'] / 100);
                }
                if ($data['tMoney'] > 0) {
                    $message = "订单" . $data['wjorderId'] . "：盈亏 <font style='color:#F00;font-weight:bold;font-size:14px;'>" . round($data['tMoney'],
                            4) . "</font> 元" . "<br>" . $message;
                } else {
                    $message = "订单" . $data['wjorderId'] . "：盈亏 <font style='color:#060;font-weight:bold;font-size:14px;'>" . round($data['tMoney'],
                            4) . "</font> 元" . "<br>" . $message;
                }
            }

            M('bets')->where(array('uid' => $this->user['uid']))->save(array('flag' => 1));

            $return = array(
                'flag' => true,
                'message' => $message
            );
            $this->ajaxReturn($return, 'JSON');
        }

        $return = array('flag' => false);
//        $this->success($return,'200');
        $this->json($return);
    }

    public final function getTip_recharge()
    {

        if ($data = M('member_recharge')->where(array(
            'uid' => $this->user['uid'],
            'state' => 0,
            'isDelete' => 0,
            'actionTime' => array('gt', strtotime(' 00:00:00'))
        ))->field('id,flag')->select()
        ) {

            $isDialog = false;
            foreach ($data as $d) {
                if ($d['flag'] == 0) {
                    $isDialog = true;
                }
            }

            M('member_recharge')->where(array('flag' => 0))->save(array('flag' => 1));

            $return = array(
                'flag' => true,
                'isDialog' => $isDialog,
                'message' => '有新的充值请求需要处理',
                'buttons' => '前往处理:goToDealWithRec|忽略:defaultCloseModal'
            );


            $this->ajaxReturn($return, 'JSON');
        }

    }

    /*个人报表*/
    public final function personal_report()
    {
        $this->personal_reportSearch();
        if (!I('get.')) {
            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display('User/personal_report');
            }
        } else {
            if (IS_POST) {
                $this->json($this->view->get());
            } else {
                $this->display('User/personal_report_list');
            }
        }
    }

    public final function personal_searchReport()
    {
        $this->personal_reportSearch();
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display('User/personal_report_list');
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
        if ($para['fromTime'] && $para['toTime']) {
            $map['actionTime'] = array('between', array(strtotime($para['fromTime']), strtotime($para['toTime'])));
        } elseif ($para['fromTime']) {
            $map['actionTime'] = array('egt', strtotime($para['fromTime']));
        } elseif ($para['toTime']) {
            $map['actionTime'] = array('elt', strtotime($para['toTime']));
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
        $this->recordList($data);

        //团队
        $this->assign('all', $all);

        $this->assign('para', $para);
        $this->assign('user', $this->user);
    }

    //首页定制列表
    public final function collections(){
        $collection = M('collections')->where(array('uid'=>$this->user['uid']))->find();
        $colles = explode(",",$collection['type_id']);
        $type = M('type')->where(array('isDelete'=>0,'enable'=>1))->order('sort')->select();
        $types = array();
        $i = 0;
        foreach($type as $var){
            foreach($colles as $k=>$v){
                if($v == $var['id']){
                    $i = 1;
                    break;
                }
            }
            if($i == 1){
                $types[]=$var;
                $i=0;
            }
        }
        if(empty($types)){
            show_api_json(0,'暂无已定制采种列表',$types);
        }else{
            show_api_json(1,'已定制采种列表',$types);
        }
    }

    //定制列表
    public final function collectioning(){
        $collection = M('collections')->where(array('uid'=>$this->user['uid']))->find();
        $colles = explode(",",$collection['type_id']);
        $type = M('type')->where(array('isDelete'=>0,'enable'=>1))->order('sort')->select();
        $types = array();
        $i = 0;
        foreach($type as $var){
            foreach($colles as $k=>$v){
                if($v == $var['id']){
                    $i = 1;
                    break;
                }
            }
            if($i == 0){
                $types[] = $var;
            }
            $i = 0;
        }
        if(empty($types)){
            show_api_json(0,'暂无未定制采种列表',$types);
        }else{
            show_api_json(1,'未定制采种列表',$types);
        }
    }

    //定制彩种
    public final function collect(){
        $id = I('id');
        if($id){
            $collection = M('collections')->where(array('uid'=>$this->user['uid']))->find();
            if($collection){
                if(empty($collection['type_id'])){
                    $data = [
                        'type_id' => $id,
                    ];
                    if(M('collections')->where(array('uid'=>$this->user['uid']))->save($data)){
                        show_api_json(1,'定制成功','');
                    }else{
                        show_api_json(0,'定制失败','');
                    }
                }else{
                    $colles = explode(",",$collection['type_id']);
                    foreach($colles as $k => $v){
                        if($v == $id){
                            show_api_json(0,'该采种已经定制过','');
                        }
                    }
                    $data = [
                        'type_id' => $collection['type_id'].",".$id,
                    ];
                    if(M('collections')->where(array('uid'=>$this->user['uid']))->save($data)){
                        show_api_json(1,'定制成功','');
                    }else{
                        show_api_json(0,'定制失败','');
                    }
                }
            }else{
                $data = [
                    'type_id' => $id,
                    'uid' => $this->user['uid'],
                ];
                if(M('collections')->data($data)->add()){
                    show_api_json(1,'定制成功','');
                }else{
                    show_api_json(0,'定制失败','');
                }
            }
        }else{
            show_api_json(0,'参数不正确','');
        }
    }
    //取消定制彩种
    public final function cancelCollect()
    {
        $id = I('id');
        if ($id) {
            $collection = M('collections')->where(array('uid' => $this->user['uid']))->find();
            if ($collection) {
                $colles = explode(",", $collection['type_id']);
                $i = 0;
                foreach ($colles as $k => $v) {
                    if ($v == $id) {
                        unset($colles[$k]);
                        $i++;
                    }
                }
                if($i==0){
                    show_api_json(0, '你还没有定制该彩种', '');
                }
                $data = [
                    'type_id' => implode(",",$colles),
                ];
                if (M('collections')->where(array('uid' => $this->user['uid']))->save($data)) {
                    show_api_json(1, '取消定制成功', '');
                } else {
                    show_api_json(0, '取消定制失败', '');
                }
            }
        }
        else{
            show_api_json(0,'参数不正确','');
        }
    }

    //判断是否设置出款密码
    public final function is_coinPassword(){
        $user = M('members')->find($this->user['uid']);
        if (!$user['coinPassword']) {
            show_api_json(0,'请先设置出款密码','');
        }else{
            show_api_json(1,'已设置出款密码','');
        }
    }
}
