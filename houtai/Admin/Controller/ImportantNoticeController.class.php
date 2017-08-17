<?php
// +----------------------------------------------------------------------
// | OneThink [ WE CAN DO IT JUST THINK IT ]
// +----------------------------------------------------------------------
// | Copyright (c) 2013 http://www.onethink.cn All rights reserved.
// +----------------------------------------------------------------------
// | Author: 麦当苗儿 <zuojiazi@vip.qq.com> <http://www.zjzit.cn>
// +----------------------------------------------------------------------

namespace Admin\Controller;

/**
 * 后台首页控制器
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
class ImportantNoticeController extends AdminController {

    static protected $allow = array( 'verify');

    /**
     * 后台首页
     * @author 麦当苗儿 <zuojiazi@vip.qq.com>
     */
    public function index(){
	/* 查询条件初始化 */
    	$map = array();
	$list = M('important_notice')->where(array())->order('id desc')->select();
	$this->recordList($list);
        $this->meta_title = '重要通知';
        $this->display();
    }
	
	public function add(){
		if(IS_POST){
			$data['title'] = I('title');
			$data['content'] = I('content');
			$data['addTime'] = strtotime(I('fromTime'));
			
			$add = M('important_notice')->add($data);
			if($add)
				$this->success('新增成功',U('importantNotice/index'));
			else
				$this->error('新增失败');
		}
		else{
			$this->meta_title = '新增通知';
			$this->display();
		}
	}
	
	/**
     * 编辑配置
     * @author 麦当苗儿 <zuojiazi@vip.qq.com>
     */
    public function update(){
        if(IS_POST){			
			$data['id'] = I('id','','intval');
            $data['title'] = I('title');
			$data['content'] = I('content');
			$data['enable'] = I('enable','1','intval');
			$data['addTime'] = strtotime(I('fromTime'));
			if(M('important_notice')->save($data))
				$this->success('更新成功',U('importantNotice/index'));
			else
				$this->error('更新失败');
        } else {			
            $content = M('important_notice')->find(I('id','','intval'));
            $this->assign('content', $content);
            $this->meta_title = '编辑通知';
            $this->display('ImportantNotice/add');
        }
    }
	
	public final function delete(){
		if(M('important_notice')->where(array('id'=>I('id','','intval')))->delete())
			$this->success('删除成功',U('importantNotice/index'));
		else
			$this->error('删除失败');
	}
}
