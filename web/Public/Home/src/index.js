/**
 * Created by NicoleQi on 2016/11/30.
 */
/*头像的鼠标移入移出效果*/
function headHover(){
    $(".head-mes").mouseenter(function(){
        $(".head-pic").addClass("s");
    }).mouseleave(function(){
        $(".head-pic").removeClass("s");
    });
}

/*首页导航菜单鼠标移入移出效果*/
function choseNav(){
    $(".header .header-menu .nav-link .nav-box li a").mouseenter(function(){
        if($(this).attr('rel')==2){
            $(".nav-slider .nav-list.list1").show();
        }else{
            $(".nav-slider .nav-list.list1").hide();
        }
        if($(this).attr('rel')==5){
            $(".nav-slider .nav-list.list2").show();
        }else{
            $(".nav-slider .nav-list.list2").hide();
        }
    });
    $(".nav-list.list1,.nav-list.list2").mouseleave(function(){
        $(this).hide();
    });
}

/*banner图下面的小图切换效果*/
function swiperImg(){
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        prevButton: '.swiper-button-prev',
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 30,
        loop: true
    });
}

/*首页公告类型切换*/
function changeNoticeType(){
    $(".notice .notice-type a").click(function(){
        if($(this).attr('rel')==1){
            $(this).addClass("act");
        }else if($(this).attr('rel')==2){
            play.cozyTip("<p class='cozy-tip'>暂未开放，敬请期待！</p>");
        }
    });
}

/*游戏客户端下载切换*/
function changeDownload(){
    $("#game-down a:first").click();
    $("#game-down a").click(function(){
        if($(this).attr('rel')==1){
            $(this).siblings().removeClass('act2');
            $(this).addClass("act2");
            $(".qr-box .qr-bg img").attr('src','../img/index/qr-ewm.png');
            $(".qr-box .qr-add p").html("彩票手机<br>客户端下载");
            $(".qr-box .qr-add .ios").attr('href','');
            $(".qr-box .qr-add .android").attr('href','');
        }else if($(this).attr('rel')==2){
            play.cozyTip("<p class='cozy-tip'>暂未开放，敬请期待！</p>");
            return false;
            $(".qr-box .qr-bg img").attr('src','img/index/qr-ewm1.png');
            $(".qr-box .qr-add p").html("AG极速<br>客户端下载");
            $(".qr-box .qr-add .ios").attr('href','');
            $(".qr-box .qr-add .android").attr('href','');
        } else if($(this).attr('rel')==3){
            play.cozyTip("<p class='cozy-tip'>暂未开放，敬请期待！</p>");
            return false;
            $(".qr-box .qr-bg img").attr('src','img/index/qr-ewm2.png');
            $(".qr-box .qr-add p").html("AG捕鱼<br>客户端下载");
            $(".qr-box .qr-add .ios").attr('href','');
            $(".qr-box .qr-add .android").attr('href','');
        }
    });
}

/*首页电子游艺图片切换效果*/
function gameShowChange(){
    var self_now = 0;
    var self_speed = 4000;
    var self_auto_change = null;
    var self_max = $('#game-show div.img').size();
    function self_change(i){
        $('#game-show div.img').hide();
        $('#game-show-text-bg li').removeClass('on');
        $('#game-show-txt li').removeClass('on');
        $('#game-show div.img:eq(' + i + ')').show();
        $('#game-show-text-bg li:eq(' + i + ')').addClass('on');
        $('#game-show-txt li:eq(' + i + ')').addClass('on');
    }
    function self_interval(){
        return setInterval(function(){
            self_now++;
            if (self_now >= self_max)
            {
                self_now = 0;
            }
            self_change(self_now);
        }, self_speed);
    }
    $('#game-show div:first').show();
    $('#game-show-text-bg li:first').addClass('on');
    $('#game-show-txt li:first').addClass('on');
    $('#game-show-txt li').each(function(i){
        $(this).mouseover(function(){
            self_now = i;
            clearInterval(self_auto_change);
            self_change(i);
        }).mouseout(function(){
            self_auto_change = self_interval();
        });
    });
    $(function(){
        $('#sc_chinaz_com_loding').hide();
        self_auto_change = self_interval();
    });
}
