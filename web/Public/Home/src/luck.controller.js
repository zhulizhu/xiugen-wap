(function () {
    'use strict';

    angular
    .module('luck.controller', [])
    .controller('LuckCtrl', LuckCtrl);
    /* @ngInject*/
    LuckCtrl.$inject = ['$scope'];

    function LuckCtrl($scope) {
        var number, playdId,ind;
        var game = {
            type: 50
        };
        $scope.game = {
            time: [0, 0, 0, 0, 0, 0],
            result: [],
            actionNo: 8889,
            historyList: []
        };
        $scope.isLoading = true;

        var T;
        var kjTimer;

        // loadKjData();
        getQiHao();
        getHistoryData();
        getOdds();
        getOrders();

        function getOdds() {
            Q('Luck', 'odds', {}, function (data) {
                $scope.game.odds = data.info.groups;
                $scope.$digest();
            });
        }

        function getOrders() {
            Q('Game', 'getOrders', {type: 50, limit: 20}, function (data) {
                $scope.game.orders = data.info.order_list;
                $scope.game.playeds = data.info.playeds;
                $(".lucky-box").show();
                $scope.$digest();
            });
        }

        $('.number').click(function () {
            $('.number').removeClass('active');
            $('.num').removeClass('active');
            var index = $('.number').index(this);
            playdId = 250 + parseInt(index);
            if ($(this).hasClass('nums')) {
                $(this).find('.num').addClass('active');
            } else {
                $(this).addClass('active');
            }
            ind = parseInt(index);
            if (index < 28) {
                number = index;
            } else if (index == 28) {
                number = '大';
                playdId = 280;
            } else if (index == 29) {
                number = '小';
                playdId = 281;
            } else if (index == 30) {
                number = '单';
                playdId = 282;
            } else if (index == 31) {
                number = '双';
                playdId = 283;
            } else if (index == 32) {
                number = '大单';
                playdId = 284;
            } else if (index == 33) {
                number = '大双';
                playdId = 286;
            } else if (index == 34) {
                number = '小单';
                playdId = 285;
            } else if (index == 35) {
                number = '小双';
                playdId = 287;
            } else if (index == 36) {
                number = '极大';
                playdId = 288;
            } else if (index == 37) {
                number = '极小';
                playdId = 289;
            } else if (index == 38) {
                number = '豹子';
                playdId = 294;
            } else if (index == 39) {
                number = '红';
                playdId = 290;
            } else if (index == 40) {
                number = '绿';
                playdId = 291;
            } else if (index == 41) {
                number = '蓝';
                playdId = 292;
            } else if (index == 42) {
                number = '特码';
                playdId = 293;
            }
        });

        $('.cm').click(function () {
            var money = parseInt($('.bet-money').val());
            money += parseInt($(this).find('span').text());
            $('.bet-money').val(money);
        });

        $('.submit-btn').click(function () {
            if(playdId == 293){
                number = $('#one').val() + '|' + $('#two').val() + '|' + $('#three').val();
            }
            aler();

            function aler(){
                $("#ap,#qp").css('display','block');
                $("#tex").text('是否投注?');
                $("#btn1").bind('click',function(){
                    $("#ap,#qp").css('display','none');
                    var payload = {};
                    var code = [{
                        fanDian: 0.0,
                        bonusProp: $scope.game.odds[ind].bonusProp,
                        mode: 2,
                        beiShu: $('.bet-money').val() / 2,
                        orderId: (new Date())-2147483647*623,
                        actionData: number,
                        actionNum: 1,
                        weiShu: 0,
                        playedId: playdId,
                        type: 50,
                        playedName: $scope.game.odds[ind].name,
                        flag: 1
                    }];
                    var para = {};
                    payload.code = code;
                    para.type = 50;
                    para.actionNo = $('.lottery-num:eq(0)').text();
                    payload.para = para;

                    Q('Game', 'postCode', payload, function (data) {
                        $("#ap,#qp").css('display','block');
                        $("#tex").text(data.info);
                        $("#btn1").unbind('click');
                        $("#btn1").bind('click',function(){
                            $("#ap,#qp").css('display','none');
                        });
                    // alert(data.info);
                    getOrders();
                });
                });
                $("#del").click(function(){
                    $("#ap,#qp").css('display','none');
                })
            }
        });
            

            $("#game-rule").click(function(){
                $('#rules').toggle();
                return false;
            });

            $("#kj_record").click(function(){
                $.ajax('/index.php?s=/home/luck/get_record', {
                    data:{},
                    type:'post',
                    dataType:'json',
                    error:function(xhr, textStatus, errorThrown){
                    },
                    success:function(data, textStatus, xhr){
                        $('#qi').nextAll().remove();
                        var arr = data.info;
                        for(var i=0;i<arr.length;i++){
                            $('#record').append('<p style="font-size: 12px;"><span style="margin-right: 60px">'+arr[i].number+'</span><span>'+arr[i].data+'</span></p>');
                        }
                        $('#record').toggle();
                    }
                });
                return false;
            });

        $('body').click(function(){
            $('#rules').hide();
            $('#record').hide();
            return false;
        });
        $('#rules').click(function(){
            return false;
        });

        /**
         * 更新余额
         */
         function reloadMemberInfo(){
            //子frame调用父窗口函数
            if(parent.window.autoupdate)
                parent.window.autoupdate('/index.php?s=/home/index/userinfo');
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


        function getHistoryData() {
            Q('Index', 'getHistoryData', {type: 50}, function (data) {
                var _data = data.info.history;
                var list = [];
                for (var i = 0; i < _data.length; i++) {
                    var obj = _data[i];
                    var result = obj.data.split(',');
                    result[0] = parseInt(result[0]);
                    result[1] = parseInt(result[1]);
                    result[2] = parseInt(result[2]);
                    var total = result[0] + result[1] + result[2];
                    var daxiao, danshuang;
                    if (total > 13) {
                        daxiao = '大';
                    } else {
                        daxiao = '小';
                    }
                    if (total % 2 == 0) {
                        danshuang = '双';
                    } else {
                        danshuang = '单';
                    }
                    obj.total = total;
                    obj.result = result;
                    obj.daxiao = daxiao;
                    obj.danshuang = danshuang;
                    list.push(obj);
                }
                $scope.game.historyList = list.slice(0, 4);
                $scope.$digest();
                if (kjTimer) clearTimeout(kjTimer);
                kjTimer = setTimeout(getHistoryData, 10000);
            })
        }

        function gameKanJiangDataC(diffTime, actionNo) {

            diffTime = window.diffTime--;
            if (diffTime < 0) {
                if (T) clearTimeout(T);
                getQiHao();
                kjTimer = setTimeout(loadKjData, 10000);

            } else {

                var m = Math.floor(diffTime % 60),
                s = (diffTime-- - m) / 60,
                h = 0;

                if (s < 10) {
                    s = "0" + s;
                }

                if (m < 10) {
                    m = "0" + m;
                }

                if (s > 60) {
                    h = Math.floor(s / 60);
                    s = s - h * 60;
                    // $dom.html((h<10?"0"+h:h)+"&nbsp;"+(s<10?"0"+s:s)+"&nbsp;"+m);
                    var t = (h < 10 ? "0" + h : h) + (s < 10 ? "0" + s : s) + m;
                    $scope.game.time = t.split('');
                    $scope.$digest();
                } else {
                    h = 0;
                    // $dom.html("00"+"&nbsp;"+s+"&nbsp;"+m);
                    var t = "00" + s + m;
                    $scope.game.time = t.split('');
                    $scope.$digest();
                }

                if (T) clearTimeout(T);
                T = setTimeout(function () {
                    gameKanJiangDataC();
                }, 1000);
            }
        }

        function loadKjData() {
            var type = game.type;
            $.ajax('/index.php?s=/home/index/getLastKjData/type/' + type, {
                dataType: 'json',
                cache: false,
                error: function () {
                    if (kjTimer) clearTimeout(kjTimer);
                    kjTimer = setTimeout(loadKjData, 10000);
                },
                success: function (data, textStatus, xhr) {
                    data = data.info;
                    if (!data) {
                        if (kjTimer) clearTimeout(kjTimer);
                        kjTimer = setTimeout(loadKjData, 10000);
                        $scope.game.result = [];
                    } else {
                        try {
                            $scope.game.result = data.data.split(',');
                            $scope.game.total = parseInt($scope.game.result[0])
                            + parseInt($scope.game.result[1])
                            + parseInt($scope.game.result[2]);
                            if ($scope.game.total > 13) {
                                $scope.game.daxiao = '大'
                            } else {
                                $scope.game.daxiao = '小'
                            }

                            if ($scope.game.total % 2 == 0) {
                                $scope.game.danshuang = '双'
                            } else {
                                $scope.game.danshuang = '单'
                            }
                            $scope.$digest();
                        } catch (err) {
                            if (kjTimer) clearTimeout(kjTimer);
                            kjTimer = setTimeout(loadKjData, 10000);
                        }
                    }
                }
            });
        }

        function getQiHao() {
            $.getJSON('/index.php?s=/home/index/getQiHao/type/' + game.type, function (data) {
                if (data && data.lastNo && data.thisNo) {
                    $scope.game.actionNo = data.thisNo.actionNo;

                    if (T) clearTimeout(T);
                    var kjTime = parseInt(data.kjdTime);
                    window.diffTime = data.diffTime - kjTime;
                    T = setTimeout(function () {
                        gameKanJiangDataC();
                    }, 1000);
                }
            });
        }
    }
})();



