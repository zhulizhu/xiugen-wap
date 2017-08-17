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
class NoticeController extends HomeController{
	//没有任何方法，直接执行HomeController的_empty方法
	//请不要删除该控制器
	/**
	 * 列表页
	 */
	public final function index(){
		
		$list = M('content')->where(array('enable'=>1))->order('id desc')->select();
		if(I('api')){
			$total = count($list);//总条数
			$num = 15;//每页显示条数
			$page = I('page');
			$cpage = empty($page) ? 1 : $page;//当前页
			$pagenum = ceil($total / $num);//总页数
			$offset = ($cpage - 1) * $num;//开始去数据的位置
			$list = M('content')->where(array('enable'=>1))->order('id desc')->limit($offset,$num)->select();
		}
		foreach($list as $l)
			$list2[$l['id']]=$l;
		if(I('id'))
			$info=$list2[I('id')];
		else
			$info=$list[0];
		$this->assign('info',$info);
		$this->assign('data',$list);
        if (IS_POST || I('api')) {
			$info = [
				'data' =>$list,
				'total' =>$total,
			];
			if(empty($list)){
				show_api_json(0,'暂无公告列表',$info);
			}else{
				show_api_json(1,'公告列表',$info);
			}
            $this->json($this->view->get());
        } else {
            $this->display('Notice/index');
        }
	}
	
	/**
	 * 详情页
	 */
	public final function info(){
		$content = M('content')->where(array('enable'=>1, 'id'=>I('id')))->find();
		$this->assign('info',$content);
        if (IS_POST || I('api')) {
			show_api_json(1,'公告详情',$content);
            $this->json($this->view->get());
        } else {
            $this->display('Notice/info');
        }
	}
	/**
	 * 未读公告
	 */
	public function unread(){
		if(IS_POST){
			$list = M('user_content')
				->alias('u')
				->join('gygy_content c ON u.content_id = c.id','LEFT')
				->where(array('c.enable'=>1,'u.uid'=>$this->user['uid'],'u.status'=>0))
				->order('u.id desc')
				->field('u.*,c.addTime,c.title,c.content')
				->select();
			if ($list) {
				$this->success($list);
			}else{
				$this->error('暂无未读公告');
			}
		}
	}
	/**
	 * 已读
	 */
	public function read(){
		if(IS_POST){
			$id = I('id');
			$read = M('user_content')->where(array('id'=>$id))->setField('status',1);
			if ($read) {
				$this->success('公告已读');
			}else{
				$this->error('公告已读失败');
			}
		}
	}

	public final function info2(){
		$content = M('important_notice')->where(array('enable'=>1, 'id'=>I('id')))->find();
		if($content){
			$this->success($content);
		}else{
			$this->error('数据出错，请重新查看');
		}
	}
}
