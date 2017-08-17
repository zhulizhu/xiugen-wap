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
class NoticeController extends AdminController {

    static protected $allow = array( 'verify');

    /**
     * 后台首页
     * @author 麦当苗儿 <zuojiazi@vip.qq.com>
     */
    public function index(){
	/* 查询条件初始化 */
    	$map = array();
	$list = M('content')->where(array())->order('id desc')->select();
	$this->recordList($list);
        $this->meta_title = '系统公告';
        $this->display();
    }
	
	public function add(){
		if(IS_POST){
			$data['title'] = I('title');
			$data['content'] = I('content');
			$data['addTime'] = strtotime(I('fromTime'));
			$user = M('members')->where(array())->select();
			
			$add = M('content')->add($data);
			foreach ($user as $key => $value) {
				$data1['content_id'] = $add;
				$data1['uid'] = $value['uid'];
				$data1['add_time'] = time();
				$data1['status'] = 0;
				M('user_content')->add($data1);
			}

			if($add)
				$this->success('新增成功',U('notice/index'));
			else
				$this->error('新增失败');
		}
		else{
			$this->meta_title = '新增公告';
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
			if(M('content')->save($data))
				$this->success('更新成功',U('notice/index'));
			else
				$this->error('更新失败');
        } else {			
            $content = M('content')->find(I('id','','intval'));            
            $this->assign('content', $content);
            $this->meta_title = '编辑公告';
            $this->display('Notice/add');
        }
    }
	
	public final function delete(){
		if(M('content')->where(array('id'=>I('id','','intval')))->delete() && M('user_content')->where(array('content_id'=>I('id','','intval')))->delete())
			$this->success('删除成功',U('notice/index'));
		else
			$this->error('删除失败');
	}
	
	public function advice(){
		/* 查询条件初始化 */
    	$map = array();
		
		$Model = new \Think\Model();
		$list = $Model->table('__ADVICE__ a, __MEMBERS__ m')->where('a.uid = m.uid')->field('a.*, m.username as username')->order('a.id desc')->select();
			
		$this->recordList($list);
        $this->meta_title = '投诉建议';
        $this->display();
    }
	
	public function editadv(){
		if(IS_POST){
			$map['id'] = I('id');
			$map['reply'] = I('reply');
			$map['replyTime'] = time();
			if(M('advice')->save($map)){
				$this->success('回复成功', U('advice'));
			}
			else {
				$this->error('回复失败');
			}
		}else {
			$content=M('advice')->find(array('id'=>I('id')));
			$this->assign('content', $content);
			$this->display();
		}
		
    }

	
	public function deladvice(){
		if(M('advice')->where(array('id'=>I('id')))->delete()){
			$this->success('删除成功', U('advice'));
		}
		else {
			$this->error('删除失败');
		}
    }

}
