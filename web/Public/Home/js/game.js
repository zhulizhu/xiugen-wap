function Q(controller, action, payload, cb) {
    var url = '/index.php?s=home/' + controller + '/' + action;
    $.ajax({
        url: url,
        type: 'post',
        data: payload,
        success: function (data) {
            cb(data);
        },
        error: function (i, data) {
            cb(data);
        }
    });
}

function zhuihao(){

    if(parseFloat($('#lt_cf_nums').text())<1){
        winjinAlert('您还未添加预投注',"alert");
        return false;
    }

    $('#lt_trace_box').css('display', 'block');

    return false;
}

$(function(){

	//{{{ 游戏快速操作部分
	// 选号按钮点击事件
	$('input.code').live('click', function(){
		var $this=$(this);
		
		if($this.is('.checked')){
			$this.removeClass('checked');
		}else{
			$this.addClass('checked');
		}
	});
	// IE,IPHONE下禁止下连接、按钮、单选框和复选框获得焦点
	$('a, :button, :radio, :checkbox').live('focus', function(){
		this.blur();
	});
	
	// 操作快速选号按钮点击事件
	$('.pp').each(function(){
			$('.pp input.action').live('click', function(){
		var $this=$(this),
		call=$this.attr('action'),
		pp=$this.parents('.pp');
		$this.addClass("on").siblings(".action").removeClass("on");
		$this.css('backgroundColor','#deb561').siblings(".action").css('backgroundColor','#1463d8');
		if(call && $.isFunction(call=window[call])){
			call.call(this, pp);
		}else if($this.is('.all')){
			// 全－全部选中
			$('input.code',pp).addClass('checked');
		}else if($this.is('.large')){
			// 大－选中5到9
			$('input.code.max',pp).addClass('checked');
			$('input.code.min',pp).removeClass('checked');
		}else if($this.is('.small')){
			// 小－选中0到4
			$('input.code.min',pp).addClass('checked');
			$('input.code.max',pp).removeClass('checked');
		}else if($this.is('.odd')){
			// 单－选中单数
			$('input.code.d',pp).addClass('checked');
			$('input.code.s',pp).removeClass('checked');
		}else if($this.is('.even')){
			// 双－选中双数
			$('input.code.s',pp).addClass('checked');
			$('input.code.d',pp).removeClass('checked');
		}else if($this.is('.none')){
			// 清－全不选
			$('input.code',pp).removeClass('checked');
		}
	});
	})

	//点击添加 立即投注 快速选择激活按钮状态清空
	$('#lt_sel_insert,#lt_bet_immediate').live('click', function(){
		$('input.action').css('backgroundColor','#1463d8');

	})
	// 点击选号按钮时提示信息
	$('.pp :button').live('click', gameMsgAutoTip);
	$('.pp :checkbox').live('click', gameMsgAutoTip);
	$('#lt_sel_modes').live('change', gameMsgAutoTip);
	$('#lt_sel_times').live('input', gameMsgAutoTip);
	$('#beishu').live('keyup', gameMsgAutoTip);//firefox
	$('#beishu').live('propertychange', gameMsgAutoTip);//ie 
	$('#reducetime').live('click', function(){
		var newVal=parseInt($('#lt_sel_times').val())-1;
		if(newVal<1) newVal=1;
		$('#lt_sel_times').val(newVal);
		gameMsgAutoTip();
	});
	$('#plustime').live('click', function(){
		var newVal=parseInt($('#lt_sel_times').val())+1;
		$('#lt_sel_times').val(newVal);
		gameMsgAutoTip();
	});
	
	//录入式投注录入框键盘事件
	$('#textarea-code').live('keypress', function(event){
		//console.log(event);
		event.keyCode=event.keyCode||event.charCode;
		return !!(
			// 按Ctrl、Alt、Shift时有效
			event.ctrlKey
			|| event.altKey
			|| event.shiftKey
			
			// 回车键有效
			|| event.keyCode==13
			
			// 退格键有效
			|| event.keyCode==8
			// 空格键有效
			|| event.keyCode==32
			// 数字键有效
			|| (event.keyCode>=48
			&& event.keyCode<=57)
		);

	}).live('keyup', gameMsgAutoTip);
	
	
	$('#textarea-code').live('change', function(){
		var str=$(this).val();
		if(/[a-zA-Z]+/.test(str)){
			winjinAlert('投注号码不能含有字母字符',"alert");
			$(this).val('');
		}
	});
	

	//11选5 ??
	$('.dantuo :radio').live('click', function(){
		var $dom=$(this).closest('.dantuo');
		
		if(this.value){
			$dom.next().hide().next().show();
		}else{
			$dom.next().show().next().hide();
		}
	});	
	
	$('.dmtm :input.code').live('click',function(event){
		var $this=$(this),
		$dom=$this.closest('.dmtm');
		if($('.code.checked[value=' + this.value +']', $dom).not(this).length==1){
			$this.removeClass('checked');
			winjinAlert('选择胆码不能与拖码相同',"alert");
			return false;
		}
	});
	
	$('.zhixu115 :input.code').live('click',function(event){
		var $this=$(this);
		if(!$this.is('.checked')) return false;
		
		var $dom=$('.zhixu115');
		$('.code.checked[value=' + this.value +']', $dom).removeClass('checked');
		$this.addClass('checked');
	});
	
	//历史开奖
	$(".jrkj").click(function() {
		$(".lskj").show();
		return false
	});
	$("body").click(function() {
		$(".lskj").hide()
	});
	$(".lskj").click(function() {
		return false
	});
	
	//玩法信息
	$('.showexample').live("mouseover",function(){
		var $id=$(this).attr('id');
		var ps = $(this).position();
		$('#'+$id+'s_div').siblings('.game_eg').hide();
		$('#'+$id+'s_div').css({top:ps.top + 20,left:ps.left + 20}).fadeIn(100);		
	})
	$('.showexample').live("mouseout",function(){
		$('#played-content').find('.game_eg').hide();		
	})
	
	//获取投注内容
	$('a[rel=projectinfo]').live('click', function(){
		var href = $(this).attr('action');
		var v_id = $(this).attr('data-value');
		var me = this;
		
		wait();
		$.ajax({
			type: "GET",
			url: href,
			data: { },
			dataType: "html",
			global: false,
			success: function (data) {
				destroyWait();
				$(data).dialog({
					title:'投注详情',
					minWidth:850,
					height:520,
					modal:true,
					resizable: false,
					buttons: {
						"关闭": function() {$( this ).dialog( "close" );}
				   }
				});
				
				$("#cancelproject").live('click',function () {
					if (true) {
						$.ajax({
							type: "POST",
							url: "/index.php?s=/home/game/deleteCode",
							data: { id: v_id },
							dataType: "json",
							global: false,
							success: function (data) {
								try {
									if (data.status == 0) {
										$('a[role=button]').click();//关闭dialog
										winjinAlert(data.info,'error');
									} else {
										$('a[role=button]').click();//关闭dialog
										var p = $(me).parent().siblings("td");
										$(p[7]).html('--');						
										$(p[6]).html('<label class="gray">已撤单</label>');
										winjinAlert('撤单成功','ok');
									}
								} catch (e) {
									$('a[role=button]').click();//关闭dialog
									winjinAlert('撤单失败，请梢后重试','error');
								}
							},
							error: null,
							cache: false
						})
					}
				});
			},
			error: function (err){
				destroyWait();
			},
			cache: false
		})
	});
	
	$(".chedan_class").live('click',function () {
		var v_id = $(this).attr('data-id');
		var me = this;
		$.ajax({
			type: "POST",
			url: "/index.php?s=/home/game/deleteCode",
			data: { id: v_id },
			dataType: "json",
			global: false,
			success: function (data) {
				try {
					if (data.status == 0) {
						winjinAlert(data.info,'error');
					} else {
						var p = $(me).parent().siblings("td");
						$(me.parentNode).html('--');						
						$(p[7]).html('<label class="gray">已撤单</label>');
						winjinAlert('撤单成功','ok');
					}
				} catch (e) {
					winjinAlert('撤单失败，请梢后重试','error');
				}
			},
			error: null,
			cache: false
		})
		return false;
	});
	
	//一键投注、马上投注、预投注、全部清除
	$('#lt_bet_immediate').unbind('click');
	$('#lt_bet_immediate').bind('click',gamePostCode);
	$('#lt_buy').bind('click',gamePostCode2);
	$('#lt_cf_clear').bind('click',gameActionRemoveCode);
	
	//追号
	$('#lt_trace_if').click(zhuihao);
	$('#lt_trace_if2').click(zhuihao);
	$('#lt_hemai_if').click(hemai);
	$('#lt_hemai_if2').click(hemai);
	$('#lt_trace_qissueno').live('change', function(){
		$('#lt_trace_count_input').val(this.value);
	});
	$('#lt_trace_ok').live('click', function(){
		var no_count = $('#lt_trace_count_input').val();
		var beishu = $('#lt_trace_times_margin').val();
		var money = parseFloat($('#lt_cf_money').text());
		var i=0;
		$('#lt_trace_issues_table tr').each(function(){
			if(i<no_count){
				var $this=$(this);
				var node=$('td:eq(0)', $this)[0];
				var child=node.children[0];
				child.checked=true;
				
				var node=$('td:eq(2)', $this)[0];
				var child=node.children[0];
				child.disabled=false;
				child.value=beishu;
				
				var node=$('td:eq(3)', $this)[0];
				var child=node.children[0];
				//child.innerHTML=money.toFixed(2);
				child.innerHTML=(money*beishu).toFixed(3);
			}else {
				var $this=$(this);
				var node=$('td:eq(0)', $this)[0];
				var child=node.children[0];
				child.checked=false;
				
				var node=$('td:eq(2)', $this)[0];
				var child=node.children[0];
				child.disabled=true;
				child.value=0;
				
				var node=$('td:eq(3)', $this)[0];
				var child=node.children[0];
				child.innerHTML='0.00';
			}
			i++;
		});
	});
	
	$('input[rel=zhuihao]').live('click', function(){
		var beishu = $('#lt_trace_times_margin').val();
		var money = parseFloat($('#lt_cf_money').text());
		
		if(this.checked==true){
			var child = this.parentNode.parentNode.children[2].children[0];
			child.disabled=false;
			child.value=beishu;
			var child = this.parentNode.parentNode.children[3].children[0];
			child.innerHTML=money.toFixed(3);
		}
		else{
			var child = this.parentNode.parentNode.children[2].children[0];
			child.disabled=true;
			child.value=0;
			var child = this.parentNode.parentNode.children[3].children[0];
			child.innerHTML='0.00';
		}
	});
	
	$('input[data=zhuihao]').live('keyup', function(){
		var beishu = $('#lt_trace_times_margin').val();
		var money = $('#lt_cf_money').text();

		var child = this.parentNode.parentNode.children[3].children[0];
		child.innerHTML=(money * this.value).toFixed(3);
		
	});
	$('input[data=zhuihao]').live('propertychange', function(){
		var beishu = $('#lt_trace_times_margin').val();
		var money = $('#lt_cf_money').text();

		var child = this.parentNode.parentNode.children[3].children[0];
		child.innerHTML=(money * this.value).toFixed(3);
		
	});
	
	$('#lt_buy_trace').live('click', gamePostCode3);
	$('#lt_hemai_trace').live('click', gamePostCode4);
	function hemai(){
		
		if(parseFloat($('#lt_cf_nums').text())<1){
			winjinAlert('您还未添加预投注',"alert");
			return false;
		}
		var lt_cf_money = $('#lt_cf_money').html();
		var all_money = lt_cf_money;
		if(lt_cf_money%1 != 0){
			if(lt_cf_money*10%1 != 0){
				lt_cf_money = lt_cf_money*100;
			}
			else{
				lt_cf_money = lt_cf_money*10;
			}
		}
		$('#hm_feng').val(parseInt(lt_cf_money));
		var jin = (all_money/lt_cf_money).toFixed(3);
		$('#hm_pm').html(jin);
		$('#lt_hemai_box').css('display', 'block');
		
		return false;
	}
	show_flash();

});
//pk10动画
function show_flash(){
	$('#show_flash').click(function(){
		$('#flash_main').toggle();
		var text = $('#show_flash').text();
		if(text == '点击显示动画'){
			$('#show_flash').text("点击隐藏动画");
		}else {
			$('#show_flash').text("点击显示动画");
		}
	});
}

/* 合买开始 */
function setHmMore(me){
	if($(me).is(':checked')){
		$('#hmSetMorePanel').css('display', 'block');
	}else{
		$('#hmSetMorePanel').css('display', 'none');
	}
}

function adviseNum(me){
	var hm_feng = $('#hm_feng').val();
	if(parseInt(hm_feng)!=hm_feng){
		$('#hm_feng').focus()
		winjinAlert('总份数必须为正整数',"alert");
		return false;
	}
	var lt_cf_money = $('#lt_cf_money').html();
	var jin = (lt_cf_money/parseInt(hm_feng)).toFixed(0);
	if((lt_cf_money/parseInt(hm_feng))%1!=0){
		winjinAlert('您输入的份数不合理，每份金额不能精确到1元',"alert");
	}
	$('#hm_pm').html(jin);
}

function adviseFen(me){
	var fen = $(me).val();
	if(parseInt(fen)!=fen){
		winjinAlert('认购份数必须为正整数',"alert");
		return false;
	}
	
	if(parseInt($(me).val())<parseInt($('#hm_feng').val())*5/100){
		winjinAlert('最低认购5%',"alert");
		return false;
	}
	
	if(parseInt($(me).val())>parseInt($('#hm_feng').val())){
		winjinAlert('认购份数不能大于总份数',"alert");
		return false;
	}
	
	$('#hm_pm2').html($(me).val()*$('#hm_pm').html());
}
function chgHmBaodi(me){
	document.getElementById("hm_baodi").value=0;
	if($(me).is(':checked')){
		document.getElementById("hm_baodi").disabled =false;
	}else{
		document.getElementById("hm_baodi").disabled =true;
	}
}
function chgHmBuyer(me) {
	if(me.id=='hm_buyer1'){
		$('#hmUserSet').css('display', 'none');
	}else {
		$('#hmUserSet').css('display', 'block');
	}
} 
function chgBaodi(me){
	var fen = $(me).val();
	if(parseInt(fen)!=fen){
		winjinAlert('保底份数必须为正整数',"alert");
		return false;
	}
	if($(me).val()<$('#hm_feng').val()*20/100){
		winjinAlert('最低保底20%',"alert");
		return false;
	}
	
	if($(me).val()>$('#hm_feng').val()-$('#hm_my_feng').val()){
		winjinAlert('保底份数不能大于剩余份数',"alert");
		return false;
	}
	$('#hm_bmoney').html($(me).val()*$('#hm_pm').html());
}
//调用追号、投注接口
function BettingRecord(index) {
    index = index - 1;
    $('.tab-list .tab').hide();
    $('.tab-list .tab:eq('+index+')').show();
    if (index == 0) {
    	getRecord();
	}else if(index == 1){
		getZH();
	}
}

//时时更新投注,追号记录
// var betRecord;
// betRecord = setTimeout(function () {
// 	betting();
// }, 500);
// function betting(){
// 	clearTimeout(betRecord);
// 	BettingRecord(1);
// 	betRecord = setTimeout(function () {
// 		betting();
// 	}, 500);
// }
// var click = 0;
//投注记录
function getRecord() {
    $.ajax('/index.php?s=/home/team/record', {
        data:{
        },
        type:'post',
        dataType:'json',
        error:function(xhr, textStatus, errorThrown){
        },
        success:function(data, textStatus, xhr){
            var html = '';
            data = data.info;
            var types = data.types;
            var list = data.data;
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
				if(obj['lotteryNo']){
					var bonus = sub(obj['bonus'] ,mul(obj['mode'],mul(obj['beiShu'],mul(obj['actionNum'] ,add(obj['fpEnable'],1) ))));
				}else {
					var bonus = 0;
				}
				if(obj['actionData'].length > 9){
					var str = '<span id="det'+i+'" style="width: 90px;">' +obj['actionData'].substr(0,7) + '...<a id="f1"  style="display:none;">详情</a><div id="deta'+i+'" class="deta" style="width: 260px;padding:5px;height:auto;background:#ccc;color:#000;display: none;position: absolute;right: 2px;text-align: left;border-radius: 8px;"><p>投注内容：</p><p style="word-break: break-word;" >'+obj['actionData']+'</p></div></span>';
				}else {
					var str = '<span style="width: 90px;">' + obj['actionData'] + '</span>';
				}
                var item = '<li><span style="width: 59px;">' + types[obj['type']]['shortName'] + '</span>'
                    + '<span style="width: 50px;">' + (obj['actionNo'].split('-')[1] || obj['actionNo'].split('-')[0].substr(4,10)) + '</span>'
                    + str
                    + '<span style="width: 76px;">' + bonus.toFixed(3) + '</span></li>';
                html += item;
            }
            $('#tzjl').html(html);
			for (var i = 0; i < list.length; i++) {
				$('#det'+i).on("click", {index: i}, clicks);
				$('#det'+i).mouseover(function(){
					$(this).find('#f1').show();
				})
				$('#det'+i).mouseout(function(){
					$(this).find('#f1').hide();
				})

			}
			function clicks(event){
				var i= event.data.index;
				$('#deta'+i).toggle();
				// if(click == 0){
				// 	clearTimeout(betRecord);
				// 	click = 1;
				// }else {
				// 	click = 0;
				// 	betRecord = setTimeout(function () {
				// 		betting();
				// 	}, 500);
				// }
			}
        }
    });
}

function add(a, b) {
	var c, d, e;
	try {
		c = a.toString().split(".")[1].length;
	} catch (f) {
		c = 0;
	}
	try {
		d = b.toString().split(".")[1].length;
	} catch (f) {
		d = 0;
	}
	return e = Math.pow(10, Math.max(c, d)), (mul(a, e) + mul(b, e)) / e;
}

function sub(a, b) {
	var c, d, e;
	try {
		c = a.toString().split(".")[1].length;
	} catch (f) {
		c = 0;
	}
	try {
		d = b.toString().split(".")[1].length;
	} catch (f) {
		d = 0;
	}
	return e = Math.pow(10, Math.max(c, d)), (mul(a, e) - mul(b, e)) / e;
}

function mul(a, b) {
	var c = 0,
		d = a.toString(),
		e = b.toString();
	try {
		c += d.split(".")[1].length;
	} catch (f) {}
	try {
		c += e.split(".")[1].length;
	} catch (f) {}
	return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}

function div(a, b) {
	var c, d, e = 0,
		f = 0;
	try {
		e = a.toString().split(".")[1].length;
	} catch (g) {}
	try {
		f = b.toString().split(".")[1].length;
	} catch (g) {}
	return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}
//追号记录
function getZH() {
    $.ajax('/index.php?s=/home/team/searchRecord', {
        data:{state:4
        },
        type:'post',
        dataType:'json',
        error:function(xhr, textStatus, errorThrown){
        },
        success:function(data, textStatus, xhr){
            var html = '';
            data = data.info;
            var types = data.types;
            var list = data.data;
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
				if(obj['lotteryNo']){
					var bonus = sub(obj['bonus'] ,mul(obj['mode'],mul(obj['beiShu'],mul(obj['actionNum'] ,add(obj['fpEnable'],1) ))));
				}else {
					var bonus = 0;
				}
				if(obj['actionData'].length > 9){
					var str = '<span style="width: 90px;">' +obj['actionData'].substr(0,7) + '...<a id="zh'+i+'">详情</a><div id="zhd'+i+'" class="deta" style="width: 260px;height:auto;background:#ccc;color:#000;display: none;position: absolute;right: 4px;text-align: left;border-radius: 8px;"><p>投注内容：</p><p style="word-break: break-word;" >'+obj['actionData']+'</p></div></span>';
				}else {
					var str = '<span style="width: 90px;">' + obj['actionData'] + '</span>';
				}
                var item = '<li><span style="width: 59px;">' + types[obj['type']]['shortName'] + '</span>'
                    + '<span style="width: 50px;">' + (obj['actionNo'].split('-')[1] || obj['actionNo'].split('-')[0].substr(4,10)) + '</span>'
                    + str
                    + '<span style="width: 76px;">' + bonus + '</span></li>';
                html += item;
            }
            $('#zhjl').html(html);
			for (var i = 0; i < list.length; i++) {
				$('#zh'+i).on("click", {index: i}, clicks);
			}
			function clicks(event){
				var i= event.data.index;
				$('#zhd'+i).toggle();
			}
        }
    });
}

/**
 * 添加投注
 */
function gamePostCode(){
	var code=[],	// 存放投注号特有信息
	zhuiHao,		// 存放追号信息
	data={};		// 存放共同信息

	
	if(parseFloat($('#lt_sel_nums').text())<1){
		winjinAlert('请先输入投注号码',"alert");
		return false;
	}
	
	try{
		code[0] = gameActionAddCode(1);
	}catch(err)
	{
		return false;
	}
	
	if(code=='undefined' || code[0]=='undefined') return false;

	var actionNo=$('#current_issue').text();
	if(!actionNo){
		winjinAlert('获取投注期号出错',"alert");
		return false;
	}
	
	data['type']=game.type;
	data['actionNo']=actionNo;

	wait();
	$.ajax('/index.php?s=/home/game/postCode', {
		data:{
			code:code,
			para:data,
			zhuiHao:zhuiHao
		},
		type:'post',
		dataType:'json',
		error:function(xhr, textStatus, errorThrown){
			gamePostedCode(errorThrown||textStatus);
		},
		success:function(data, textStatus, xhr){
		    BettingRecord(1);
            if(data.status==0)//失败
			{
				gamePostedCode(data.info);
			}
			else
			{
				gamePostedCode(null, data.info);
				if(data) winjinAlert(data.info,"ok");
			}
			
		},
		complete:function(xhr, textStatus){
			// 服务器运行异常
			// 尝试获取服务器抛出
			destroyWait();
			var errorMessage=xhr.getResponseHeader('X-Error-Message');
			if(errorMessage) gamePostedCode(decodeURIComponent(errorMessage));
		}
	});
	
	return;
	
	var tipString='<b><span class="ui-wjicon-confirm"></span>确定要购买第'+actionNo+'期彩票？</b>';
	tipString+='<br /><table width="100%"><tr><th>玩法</th><th>号码</th><th>注数</th><th>倍数</th><th>模式</th></tr>';

		tipString+="<tr><td>"+code[0].playedName+"</td><td class='code-list'>"+code[0].actionData+"</td><td>"+code[0].actionNum+"</td><td>"+code[0].beiShu+"</td><td>"+code[0].mode+"</td></tr>";
	
	tipString+='</table>';
	tipString+='<br />'+'共'+code[0].actionNum+'注，总金额：'+code[0].mode * code[0].beiShu * code[0].actionNum+'元';
	
	$('#wanjinDialog').html(tipString).dialog({
		title:'投注提示',
		resizable: false,
		width:500,
		minHeight:100,
		modal: true,
		buttons: {
		"确定购买": function() {
			$( this ).dialog( "close" );
			
			data['type']=game.type;
			data['actionNo']=actionNo;
		
			wait();
			$.ajax('/index.php?s=/home/game/postCode', {
				data:{
					code:code,
					para:data,
					zhuiHao:zhuiHao
				},
				type:'post',
				dataType:'json',
				error:function(xhr, textStatus, errorThrown){
					gamePostedCode(errorThrown||textStatus);
				},
				success:function(data, textStatus, xhr){
                    BettingRecord(1);
					if(data.status==0)//失败
					{
						gamePostedCode(data.info);
					}
					else
					{
						gamePostedCode(null, data.info);
						if(data) winjinAlert(data.info,"ok");
					}
					
				},
				complete:function(xhr, textStatus){
					// 服务器运行异常
					// 尝试获取服务器抛出
					destroyWait();
					var er

					rorMessage=xhr.getResponseHeader('X-Error-Message');
					if(errorMessage) gamePostedCode(decodeURIComponent(errorMessage));
				}
			});
	}, 
	"取消购买": function() {
		$( this ).dialog( "close" );
		return false;
	}
	}
	});//dialog end	
}



/**
 * 添加投注
 */
function gamePostCode2(){

	var code=[],	// 存放投注号特有信息
	zhuiHao,		// 存放追号信息
	data={};		// 存放共同信息

	
	if(parseFloat($('#lt_cf_nums').text())<1){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}
	
	$('#lt_cf_content tr').each(function(){
		code.push($(this).data('code'));
	});

	if(code==""){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}

	// var actionNo=$('#lt_issue_start').val();
    var actionNo=$('#current_issue').text();
	if(!actionNo){
		winjinAlert('获取投注期号出错',"alert");
		return false;
	}
	
	var tipString='<b><span class="ui-wjicon-confirm"></span>确定要购买第'+actionNo+'期彩票？</b>';
	tipString+='<br /><table width="100%"><tr><th>玩法</th><th>号码</th><th>注数</th><th>倍数</th><th>模式</th></tr>';

	$('#lt_cf_content tr').each(function(){
		var $this=$(this);
		tipString+="<tr><td>"+$('td:eq(1)', $this).text()+"</td><td class='code-list'>"+$('td:eq(2)', $this).text()+"</td><td>"+$('td:eq(3) span', $this).text()+"</td><td>"+$('td:eq(4)', $this).text()+"</td><td>"+$('td:eq(5)', $this).text()+"</td></tr>";
	});
	
	tipString+='</table>';
	tipString+='<br />'+'共'+$('#lt_cf_nums').text()+'注，总金额：'+$('#lt_cf_money').text()+'元';
	
	$('#wanjinDialog').html(tipString).dialog({
		title:'投注提示',
		resizable: false,
		width:500,
		minHeight:100,
		modal: true,
		buttons: {
		"确定购买": function() {
			$( this ).dialog( "close" );
			
			data['type']=game.type;
			data['actionNo']=actionNo;
		
			wait();
			$.ajax('/index.php?s=/home/game/postCode', {
				data:{
					code:code,
					para:data,
					zhuiHao:zhuiHao
				},
				type:'post',
				dataType:'json',
				error:function(xhr, textStatus, errorThrown){
					gamePostedCode(errorThrown||textStatus);
				},
				success:function(data, textStatus, xhr){
					BettingRecord(1);
					if(data.status==0)//失败
					{
						gamePostedCode(data.info);
					}
					else
					{
						gamePostedCode(null, data.info);
						gameActionRemoveCode();
						if(data) winjinAlert(data.info,"ok");
					}
					
				},
				complete:function(xhr, textStatus){
					// 服务器运行异常
					// 尝试获取服务器抛出
					destroyWait();
					var errorMessage=xhr.getResponseHeader('X-Error-Message');
					if(errorMessage) gamePostedCode(decodeURIComponent(errorMessage));
				}
			});
	}, 
	"取消购买": function() {
		$( this ).dialog( "close" );
		return false;
	}
	}
	});//dialog end	
}



/**
 * 追号
 */
function gamePostCode3(){
	var code=[],	// 存放投注号特有信息
	zhuiHao=1,		// 存放追号信息
	data={};		// 存放共同信息

	
	if(parseFloat($('#lt_cf_nums').text())<1){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}
	
	$('#lt_cf_content tr').each(function(){
		code.push($(this).data('code'));
	});
	
	if(code==""){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}
	
	var actionNo='';
	var beishu='';
	$('#lt_trace_issues_table tr').each(function(){
		var $this=$(this);
		var node=$('td:eq(0)', $this)[0];
		var child=node.children[0];
		if(child.checked){
			var node=$('td:eq(1)', $this)[0];
			actionNo += node.innerHTML + '|';
			var node=$('td:eq(2)', $this)[0];
			var child=node.children[0];
			beishu += child.value + '|';
		}
	});
	if(!actionNo){
		winjinAlert('请至少勾选一期',"alert");
		return false;
	}
	actionNo = actionNo.substr(0, actionNo.length-1);
	beishu = beishu.substr(0, beishu.length-1);
	if($('#lt_trace_stop').is(':checked'))
		var zhuiHaoMode=1;
	else
		var zhuiHaoMode=0;
	var tipString='<b><span class="ui-wjicon-confirm"></span>确定要追号吗？</b>';
	
	
	$('#wanjinDialog').html(tipString).dialog({
		title:'投注提示',
		resizable: false,
		width:500,
		minHeight:100,
		modal: true,
		buttons: {
		"确定购买": function() {
			$( this ).dialog( "close" );
			
			data['type']=game.type;
			data['actionNo']=actionNo;
			data['beishu']=beishu;
			data['zhuiHaoMode']=zhuiHaoMode;
			
			wait();
			$.ajax('/index.php?s=/home/game/postCode', {
				data:{
					code:code,
					para:data,
					zhuiHao:zhuiHao
				},
				type:'post',
				dataType:'json',
				error:function(xhr, textStatus, errorThrown){
					gamePostedCode(errorThrown||textStatus);
				},
				success:function(data, textStatus, xhr){
					BettingRecord(1);
					if(data.status==0)//失败
					{
						gamePostedCode(data.info);
					}
					else
					{
						gamePostedCode(null, data.info);
						gameActionRemoveCode();
						$('#lt_trace_box').css('display', 'none');
						if(data) winjinAlert(data.info,"ok");
					}
					
				},
				complete:function(xhr, textStatus){
					// 服务器运行异常
					// 尝试获取服务器抛出
					destroyWait();
					var errorMessage=xhr.getResponseHeader('X-Error-Message');
					if(errorMessage) gamePostedCode(decodeURIComponent(errorMessage));
				}
			});
	}, 
	"取消购买": function() {
		$( this ).dialog( "close" );
		return false;
	}
	}
	});//dialog end	
}

/**
 * 添加合买
 */
function gamePostCode4(){
	var code=[],	// 存放投注号特有信息
	zhuiHao,		// 存放追号信息
	data={},
	hemai={};		// 存放共同信息

	
	if(parseFloat($('#lt_cf_nums').text())<1){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}
	
	$('#lt_cf_content tr').each(function(){
		code.push($(this).data('code'));
	});
	
	if(code==""){
		winjinAlert('您还未添加预投注',"alert");
		return false;
	}

    // var actionNo=$('#lt_issue_start').val();
    var actionNo=$('#current_issue').text();
    if(!actionNo){
        winjinAlert('获取投注期号出错',"alert");
        return false;
    }

	var tipString='<b><span class="ui-wjicon-confirm"></span>确定要发起合买吗？</b>';
	
	$('#wanjinDialog').html(tipString).dialog({
		title:'投注提示',
		resizable: false,
		width:500,
		minHeight:100,
		modal: true,
		buttons: {
		"确定购买": function() {
			$( this ).dialog( "close" );
			
			data['type']=game.type;
			data['actionNo']=actionNo;
			hemai['hmEnable']=1;
			hemai['AllFen']=$('#hm_feng').val();
			hemai['MyFen']=$('#hm_my_feng').val();
			hemai['perMoney']=$('#hm_pm').html();
			hemai['title']=$('#hm_title').val();
			hemai['remark']=$('#hm_content').val();
			if($('#isBaodi').is(':checked')){
				hemai['BaoDi']=$('#hm_baodi').val();
			}else {
				hemai['BaoDi']=0;			
			}
			if($('#hm_pub1').is(':checked')){
				hemai['isPublic']=1;
			}else {
				hemai['isPublic']=0;				
			}
			if($('#hm_buyer1').is(':checked')){
				//hemai['isAllBuy']=1;
			}else {
				//hemai['isAllBuy']=0;
				hemai['buyer']=$('#hm_buyer').val();
			}
		
			wait();
			$.ajax('/index.php?s=/home/game/postCode', {
				data:{
					code:code,
					para:data,
					zhuiHao:zhuiHao,
					hemai:hemai
				},
				type:'post',
				dataType:'json',
				error:function(xhr, textStatus, errorThrown){
					gamePostedCode(errorThrown||textStatus);
				},
				success:function(data, textStatus, xhr){
					if(data.status==0)//失败
					{
						gamePostedCode(data.info);
					}
					else
					{
						gamePostedCode(null, data.info);
						gameActionRemoveCode();
						$('#lt_hemai_box').css('display', 'none');
						if(data) winjinAlert("合买成功","ok");
					}
					
				},
				complete:function(xhr, textStatus){
					// 服务器运行异常
					// 尝试获取服务器抛出
					destroyWait();
					var errorMessage=xhr.getResponseHeader('X-Error-Message');
					if(errorMessage) gamePostedCode(decodeURIComponent(errorMessage));
				}
			});
	}, 
	"取消购买": function() {
		$( this ).dialog( "close" );
		return false;
	}
	}
	});//dialog end	
}


/**
 * 投注后置函数
 */
function gamePostedCode(err, data){
	if(err){
		if('您的可用资金不足，是否充值？'==err){
			if(window.confirm(err)) location='/index.php?s=/home/recharge/index';
		}else{
			winjinAlert(err,"alert");
		}
	}else{
		gameFreshOrdered();
		reloadMemberInfo();
		//gameActionRemoveCode();
		//gameCalcAmount();
		//$('#game-tip-dom').text('');
		//reload();
	}
}

/**
 * 更新余额
 */
function reloadMemberInfo(){
	//子frame调用父窗口函数
	if(parent.window.autoupdate)
		parent.window.autoupdate('/index.php?s=/home/index/userinfo');
	// $.ajax({
        // type: "POST",
        // url: '/index.php?s=/home/index/userinfo',
        // dataType: "json",
        // global: false,
        // success: function (data) {
            // $("#j-refresh").removeClass("fa-spin").removeClass("fa-2x");
            // $("#user_sscmoney").html(data.coin);
            // $("#user_nickname").html(data.nickname);
            // if (data.enable == "0")
            // {
                // alert("您帐号被冻结，请联系在线客服");
                // //document.location.href = "/public/logout";
                // return;
            // }
        // },
        // error: null,
        // cache: false
    // });
}	
/**
 * 更新定单列表
 */
function gameFreshOrdered(err, msg){
	if(err){
		winjinAlert(err,"alert");
	}else{
		$('#bet-record').load('/index.php?s=/home/game/getOrdered');
	}
}
/**
 * 更新 排行
 */
function gettop(){
	$('#gundong-notice').load('/index.php?s=/home/game/gettop');
}
/**
 * 加载历史开奖数据
 */
function freshKaiJiangData(type){
	$('#historylot').load('/index.php?s=/home/index/getHistoryData/type/'+type);
}
/**
 * 添加预投注
 */

function gameActionAddCode(type){
	//奖金返点限制[如奖金模式在1920以下才能购买分模式(返点大于最大返点-11)]
	
	var $slider=$('#lt_sel_dyprize');	

	var obj,$game=$('#lt_selector .pp'),
	calcFun=$game.attr('action');
	if(calcFun && (calcFun=window[calcFun]) && (typeof calcFun=='function')){
		try{
			obj=calcFun.call($game);
			// 单笔投注注数限额
			var maxBetCount=$slider.data().betCount;
			if(maxBetCount && obj.actionNum>maxBetCount){
				winjinAlert('单笔投注注数最大不能超过'+maxBetCount+'注',"alert");
				return false;
			}
			
			if(typeof obj!='object'){
				throw('未知出错');
			}else{
				return gameAddCode(obj,type);
			}
		}catch(err){
			winjinAlert(err,"alert");
			throw(err);
		}
	}
}


/**
 * 添加预投注
 * code {actionNo:'12,3,4,567,8', actionNum:6}
 */
var num = 0;
function gameAddCode(code,type){

	num += 1;
	if($.isArray(code)){
		for(var i=0; i<code.length; i++) gameAddCode(code[i],1);
		return;
	}
	
	if(code.actionNum==0) throw('号码不正确');
	var jiangjin = document.getElementById("lt_sel_dyprize").value;
	try{
		code=$.extend({
			
			// 反点
			fanDian: jiangjin.split('-')[1].replace("%",""),
			bonusProp: jiangjin.split('-')[0],
			// 模式
			mode: gameGetMode(),
			
			// 倍数
			beiShu: gameGetBeiShu(),

			// 预定单ID
			orderId: (new Date())-2147483647*623
		}, code);
		
		var weiShu=0, wei='',
		modeName={'2':'元', '0.2':'角', '0.02':'分','0.002':'厘'},
		amount=code.mode * code.beiShu * code.actionNum,
		$wei=$('#wei-shu'),
		weiCount=parseInt($wei.attr('length'));
		delete code.isZ6;
		
		
		if($wei.length){
			if($(':checked', $wei).length<weiCount) throw('请选择'+weiCount+'位数！');
			$(':checked', $wei).each(function(){
				weiShu|=parseInt(this.value);
			});
		}
		code.weiShu=weiShu;
		
		if(weiShu){
			var w={16:'万', 8:'千', 4:'百', 2:'十',1:'个'}
			for(var p in w){
				if(weiShu & p) wei+=w[p];
			}
			wei+=':';
		}
		
		$('#lt_selector input:hidden').each(function(){
			code[$(this).attr('name')]=this.value;
		});

		delete code.undefined;
		playedName=code.playedName||$('#tabbar-div-s3 .act .method-tab-front').text(),
		code.playedName=playedName;
		
		if(type==2){
			$('#lt_cf_content tr[class="nr"]').remove();
			if(code.actionData.length > 9){
				var str = '<span style="width: 100px;">' +code.actionData.substr(0,9) + '...<a id="pre_'+num+'" onclick="pre(this.id)" >详情</a><div id="pr'+num+'" class="deta" style="width: 260px;padding:5px;height:auto;background:#ccc;color:#000;display: none;position: absolute;text-align: left;border-radius: 8px;"><p>投注内容：</p><p style="word-break: break-word;" >'+code.actionData+'</p></div></span>';
			}else {
				var str = '<span style="width: 100px;">' + code.actionData + '</span>';
			}
			$('<tr>').data('code', code)
			.append('<td class="tl_li_l" width="4"></td>')
			.append(
				// 玩法
				$('<td>').append(playedName)
			)
			.append(
				// 号码列表
				$('<td class="code-list">').append(wei+str)
			)
			.append(
				// 注数
				$('<td>').append('[<span>'+code.actionNum+'</span>注]')
			)
			.append(
				// 倍数
				$('<td>').append(code.beiShu+'倍')
			)
			.append(
				// 单价
				$('<td>').append(modeName[code.mode])
			)
			.append(
				// 总金额
				$('<td>').append("<span>"+amount.toFixed(3)+"</span>元")
			)
			.append(
				// 操作
				$('<td title="删除" class="c tl_li_r" width="16" onclick="deleteCode(this)"><input name="lt_project[]" type="hidden"></td>')
			)
			.appendTo('#lt_cf_content');

			var tab = document.getElementById("lt_cf_content") ;
			$('#lt_cf_count').html(tab.rows.length);
			//计算总金额
			gameCalcAmount();
		}
		
		$('#textarea-code').val("");
		
		$('#lt_selector :button.checked').removeClass('checked');
		$('#lt_sel_nums').text('0');
		$('#lt_sel_money').text('0.000');
		code['flag'] = 1;
		return code;
	}catch(err){
		winjinAlert(err,"alert");
		throw(err);
	}
}

function pre(num){
	var arr = num.split('_');
	$('#pr'+arr[1]).toggle();
}

/**
 * 计算总注数与总金额，并显示
 * fpcount 是否飞盘 费用翻倍
 */
function gameCalcAmount(){
	var count=0, fpcount=1, amount=0.0, $zhuiHao=$(':checkbox[name=zhuiHao]'), $feipan=$(':checkbox[name=fpEnable]');
	if($feipan.prop('checked')) fpcount=2;
	if($zhuiHao.prop('checked')){
		var data=$('.touzhu-cont tr').data('code');
		$zhuiHao.data('zhuiHao').split(';').forEach(function(v){
			count+=parseInt(v.split('|')[1]);
		});
		amount=data.mode*data.actionNum*count*fpcount;
	}else{
		$('#lt_cf_content tr').each(function(){
			var $this=$(this);
			count += Number($('td:eq(3) span', $this).text());
			amount += Number($('td:eq(6) span', $this).text());
		});
	}

	$('#lt_cf_nums').text(count);
	$('#lt_cf_money').text(amount.toFixed(3));

}

/**
 * 清除号码
 *
 * @params bool isSelected	是否只清除选中的项，默认false
 */
function gameActionRemoveCode(isSelected){
	$('#lt_cf_content tr').remove();
	var tab = document.getElementById("lt_cf_content") ;
	$('#lt_cf_count').html(tab.rows.length);
	gameCalcAmount();
	$('<tr class="nr"><td class="tl_li_l" width="4"></td><td colspan="6" class="noinfo">暂无投注项</td><td class="tl_li_rn" width="4"></td></tr>').appendTo('#lt_cf_content');
}

//清除单项号码
function deleteCode(self){
	$(self).parent().remove();
	var tab = document.getElementById("lt_cf_content") ;
	$('#lt_cf_count').html(tab.rows.length);
	gameCalcAmount();
	if(parseInt(tab.rows.length)<1){
		$('<tr class="nr"><td class="tl_li_l" width="4"></td><td colspan="6" class="noinfo">暂无投注项</td><td class="tl_li_rn" width="4"></td></tr>').appendTo('#lt_cf_content');
	}
}
function wai(){
var html = '<div class="mode" style="display:block;width:910px;height:637px;position: absolute;top: 0;left: 0;z-index: 99999;margin-top:-313px;margin-left:-410px;"><img  style="position:absolute;top:50%;left:50%;margin-left:-50px;margin-top:-50px;"   src="' + 'Public/Mobile/images/game/wait.gif" /></div>';

	$(html).modal({
		modal:true,
		escClose:false,
		overlayCss:{
			background:'#fff',


		},
		dataCss:{
			padding:'0px',
			margin:'0px',
		}
	});
}
function wait(){
	var html = '<img src="' + 'Public/Mobile/images/game/wait.gif" />';
	$(html).modal({
		modal:true,
		escClose:false,
		overlayCss:{
			background:'#000'
		},
		dataCss:{
			padding:'0px',
			margin:'0px'
		}
	});
}

function destroyWait(){
	$.modal.close();
}

function gameMsgAutoTip(){
	var obj,$game=$('#lt_selector .pp'),
	calcFun=$game.attr('action');
	
	if(calcFun && (calcFun=window[calcFun]) && (typeof calcFun=='function')){
		try{
			obj=calcFun.call($game);
			if($.isArray(obj)){
				o={actionNum:0};
				obj.forEach(function(v,i){
					o.actionNum+=v.actionNum;
				});
				obj=o;
			}
			
			$('#lt_sel_nums').text(obj.actionNum);
			$('#lt_sel_money').text((gameGetMode()*gameGetBeiShu()*obj.actionNum).toFixed(3));
			
		}catch(err){
			$('#lt_sel_nums').text('0');
			$('#lt_sel_money').text('0.000');
			//$('#count-amount').html(err);
		}
	}
}

//万金提示  
function winjinAlert(tips,style,minH){
	
	$( "#wanjinDialog" ).html('<span class="ui-wjicon-'+style+'"></span><b>'+tips+'</b>').dialog({
		title:'温馨提示',
		modal: true,
		resizable: false,
		minWidth:250,
		minHeight:(minH?minH:180),
		buttons: {
		"确定": function() {$( this ).dialog( "close" );}
	   }
	});	//dialog end	
}

// 读取模式
function gameGetMode(){
	var mode = $('#lt_sel_modes').val();
	console.log(mode);
	return parseFloat(mode||1);
}
// 读取倍数
function gameGetBeiShu(){
	var txt=$('#lt_sel_times').val();
	if(!txt) return 1;
	var re=/^[1-9][0-9]*$/;
	if(!re.test(txt)){
		throw('倍数只能为大于1正整数');
		$('#lt_sel_times').val(1);
	}
	
	if(isNaN(txt=parseInt(txt))) throw('倍数设置不正确');
	return txt;
}

/**
 * 读取陪率
 */
function gameGetPl(){
	var a = document.getElementById('lt_sel_dyprize');
	return parseFloat(a.value);
}
/**
 * 设置赔率
 */
var FANDIAN=0;
function gameSetPl(value, flag, fanDianBdw){
	
	var $dom=$('#lt_sel_dyprize');
	
	if(fanDianBdw){		
		var maxfd=parseFloat($dom.attr('maxfd'));
		var myfandian=parseFloat($dom.attr('fan-dian'));
		var prop = parseFloat(value.bonusProp);
		var base = parseFloat(value.bonusPropBase);
		var fandian = ((prop-base)/maxfd*myfandian + base).toFixed(2);
		var fan1 = fandian + "-" + "0.0%";
		var fan2 = base.toFixed(2) + "-" + myfandian.toFixed(1) + "%";

		$dom.html("<option value="+fan1+">"+fan1+"</option>");
	}else{
		var maxfd=parseFloat($dom.attr('maxfd'));
		var myfandian=parseFloat($dom.attr('fan-dian'));
		var prop = parseFloat(value.bonusProp);
		var base = parseFloat(value.bonusPropBase);
		var fandian = ((prop-base)/maxfd*myfandian + base).toFixed(2);
		var fan1 = fandian + "-" + "0.0%";
		var fan2 = base.toFixed(2) + "-" + myfandian.toFixed(1) + "%";
		//$dom.text(fandian.toFixed(2));
		if(parseFloat(myfandian)!=0)
			$dom.html("<option value="+fan1+">"+fan1+"</option>"+"<option value="+fan2+">"+fan2+"</option>");
		else
			$dom.html("<option value="+fan2+">"+fan2+"</option>");
	}
}

//{{{ 开奖相关函数
var T;
var kjTimer;
function gameKanJiangDataC(diffTime, actionNo){
	
	diffTime = window.diffTime--;
	var $dom=$('#count_down');
	
	
	if(diffTime<0){
		
		var typename= $('#typename').text();
		var no= $('#current_issue').html();
		var tipString='<span class="ui-wjicon-confirm"></span>'+ typename + '第' + no +'期已经截止投注。';
		var wjDialog=$('#wanjinDialog').html(tipString).dialog({
			title:'温馨提示',
			resizable: false,
			width:250,
			minHeight:100,
			modal: true,
			buttons: {
			"确定": function() {
				$( this ).dialog( "close" );
			},
			"取消": function() {
				$( this ).dialog( "close" );				
			}
			
			}
		});
		if(ready) clearTimeout(ready);//PK10动画准备阶段
		setTimeout(function(){  //PK10动画奔跑阶段
	    running();
       },100);
		setTimeout(function(){  //PK10动画奔跑阶段
			bg_running();
		},100);

		setTimeout(function(){$('.ui-dialog').remove(); $('.ui-widget-overlay').remove();},5000);
		
		if(T) clearTimeout(T);
		
		setKjing();

		getQiHao();

		kjTimer = setTimeout(loadKjData, 10000);

		
	}else{
	
	var m=Math.floor(diffTime % 60),
	s=(diffTime---m)/60,
	h=0;
	
	if(s<10){
		s="0"+s;
	}
	
	if(m<10){
		m="0"+m;
	}

	if(s>60){
		h=Math.floor(s/60);
		s=s-h*60;
		$dom.html((h<10?"0"+h:h)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+(s<10?"0"+s:s)+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+m);
	}else{
		h=0;
		$dom.html("00"+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+s+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+m);
	}
	
	if(T) clearTimeout(T);
	T=setTimeout(function(){gameKanJiangDataC();}, 1000);	
  }
}

function loadKjData(){
	var type=game.type;
	$.ajax('/index.php?s=/home/index/getLastKjData/type/'+type,{
		dataType:'json',
		cache:false,
		error:function(){
			if(kjTimer) clearTimeout(kjTimer);
			kjTimer = setTimeout(loadKjData, 10000);
		},
		success:function(data, textStatus, xhr){
			data = data.info;
			if(!data){
				if(kjTimer) clearTimeout(kjTimer);
				kjTimer = setTimeout(loadKjData, 10000);
				setKjing();				
			}else{
				try{
					//停止开奖转动
					if(data !='暂无开奖数据'){
						if(moveno) {
							clearInterval(moveno);
						}
					}

					
					var $dom=$('#kaijiang'),$kjHaoS,$feipan,hao;
					
					if(parseInt(type)==24){ //快8
						$kjHaoS=data.data.split('|');
						hao=$kjHaoS[0].split(',');
						$feipan=$kjHaoS[1];
					}else{
						hao=data.data.split(',');
					}

					$('#last_issue').html(data.actionNo);
					var ctype=$('#showcodebox').attr('ctype');
					var times=3000;
					if(ctype=='g1'){
						$('.kjhao li').each(function(i){
							$(this).html(hao[i]);
						});
						if($dom.find('.feipan')) $dom.find('.feipan').html("快乐飞盘：<em>"+$feipan+"</em>");
					}else if(ctype=='k8'){ //k8
						$('#showcodebox div').each(function(i){
							$(this).text(hao[i]);
						});
					}else if(ctype=='pk10'){ //pk10
						endRun();
						var j = 100;
						$('#showcodebox div').each(function(i){
							$(this).attr('class','gr_s gr_s' + hao[i]);
							if(i<3){
								$("#car_"+parseInt(hao[i])).children('.gush_fire').addClass('show_fire_1');
								setTimeout(function(){
									$("#car_"+parseInt(hao[i])).animate({marginRight:'864px'},2000);
								},j);
							}else {
								setTimeout(function(){
									$("#car_"+parseInt(hao[i])).animate({marginRight:'864px'},3000);
								},j);
							}
							j += 100;
						});
						setTimeout(function(){
							$('.road_ready').css('display','block');
							$('.road_begin').css('background','block');
							$('.road_begin').css("background",'url(/Public/Home/images/car/road_begin.png) no-repeat right top');
							$('.cls_car').css('margin-right',0);
							$('.gush_fire').removeClass('show_fire_1');
							read();
						},5000);
					}else{
						$('#showcodebox div').each(function(i){
							$(this).attr('class','gr_s gr_s' + hao[i]);
						});
					}
					
					//更新
					gameFreshOrdered();
					reloadMemberInfo();
					freshKaiJiangData(game.type);
					// gettop();
					
					if((typeof $('#wanjinDialog').dialog("isOpen")=='object') || $('#wanjinDialog').dialog('isOpen')){
						$('#wanjinDialog').dialog('close');
					}										
				}catch(err){
					if(kjTimer) clearTimeout(kjTimer);
					kjTimer = setTimeout(loadKjData, 10000);
				}
			}
		}
	});	
}

function getQiHao(){
	$.getJSON('/index.php?s=/home/index/getQiHao/type/'+game.type, function(data){
		if(data && data.lastNo && data.thisNo){
			$('#current_issue').html(data.thisNo.actionNo);
			$('#last_issue').html(data.lastNo.actionNo);			
			futureNo(data.thisNo.actionNo,game.type);
			
			S=true;
			if(T) clearTimeout(T);
			kjTime=parseInt(data.kjdTime);
			//gameKanJiangDataC(data.diffTime-kjTime, data.thisNo.actionNo);
			window.diffTime = data.diffTime-kjTime;
			T=setTimeout(function(){gameKanJiangDataC();}, 1000);
		}
	});
}

//等待开奖旋转
var  moveno;
function setKjing(){
	var ctype=$('#showcodebox').attr('ctype');
	var cnum=$('#showcodebox').attr('cnum'),num;
		cnum=parseInt(cnum);
	
	//停止开奖转动
	if(moveno) clearInterval(moveno);
					
	if(ctype=='g1'){
		moveno = window.setInterval(function () {
			$.each($("showcodebox").find("div"), function (i, n) {
				if ($(this).attr("flag") == "move") {
					num=Math.floor((cnum-1) * Math.random() + 1);
					if(num<10) num='0'+num;
					$(this).html(num);
				}
			})
		}, 200);
	}else if(ctype=='g2'){  //快3
		moveno = window.setInterval(function () {
			$.each($("showcodebox").find("div"), function (i, n) {
				if ($(this).attr("flag") == "move") {
					$(this).attr("class", "gr_ks gr_ksm" + Math.floor(6 * Math.random() + 1));
				}
			})
		}, 200);
	}else if(ctype=='k8'){ //快乐8
		moveno = window.setInterval(function () {
		$.each($("#showcodebox").find("div"), function (i, n) {
				$(this).text(Math.floor(9 * Math.random()));
			})
		}, 200);
	}else if(ctype=='pk10'){
		moveno = window.setInterval(function () {
		$.each($("#showcodebox").find("div"), function (i, n) {
				$(this).attr("class", "gr_s gr_s0" + Math.floor(9 * Math.random()));
			})
		}, 200);
	}
	else if(ctype=='6h'){
		moveno = window.setInterval(function () {
		$.each($("#showcodebox").find("div"), function (i, n) {
			if(i==6){
             $(this).attr("class", "gr_sb gr_sb" + Math.floor(9 * Math.random()));
			}else{
				$(this).attr("class", "gr_s gr_s" + Math.floor(9 * Math.random()));
			}				
			})
		}, 200);
	}
	else{
		moveno = window.setInterval(function () {
		$.each($("#showcodebox").find("div"), function (i, n) {
				$(this).attr("class", "gr_s gr_s" + Math.floor(10 * Math.random()));
			})
		}, 200);
	}
}

function futureNo(action,type)
{
	var html='';
	var length=0,maxNo=0,classtype=1;
	if(type==34)
	{
		length=720;
		maxNo=720;
	}
	else if(type==35)
	{
		length=1440;
		maxNo=1440;
		classtype=7;
	}
	else if(type==1)
	{
		length=120;
		maxNo=120;
	}
	else if(type == 2)
	{
		length=120;
		maxNo=120;
	}
	else if(type==3)
	{
		length=84;
		maxNo=84;
	}
	else if(type==12)
	{
		length=96;
		maxNo=96;
	}
	else if(type==14 || type==36)
	{
		length=288;
		maxNo=288;
	}
	//11选5
	else if(type==6 || type == 8)
	{
		length=84;
		maxNo=84;
	}
	else if(type==15)
	{
		length=85;
		maxNo=85;
	}
	else if(type==16)
	{
		length=78;
		maxNo=78;
	}
	//3d 排列三
	else if(type==9 || type==10 || type==11)
	{
		classtype=3;
		length=20;
	}
	//pk10
	else if(type==20 || type==24)
	{
		classtype=6;
		length=179;
		maxNo=179;
	}
	//快3
	else if(type==25)
	{
		length=82;
		maxNo=82;
	}
	//快乐十分
	else if(type==17 || type==18)
	{
		length=84;
		maxNo=84;
	}
	//六合彩
	else if(type==40)
	{
		classtype = 11;
		length=1;
		maxNo=1;
	}
	//时时乐
	else if(type == 7){
		classtype=1;
		length=23;
		maxNo=23;
	}
	//韩国1.5
	else if(type == 60){
		classtype=12;
		length=960;
		maxNo=960;
	}
	//加拿大3.5
	else if(type == 61){
		classtype=6;
		length=262;
		maxNo=262;
	}
	//台湾5
	else if(type == 62){
		classtype=6;
		length=203;
		maxNo=203;
	}
	//北京5
	else if(type == 63){
		classtype=6;
		length=288;
		maxNo=288;
	}
	$('#lt_trace_qissueno option:first').val(length);
	$('#lt_trace_issues_table tr').remove();
	if(classtype==1){
		var no = action.substr(9,3);
		var qian = action.substr(0,8);
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(no)+parseInt(i);
			if(num<=maxNo){
				no2 = qian+'-'+(num+1000+' ').substr(1,3);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			else{
				num=num-maxNo+1000;
				var time = new Date(new Date().valueOf() + 1*24*60*60*1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				qian = y+''+(m<10?'0'+m:m)+(d<10?'0'+d:d);
				no2=qian+'-'+(num+' ').substr(1,3);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+no2+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
		}
	}else if(classtype==7){
		var no = action.substr(9,4);
		var qian = action.substr(0,8);
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(no)+parseInt(i);
			if(num<=maxNo){
				no2 = qian+'-'+(num+10000+' ').substr(1,4);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			else{
				num=num-maxNo+10000;
				var time = new Date(new Date().valueOf() + 1*24*60*60*1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				qian = y+''+(m<10?'0'+m:m)+(d<10?'0'+d:d);
				no2=qian+'-'+(num+' ').substr(1,4);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+no2+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
		}
	}
	else if(classtype==2){
		var no = action.substr(9,2);
		var qian = action.substr(0,8);
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(no)+parseInt(i);
			if(num<=maxNo){
				no2 = qian+'-'+(num+100+' ').substr(1,2);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			else{
				num=num-maxNo+100;
				var time = new Date(new Date().valueOf() + 1*24*60*60*1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				qian = y+''+(m<10?'0'+m:m)+(d<10?'0'+d:d);
				no2=qian+'-'+(num+' ').substr(1,2);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+no2+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
		}
	}
	else if(classtype==3){
		var no = action.substr(4,3);
		var qian = action.substr(0,4);
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(no)+parseInt(i);
			no2 = qian+''+(num+1000+' ').substr(1,3);
			html = html + '<option value="'+no2+'">'+no2+'</option>';
			
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+no2+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
		}
	}
	else if(classtype==6){
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(action)+parseInt(i);
			html = html + '<option value="'+num+'">'+num+'</option>';
			
			var no2 = num;
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+no2+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
		}
	}
	else if(classtype==11){
		$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
			.append('<td>'+action+'</td>')
			.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
			.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
			.appendTo('#lt_trace_issues_table');
	}else if(classtype==12){
		var no = action.substr(8,3);
		var qian = action.substr(0,8);
		var num=1;
		for(var i=0;i<length;i++){
			num=parseInt(no)+parseInt(i);
			if(num<=maxNo){
				no2 = qian+(num+1000+' ').substr(1,3);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			else{
				num=num-maxNo+1000;
				var time = new Date(new Date().valueOf() + 1*24*60*60*1000);
				var y = time.getFullYear();
				var m = time.getMonth()+1;
				var d = time.getDate();
				qian = y+''+(m<10?'0'+m:m)+(d<10?'0'+d:d);
				no2=qian+(num+' ').substr(1,3);
				html = html + '<option value="'+no2+'">'+no2+'</option>';
			}
			$('<tr>').append('<td class="r1"><input name="lt_trace_issues[]" rel="zhuihao" value="'+ no2 + '" type="checkbox"></td>')
				.append('<td>'+no2+'</td>')
				.append('<td class="nosel"><input name="lt_trace_times_20160430-003" data="zhuihao" class="r2" value="0" disabled="disabled" type="text">倍</td>')
				.append('<td>￥<span id="lt_trace_money_20160430-003">0.000</span></td>')
				.appendTo('#lt_trace_issues_table');
		}
	}
	$('#lt_issue_start').html(html);
}

//显示玩法组
function selectGroup(self){
	$('#lt_sel_nums').text('0');
	$('#lt_sel_money').text('0.000');
	if($(self).is('.tab-front'))
		return false;
	var url = $(self).attr('data');

	//获取数据
	var td = $('#lt_cf_content tbody').html();
	var lt_cf_nums = $('#lt_cf_nums').text();
	var lt_cf_money = $('#lt_cf_money').text();
	var code = [];
	$('#lt_cf_content tr').each(function(){
		code.push($(this).data('code'));
	});
	wait();
	$('#played-span').load(url,function(){
		destroyWait();
		var $old = $(self).closest('#tabbar-div-s2').find('.tab-front');
		$old.removeClass('tab-front');
		$old.addClass('tab-back');
		$(self).removeClass('tab-back');
		$(self).addClass('tab-front');

		//一键投注、马上投注、预投注、全部清除
		getQiHao();
		$('#lt_bet_immediate').unbind('click');
		$('#lt_bet_immediate').bind('click',gamePostCode);
		$('#lt_buy').bind('click',gamePostCode2);
		$('#lt_cf_clear').bind('click',gameActionRemoveCode);
        $('#lt_trace_if2').click(zhuihao);
		show_flash();

		//绑定数据
		$('#lt_cf_content tr').remove();
		$('#lt_cf_content tbody').html(td);
		$('#lt_cf_nums').text(lt_cf_nums);
		$('#lt_cf_money').text(lt_cf_money);
		var i =0;
		$('#lt_cf_content tr').each(function(){
			$(this).data('code', code[i]);
			i++;
		});
	});
	
	return false;
}
//显示分玩法
function selectPlayed(self){
	$('#lt_sel_nums').text('0');
	$('#lt_sel_money').text('0.000');
	if($(self).is('.act'))
		return false;
	var url = $(self).attr('data');
	//获取数据
	var td = $('#lt_cf_content tbody').html();
	var lt_cf_nums = $('#lt_cf_nums').text();
	var lt_cf_money = $('#lt_cf_money').text();
	var code = [];
	$('#lt_cf_content tr').each(function(){
		code.push($(this).data('code'));
	});
	wait();
	$('#played-content').load(url,function(re){
		destroyWait();
		var $old = $(self).closest('.tz_li').find('.act');
		$old.removeClass('act');
		$old.addClass('back');
		$(self).removeClass('back');
		$(self).addClass('act');
		var a = re;

		//一键投注、马上投注、预投注、全部清除
		getQiHao();
		$('#lt_bet_immediate').unbind('click');
		$('#lt_bet_immediate').bind('click',gamePostCode);
		$('#lt_buy').bind('click',gamePostCode2);
		$('#lt_cf_clear').bind('click',gameActionRemoveCode);
		$('#lt_trace_if2').click(zhuihao);
		show_flash();
		//绑定数据
		$('#lt_cf_content tr').remove();
		$('#lt_cf_content tbody').html(td);
		$('#lt_cf_nums').text(lt_cf_nums);
		$('#lt_cf_money').text(lt_cf_money);
		var i =0;
		$('#lt_cf_content tr').each(function(){
			$(this).data('code', code[i]);
			i++;
		});
	});
	
	return false;
}

//PK10动画准备阶段
var ready;
var run;
var bg_run;
ready = setTimeout(function(){
	read();
},100);
function read(){
	clearTimeout(ready);
	if($(".road_ready").hasClass("road_ready_1")){
		$(".road_ready").removeClass("road_ready_1 road_ready_2 road_ready_3");
		$(".road_ready").addClass("road_ready_2");
	}else if($(".road_ready").hasClass("road_ready_2")){
		$(".road_ready").removeClass("road_ready_1 road_ready_2 road_ready_3");
		$(".road_ready").addClass("road_ready_3");
	}else if($(".road_ready").hasClass("road_ready_3")){
		$(".road_ready").removeClass("road_ready_1 road_ready_2 road_ready_3");
		$(".road_ready").addClass("road_ready_1");
	}
	for(var i = 1;i<11;i++){
		if($("#car_"+i).hasClass("on")){
			$("#car_"+i).removeClass("on");
		}else {
			$("#car_"+i).addClass("on");
		}
	}
	ready = setTimeout(function(){
		read();
	},100);
}
//PK10动画奔跑阶段
var bgL=0;
// run = setTimeout(function(){
// 	running();
// },100);

function running(){
	clearTimeout(run);
	clearTimeout(ready);
	$('.road_ready').css('display','none');

	for(var i = 1;i<11;i++){
		var right = parseInt($("#car_"+i).css('margin-right'));
		
			right= parseInt(Math.floor(Math.random()*(400-300+1))+300);
			//$("#car_"+i).css('margin-right',right+'px');
		$("#car_"+i).animate({marginRight:right+'px'},400);
			$('.road_begin').css('background','none');	
	}
	run = setTimeout(function(){
		running();
	},400);
}
function bg_running(){
	clearTimeout(bg_run);
	bgL+=parseInt(100);
	$('.road_bg').css("background-position-x",bgL+'px');
	bg_run = setTimeout(function(){
		bg_running();
	},100);
}
//PK10动画停止阶段
function endRun(){
	clearTimeout(run);
	clearTimeout(bg_run);
	$('.road_begin').css("background",'url(/Public/Home/images/car/road_end.png) no-repeat left top');
}
//快捷选号效果
// $(function(){
// $('.m1').each(function(){
// 		$('.m1').mouseover(function(){
// 			$(this).css('z-index','1');
// 			$(this).siblings('.m2').css({position:'relative'});
// 			$(this).siblings('.m2').find('input').css('z-index','999');
// 			$(this).siblings('.m2').find('.n1').stop().animate({top:'6px',right:'30px',opacity: '1'},'fast');
// 			$(this).siblings('.m2').find('.n2').stop().animate({top:'12px',right:'5px',opacity: '1'},'fast');
// 			$(this).siblings('.m2').find('.n3').stop().animate({top:'38px',right:'5px',opacity: '1'},'fast');
// 			$(this).siblings('.m2').find('.n4').stop().animate({top:'45px',right:'30px',opacity: '1'},'fast');
// 			$(this).siblings('.m2').find('.n5').stop().animate({top:'38px',right:'55px',opacity: '1'},'fast');
// 			$(this).siblings('.m2').find('.n6').stop().animate({top:'12px',right:'55px',opacity: '1'},'fast');
// 		});
// 		$('.m2').mouseleave(function(){
// 			$('.m1').css('z-index','999');
// 			$(this).css('position', 'inherit')
// 			$(this).find('input').css('z-index','1');
			
// 			$(this).find('.n1,.n2,.n3,.n4,.n5,.n6').stop().animate({top:'13px',right:'30px',opacity: '0'},'fast');
// 		});
// 	})

// })

