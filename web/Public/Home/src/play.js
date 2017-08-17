/**
 * Created by NicoleQi on 2016/12/7.
 */
/*切换彩种*/
function changeLottery(){
    $(".left-menu .hot-lottery li:first").addClass("cp-chose");
    $(".left-menu .hot-lottery li").click(function(){
        $(".left-menu .hot-lottery li").removeClass("cp-chose");
        $(this).addClass("cp-chose");
        $(".left-menu dl dd").removeClass("cp-chose");
    });

    $(".left-menu dl dd").click(function(){
        $(".left-menu dl dd").removeClass("cp-chose");
        $(this).addClass("cp-chose");
        $(".left-menu .hot-lottery li").removeClass("cp-chose");
    });

    $(".left-menu dl dt").click(function(){
        if($(this).hasClass("select-btn")){
            $(this).removeClass("select-btn");
            $(this).find("img").attr("src","img/lottery/select-xl.png");
            $(this).nextAll("dd").slideUp();
        }else{
            $(this).parent().siblings().children("dt").removeClass("select-btn");
            $(this).parent().siblings().children("dt").find("img").attr("src","img/lottery/select-xl.png");
            $(this).parent().siblings().children("dd").css("display","none");
            $(this).addClass("select-btn");
            $(this).find("img").attr("src","img/lottery/select-xl1.png");
            $(this).nextAll("dd").slideToggle();
        }
    });
}







/*开奖记录鼠标移入的提示*/
function exchangeLotteryRecord(){
    $('.tab-lottery .tab-lottery-list ul li').hover(function() {
        initHint('.tab-lottery .tab-lottery-list ul li','号码形态','<p style="line-height: 20px;">后二和值：4<br>后二和值：4<br>前三状态：组三</p>');
    });
}

/*点击投注按钮区域中的按钮操作*/
function betAreaBtn(){
     $(".bet-type-list div").click(function() {
         $(this).siblings().removeClass("on");
         $(this).addClass("on");
         if ($(this).hasClass("trace")){
            play.betChaseNumber();
            $(".chase-nav .chase-nav-cont a").click(function(){
                    $(this).siblings().removeClass("on");
                    $(this).addClass("on");
                if($(this).attr('rel')==1){
                    $(".chase-top .title-bottom span.inp-sty-1,.chase-top .title-bottom span.inp-sty-2").show();
                    $(".chase-top .title-bottom span.inp-sty-3").hide();
                }else if($(this).attr('rel')==2){
                    $(".chase-top .title-bottom span.inp-sty-1").show();
                    $(".chase-top .title-bottom span.inp-sty-2,.chase-top .title-bottom span.inp-sty-3").hide();
                }else if($(this).attr('rel')==3){
                    $(".chase-top .title-bottom span.inp-sty-1,.chase-top .title-bottom span.inp-sty-3").show();
                    $(".chase-top .title-bottom span.inp-sty-2").hide();
                }
            });
        }else if($(this).hasClass("join-buy")){
            play.betChaseTip();
        }
     });
}
 /*立即投注*/
function betPromptly(){
     $(".shade-div .now-bet-div").on('click',function(){
        play.betDialog();
     });
}
/*投注记录*/
function betRecord(){
     $(".gm-r-con .tab-list .tab ul li").on('click',function(){
        play.betRecordDialog();
     });
}



/*彩种玩法选择*/
function showLotteryChose(){
    $(".tzn-body .unit-title .u-tab-div span").click(function(){
        $(this).siblings("span").removeClass("tab-front");
        $(this).addClass("tab-front");
        $(".tzn-body .unit-title .wf-chose-box").show();
    });
    $(".tzn-body .unit-title .u-tab-div span").mouseenter(function(){
        if($(this).hasClass("tab-front")){
            $(".tzn-body .unit-title .wf-chose-box").show();
        }
    });
    $(".tzn-body .unit-title").mouseleave(function(){
        $(".tzn-body .unit-title .wf-chose-box").hide();
    });
}

/*彩种玩法模式选择*/
function showLotteryPattern(){
    $(".wf-chose-box ul li .back span").click(function(){
        $(".wf-chose-box ul li .back span").removeClass("act");
        $(this).addClass("act");
    })
}

/*历史记录切换*/
function lotteryRecordChange(){
    $(".gm-r-con .game-record a").click(function(){
        $(".gm-r-con .game-record a").removeClass("on");
        $(this).addClass("on");
        $(".gm-r-con .tab-list .tab").css("display","none");
        if($(this).attr("rel")==1){
            $(".tab.tab-bet").css("display","block");
        }else if($(this).attr("rel")==2){
            $(".tab.tab-trace").css("display","block");
        }else if($(this).attr("rel")==3){
            $(".tab.tab-lottery").css("display","block");
        }
    });
}

/*开奖记录鼠标移入的提示*/
function initHint(id, title, content){
    $(id).miniTip({
        title: title,
        content: content,
        anchor: 'w',
        event: 'hover',
        fadeIn: 500,
        fadeOut: 500,
        aHide: true,
        maxW: '300px',
        offset: 1,
        stemOff: 0,
        position: 'left'
    });
}

/*弹窗*/
var play ={
    /*投注弹窗*/
    betDialog:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("bet-box"),
            width:'580px',
            height:'auto',
            ok:function(){
                play.betBuySuccess();
                return true;
            },
            cancel:true
        });
    },
    /*投注购买成功*/
    betBuySuccess:function(){
        art.dialog({
            padding:0,
            title:'温馨提示',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("bet-return-result"),
            width:'350px',
            height:'auto',
            ok:true,
            cancel:true
        })
    },
    /*投注记录弹窗*/
    betRecordDialog:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("bet-record-box"),
            width:'600px',
            height:'auto',
            ok:true
        });
    },
    /*点击追号按钮弹窗追号*/
    betChaseNumber:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("bet-chase-number"),
            width:'680px',
            height:'auto',
            okVal: '立即投注',
            ok:true
        })
    },
    /*追号投注提示*/
    betChaseTip:function(){
        art.dialog({
            padding:0,
            title:'温馨提示',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("bet-tip"),
            width:'250px',
            height:'auto',
            ok:true
        });
    },
    /*温馨提示*/
    cozyTip:function(content){
        art.dialog({
            padding:0,
            title:'温馨提示',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: content,
            width:'250px',
            height:'auto',
            ok:true
        });
    },
    /*温馨提示*/
    noticeListPop:function(){
        art.dialog({
            padding:0,
            title:'消息列表',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.4',
            content: document.getElementById("noticeList"),
            width:'250px',
            height:'auto',
            close:true
        });
    }
};






