TIP=true;
$(document).ready(function () {
    $("#j-refresh").on("click", function () {
        $(this).addClass("fa-spin").addClass("fa-2x");
        autoupdate($(this).attr('action'));
    }).mouseover(function () {
        $(this).addClass("fa-2x");
    }).mouseout(function () {
        $(this).removeClass("fa-2x");
    });
	
	var timeout1;
	//{{{系统提现提示
	if(typeof(TIP)!='undefined' && TIP){
		timeout1 = setInterval(function(){
			cash_tip();
		}, 10000);
	}
	
	function cash_tip(){		
		clearInterval(timeout1);
		$.getJSON('/index.php?s=home/user/getTip', function(data){
			var tip = data.info;
			if(tip && tip.flag){
				// 只处理正确返回的数据
				//playVoice('Public/Home/sound/msg.mp3', 'cash-voice');
				
				//bootbox.alert(tip.message);
				$("<div>").append(tip.message).dialog({
					position:['right','bottom'],
					minHeight:40,
					title:'系统提示',
					buttons:''
				});
				
				//setTimeout(function(){$('.ui-dialog').remove(); $('.ui-widget-overlay').remove();},15000);
				
				if(tip.message.indexOf('充值')!=-1 || tip.message.indexOf('扣款')!=-1)
					autoupdate('/index.php?s=/home/index/userinfo');
				
			}
		})
		
		timeout1 = setInterval(function(){
			cash_tip();
		}, 10000);
	}
});

// 播放声音
function playVoice(src, domId){
	var $dom=$('#'+domId)
	if($.browser.msie){
		// IE用bgsound标签处理声音
		
		if($dom.length){
			$dom[0].src=src;
		}else{
			$('<bgsound>',{src:src, id:domId}).appendTo('body');
		}
	}else{
		// IE以外的其它浏览器用HTML5处理声音
		if($dom.length){
			$dom[0].play();
		}else{
			$('<audio>',{src:src, id:domId}).appendTo('body')[0].play();
		}
	}
}
//更新会员及时信息
function autoupdate(href) {
    $.ajax({
        type: "POST",
        url: href,
        dataType: "json",
        global: false,
        success: function (data) {
            $("#j-refresh").removeClass("fa-spin").removeClass("fa-2x");
            $("#user_sscmoney").html(data.coin);
            $('.balance').text(data.coin);
            $("#user_nickname").html(data.nickname);
            if (data.enable == "0")
            {
                alert("您帐号被冻结，请联系在线客服");
                //document.location.href = "/public/logout";
                return;
            }
        },
        error: null,
        cache: false
    });
}


//_fastData = setInterval(autoupdate, 30000);