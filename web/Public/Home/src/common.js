/**
 * Created by 34772 on 2017/2/22.
 */
 var TIP=true;
 $(function(){
    var timeout2;
    //{{{系统下线提示
        if(typeof(TIP)!='undefined' && TIP){
            timeout2 = setTimeout(function(){
                recharge_tip();
            }, 6000);
        }

        function recharge_tip(){
clearTimeout(timeout2);
$.post("/index.php?s=/home/user/notice",function(data){
    if(data.status){
        $("#frame").append('<div id="qpp" style="position:absolute;z-index:888;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;"></div><div id="app" style="position:absolute;z-index:888; left: 50%;margin-left: -185px;top: 50%;margin-top:-75px;display:none;"><div class="one" style="background-color: #fff;width: 370px;height: 150px;border-radius: 15px;overflow:hidden;"><div class="top" style="width: 100%;height: 40px;background-color: #0099CC;border-top-left-radius: 13px; border-top-right-radius: 13px;"><h4 style="position: relative;color: #fff;font-size: 14px;line-height: 40px;margin:0 auto;text-align: center">温馨提示</h4><div id="del" style="border-radius: 50%;background-color: #fff;border:3px solid #0099CC;color:#0099CC;width: 25px;height:25px;line-height: 24px;text-align: center;font-size: 16px;position: absolute;top:-6px;right: -12px;font-weight: bolder;cursor: pointer;">×</div></div><p id="tex" style="font-size: 18px;line-height: 30px;text-align: center;margin:10px auto;">您的账号在别处登录</p><button id="btn1" style="border: none;padding: 8px 30px;color: #fff;background-color: #0099CC;border-radius: 15px;display: block;margin:10px 136px;float: left;cursor:pointer">确定</button></div></div>');
        $("#app,#qpp").css('display','block');
        $("#btn1,#del").click(function(){
                window.parent.location.href = data.url;
             });

            }
        });
timeout2 = setTimeout(function(){
    recharge_tip();
}, 6000);
}

//var timeout3;
//    //{{{系统中奖提示
//        if(typeof(TIP)!='undefined' && TIP){
//            timeout3 = setTimeout(function(){
//                win_tip();
//            }, 1000);
//        }
//        var bets = new Array();
//        function win_tip(){
//            clearTimeout(timeout3);
//            $.ajax({
//                type : "post",
//                url : "/index.php?s=/home/user/get_bet",
//                async : false,
//                success : function(data){
//                    if(data.status){
//                        //alert(data.info);
//                        var arr = data.info;
//                        if(bets.length > 0){
//                            for(var i = 0; i < arr.length ;i++){
//                                if(!is_in(arr[i].id,bets)){
//                                    bets.push(arr[i]);
//                                }
//                            }
//                        }else {
//                            bets = arr;
//                        }
//                    }
//                }
//            });
//            for(var i =0 ;i<bets.length;i++){
//                var id = bets[i].id;
//                $.ajax({
//                    type : "post",
//                    url : "/index.php?s=/home/user/get_win",
//                    data : {id:id},
//                    async : false,
//                    success : function(data){
//                        if(data.status){
//                            var da = data.info;
//                            if(da.lotteryNo != ''){
//                                //$("body").append('<div id="qp" style="position:absolute;z-index:888;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;"></div><div id="ap" style="position:absolute;z-index:888; left: 50%;margin-left: -170px;top: 140px;display:none;"><div class="one" style="background-color: #fff;width: 370px;height: 150px;border-radius: 15px;overflow:hidden;"><div class="top" style="width: 100%;height: 40px;background-color: #0099CC;border-top-left-radius: 13px; border-top-right-radius: 13px;"><h4 style="position: relative;color: #fff;font-size: 14px;line-height: 40px;margin:0 auto;text-align: center">温馨提示</h4><div id="del" style="border-radius: 50%;background-color: #fff;border:3px solid #0099CC;color:#0099CC;width: 25px;height:25px;line-height: 24px;text-align: center;font-size: 16px;position: absolute;top:-6px;right: -12px;font-weight: bolder;cursor: pointer;">×</div></div><p id="tex" style="font-size: 12px;line-height: 30px;text-align: center;margin:10px auto;">您的账号在别处登录，请确认是否本人操作？</p><button id="btn1" style="border: none;padding: 8px 30px;color: #fff;background-color: #0099CC;border-radius: 15px;display: block;margin:10px 136px;float: left;cursor:pointer">确定</button></div></div>');
//                                //$("#ap,#qp").css('display','block');
//                                //$("#tex").text('期号：'+da.actionNo+'盈亏：'+da.win);
//                                //$("#btn1,#del").click(function(){
//                                //    $("#ap,#qp").css('display','none');
//                                //});
//                                //setInterval('$("#ap,#qp").css("display","none");',3000)
//
//                                 alert('期号：'+da.actionNo+'盈亏：'+da.win);
//                                bets.splice(i--,1);
//                            }
//                        }
//                    }
//                });
//            }
//            timeout3 = setTimeout(function(){
//                win_tip();
//            }, 1000);
//        }
//
//        function is_in(id ,arr){
//            for(var i =0 ;i< arr.length ;i++){
//                if(id == arr[i].id){
//                    return true;
//                }
//            }
//            return false;
//        }
//
//
    var timeout4;
    //{{{系统公告提示
    if(typeof(TIP)!='undefined' && TIP){
        timeout4 = setTimeout(function(){
            announce_tip();
        }, 1000);
    }

    function announce_tip(){
        clearTimeout(timeout4);
        $.ajax({
            type : "post",
            url : "/index.php?s=/home/notice/unread",
            async : false,
            success : function(data){
                if(data.status){
                    var da = data.info;
                    for(var i = 0;i < da.length ;i++){
                        $("#frame").append('<div id="gg1" style="position:absolute;z-index:888;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;"></div>'
                            +'<div id="gg2" style="position:absolute;z-index:888; left: 50%;margin-left: -185px;top: 50%;margin-top:-125px;display:none;">'
                            +'<div class="one" style="background-color: #fff;width: 370px;height: auto;border-radius: 15px;overflow:hidden;">'
                            +'<div class="top" style="width: 100%;height: 40px;background-color: #0099CC;border-top-left-radius: 13px; border-top-right-radius: 13px;">'
                            +'<h4 style="position: relative;color: #fff;font-size: 14px;line-height: 40px;margin:0 auto;text-align: center">公告提示</h4>'
                            +'<div id="gg1_del" style="border-radius: 50%;background-color: #fff;border:3px solid #0099CC;color:#0099CC;width: 25px;height:25px;line-height: 24px;text-align: center;font-size: 16px;position: absolute;top:-6px;right: -12px;font-weight: bolder;cursor: pointer;">×</div>'
                            +'</div>'
                            +'<p id="tex" style="font-size: 18px;line-height: 30px;text-align: center;margin:0px auto;border-bottom: thin dashed #0099CC;" >'+da[i].title+'</p>'
                            +'<p id="tex" style="font-size: 18px;line-height: 30px;text-align: center;margin:10px auto;">'+da[i].content+'</p>'
                            +'<button id="gg1_btn1" style="border: none;padding: 8px 30px;color: #fff;background-color: #0099CC;border-radius: 15px;display: block;margin:10px 136px;float: left;cursor:pointer">确定</button>'
                            +'</div>'
                            +'</div>');
                        $("#gg1,#gg2").css('display','block');
                        $.ajax({
                            type : "post",
                            url : "/index.php?s=/home/notice/read",
                            data : {id:da[i].id},
                            async : false,
                            success : function(data){
                            }
                        });
                        $("#gg1_btn1,#gg1_del").click(function(){
                            $("#gg1").remove();
                            $("#gg2").remove();
                        });
                    }
                }
            }
        });
        timeout4 = setTimeout(function(){
            announce_tip();
        }, 6000);
    }
//
//     var timeout5;
//     //{{{系统取款成功提示
//     if(typeof(TIP)!='undefined' && TIP){
//         timeout5 = setTimeout(function(){
//             cash_tip();
//         }, 1000);
//     }
//
//     function cash_tip(){
//         clearTimeout(timeout5);
//         $.ajax({
//             type : "post",
//             url : "/index.php?s=/home/cash/cash_notice",
//             async : false,
//             success : function(data){
//                 if(data.status){
//                     $("body").append('<div id="qp" style="position:absolute;z-index:888;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;"></div><div id="ap" style="position:absolute;z-index:888; left: 50%;margin-left: -170px;top: 140px;display:none;"><div class="one" style="background-color: #fff;width: 370px;height: 150px;border-radius: 15px;overflow:hidden;"><div class="top" style="width: 100%;height: 40px;background-color: #0099CC;border-top-left-radius: 13px; border-top-right-radius: 13px;"><h4 style="position: relative;color: #fff;font-size: 14px;line-height: 40px;margin:0 auto;text-align: center">温馨提示</h4><div id="del" style="border-radius: 50%;background-color: #fff;border:3px solid #0099CC;color:#0099CC;width: 25px;height:25px;line-height: 24px;text-align: center;font-size: 16px;position: absolute;top:-6px;right: -12px;font-weight: bolder;cursor: pointer;">×</div></div><p id="tex" style="font-size: 12px;line-height: 30px;text-align: center;margin:10px auto;">提现成功，请登录网银查看。</p><button id="btn1" style="border: none;padding: 8px 30px;color: #fff;background-color: #0099CC;border-radius: 15px;display: block;margin:10px 136px;float: left;cursor:pointer">确定</button></div></div>');
//                     $("#ap,#qp").css('display','block');
//                     $("#btn1,#del").click(function(){
//                         $("#ap,#qp").css('display','none');
//                     });
//                 }
//             }
//         });
//         timeout5 = setTimeout(function(){
//             cash_tip();
//         }, 1000);
//     }
//
//     var timeout6;
//     //{{{系统充值成功提示
//     if(typeof(TIP)!='undefined' && TIP){
//         timeout6 = setTimeout(function(){
//             rechar_tip();
//         }, 1000);
//     }
//
//     function rechar_tip(){
//         clearTimeout(timeout6);
//         $.ajax({
//             type : "post",
//             url : "/index.php?s=/home/recharge/recharge_notice",
//             async : false,
//             success : function(data){
//                 if(data.status){
//                     $("body").append('<div id="qp" style="position:absolute;z-index:888;width:100%;height:100%;background:rgba(0,0,0,0.6);display:none;"></div><div id="ap" style="position:absolute;z-index:888; left: 50%;margin-left: -170px;top: 140px;display:none;"><div class="one" style="background-color: #fff;width: 370px;height: 150px;border-radius: 15px;overflow:hidden;"><div class="top" style="width: 100%;height: 40px;background-color: #0099CC;border-top-left-radius: 13px; border-top-right-radius: 13px;"><h4 style="position: relative;color: #fff;font-size: 14px;line-height: 40px;margin:0 auto;text-align: center">温馨提示</h4><div id="del" style="border-radius: 50%;background-color: #fff;border:3px solid #0099CC;color:#0099CC;width: 25px;height:25px;line-height: 24px;text-align: center;font-size: 16px;position: absolute;top:-6px;right: -12px;font-weight: bolder;cursor: pointer;">×</div></div><p id="tex" style="font-size: 12px;line-height: 30px;text-align: center;margin:10px auto;">充值成功，请刷新余额查看。</p><button id="btn1" style="border: none;padding: 8px 30px;color: #fff;background-color: #0099CC;border-radius: 15px;display: block;margin:10px 136px;float: left;cursor:pointer">确定</button></div></div>');
//                     $("#ap,#qp").css('display','block');
//                     $("#btn1,#del").click(function(){
//                         $("#ap,#qp").css('display','none');
//                     });
//                 }
//             }
//         });
//         timeout6 = setTimeout(function(){
//             rechar_tip();
//         }, 1000);
//     }
//
})
