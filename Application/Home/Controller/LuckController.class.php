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
class LuckController extends HomeController
{
    //没有任何方法，直接执行HomeController的_empty方法
    //请不要删除该控制器

    public function index()
    {
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display();
        }
    }

    public function odds() {
        $groups = M('played')->cache(true, 10 * 60, 'xcache')->where(array(
            'enable' => 1,
            'type' => 10
        ))->order('sort,id')->select();
        $this->assign('groups', $groups);
        if (IS_POST) {
            $this->json($this->view->get());
        } else {
            $this->display();
        }
    }

    public function get_record(){
        $record = M('data')->where(array('type' => 50))->order('time desc')->limit(10)->select();
        if (IS_POST) {
            if($record){
                $this->success($record);
            }else {
                $this->error('暂无开奖数据');
            }
        } else {
            $this->display();
        }
    }

    public function get_groupId(){
        $playedId = I('playedId');
        $groupId = M('played')->where(array('id' => $playedId))->field('groupId')->find();
        if (IS_POST) {
            if($groupId){
                $this->success($groupId);
            }else {
                $this->error('暂无玩法组');
            }
        } else {
            $this->display();
        }
    }
}
