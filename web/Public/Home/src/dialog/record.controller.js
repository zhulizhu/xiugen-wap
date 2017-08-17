(function () {
    'use strict';

    angular
        .module('record.controller', [])
        .controller('RecordCtrl', RecordCtrl);
    /* @ngInject*/
    RecordCtrl.$inject = ['$scope'];
    /* @ngInject*/

    function RecordCtrl($scope) {
        $scope.data = {
            type: 1,
            current: "1",
            page: 1
        };
        $scope.nowArr = [];

        var vm = $scope.vm = {};


        //格式化日期：yyyy-MM-dd
        function formatDate(date) {
            var myyear = date.getFullYear();
            var mymonth = date.getMonth() + 1;
            var myweekday = date.getDate();

            if (mymonth < 10) {
                mymonth = "0" + mymonth;
            }
            if (myweekday < 10) {
                myweekday = "0" + myweekday;
            }
            return (myyear + "/" + mymonth + "/" + myweekday);
        }

        var now = new Date();
        $scope.ToDay = formatDate(now);

        //今天
        $scope.toDay = function () {
            var now = new Date();
            $scope.today = formatDate(now);

            $(".recordTime1").val($scope.today);
            $(".recordTime2").val($scope.today);
        };

        //昨天
        $scope.yesTerDay = function () {
            var now = new Date();
            now.setDate(now.getDate() - 1);
            $scope.yesTday = formatDate(now);

            $(".recordTime1").val($scope.yesTday);
            $(".recordTime2").val($scope.yesTday);
        };

        //本周日期
        $scope.thisWeek = function () {
            var now = new Date();
            var nowWeek = now.getDay();// 当前星期
            $scope.tswkEnd = formatDate(now); // 本周结束日期
            now.setDate(now.getDate() - nowWeek);
            $scope.tswkStart = formatDate(now); // 本周开始日期

            $(".recordTime1").val($scope.tswkStart);
            $(".recordTime2").val($scope.tswkEnd);
        };
        //上周
        $scope.lastWeek = function () {
            var now = new Date();
            var nowWeek = now.getDay();
            now.setDate(now.getDate() - nowWeek - 7);
            $scope.startLastWeek = formatDate(now); // 上周开始日期
            now.setDate(now.getDate() + 6);
            $scope.endLastWeek = formatDate(now); // 上周结束日期
            $(".recordTime1").val($scope.startLastWeek);
            $(".recordTime2").val($scope.endLastWeek);

        };
        //本月
        $scope.thisMonth = function () {

            var now = new Date();
            var nowDate = now.getDate();//当前日期
            $scope.endThisMonth = formatDate(now); // 本月结束日期
            now.setDate(now.getDate() - nowDate + 1);
            $scope.startThisMonth = formatDate(now); // 本月开始日期

            $(".recordTime1").val($scope.startThisMonth);
            $(".recordTime2").val($scope.endThisMonth);
        };

        //上月
        $scope.lastMonth = function () {
            var now = new Date();
            var nowDate = now.getDate();//当前日期
            now.setDate(now.getDate() - nowDate + 1);
            now.setMonth(now.getMonth() - 1);
            $scope.startLastMonth = formatDate(now); // 上月开始日期

            now.setMonth(now.getMonth() + 1);
            now.setDate(now.getDate() - 1);
            $scope.endLastMonth = formatDate(now); // 上月结束日期

            $(".recordTime1").val($scope.startLastMonth);
            $(".recordTime2").val($scope.endLastMonth);
        };


        //今天、昨天、、、、、
        vm.chose = [
            {name: '今天', value: 'today'},
            {name: '昨天', value: 'yesterday'},
            {name: '本周', value: 'this-week'},
            {name: '上周', value: 'prev-week'},
            {name: '本月', value: 'this-month'},
            {name: '上月', value: 'prev-month'}
        ];
        vm.timeName = vm.chose[0].name;


        $scope.changeDate = changeDate;
        function changeDate(name) {
            vm.timeName = name;
            if (name == '今天') {
                $scope.toDay();
            } else if (name == '昨天') {
                $scope.yesTerDay();
            } else if (name == '本周') {
                $scope.thisWeek();
            } else if (name == '上周') {
                $scope.lastWeek();
            } else if (name == '本月') {
                $scope.thisMonth();
            } else if (name == '上月') {
                $scope.lastMonth();
            }
        }

        $scope.actions = {
            setCurrent: function (param) {
                $scope.data.current = param;
            }
        };

        vm.lott = [
            {name: '彩票记录', type: 1},
            {name: '追号记录', type: 2}
        ];
        vm.lottType = vm.lott[0].type;

        //游戏类型
        vm.gameType = [
            {
                name: '重庆时时彩',
                id: 101
            },
            {
                name: '江西时时彩',
                id: 102
            },
            {
                name: ' 天津时彩',
                id: 103
            },
            {
                name: '新疆时时彩',
                id: 104
            },
            {
                name: '排列5',
                id: 105
            },
            {
                name: '秒秒彩',
                id: 106
            },
            {
                name: '分分彩',
                id: 107
            },
            {
                name: '五分彩',
                id: 108
            },
            {
                name: '俄罗斯1.5分彩',
                id: 109
            },
            {
                name: '新西兰45分彩',
                id: 110
            }
        ];

        vm.gameName = vm.gameType[0].name;

        //查询参数
        vm.parameter = [
            {
                name: '个人',
                value: 'personal'
            },
            {
                name: '直属',
                value: 'under'
            },
            {
                name: '全部',
                value: 'all'
            }
        ];

        vm.opValue = vm.parameter[0].value;


        vm.playId = '';
        vm.name = '';

        //请选择查询条件查询状态
        $scope.sts = 0;
        //游戏记录&&追号记录
        $scope.record = record;
        //record();
        function record() {
            $scope.start_time = $(".recordTime1").val();
            $scope.end_time = $(".recordTime2").val();

            $scope.times = [
                $scope.start_time,
                $scope.end_time
            ];

            Q('team', 'record', {'utype': '1', page: $scope.data.page, fromTime: $scope.start_time + ' 03:00', toTime: $scope.end_time + ' 03:00'}, function (data) {
                console.log(data);
                $scope.nowArr = data.info.data;
                $scope.info = data.info;
                $scope.$digest();
            });

            //   yikeYbc.record(vm.opValue, token, vm.name, $scope.times, vm.gameName, vm.playId, vm.lottType)
            //       .then(function (data) {
            //         if (vm.lottType == 1) {
            //           if (data.status == 1) {
            //             $scope.sts = data.status;
            //             $scope.bettingData = data.result.result;
            //
            //             for (var b = 0; b < $scope.bettingData.length; b++) {
            //               var playId = $scope.bettingData[b].play_id;
            //               for (var i in wf_list) {
            //                 for (var j in wf_list[i]) {
            //                   var status = $.inArray(playId, wf_list[i][j]);
            //                   if (status != -1) {
            //                     $scope.bettingData[b].playName = j;
            //                   }
            //                 }
            //               }
            //             }
            //
            //             $scope.allNumber = $scope.bettingData.length;
            //             $scope.allPage = Math.ceil($scope.allNumber / 10);
            //             $scope.defaultPage = 1;
            //             $scope.nowArr = [];
            //             for (var i = 0; i < ($scope.allNumber < 10 ? $scope.allNumber : 10); i++) {
            //               $scope.nowArr.push($scope.bettingData[i]);
            //             }
            //
            //             //下一页
            //             $scope.pageDown1 = function () {
            //               $scope.nowArr = [];
            //               if ($scope.defaultPage < $scope.allPage) {
            //                 $scope.defaultPage++;
            //               }
            //               for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
            //                 if (i <= $scope.allNumber - 1) {
            //                   $scope.nowArr.push($scope.bettingData[i]);
            //                 }
            //               }
            //             };
            //             //上一页
            //             $scope.pageUp1 = function () {
            //               $scope.nowArr = [];
            //               if ($scope.defaultPage > 1) {
            //                 $scope.defaultPage--;
            //               }
            //               for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
            //                 if (i <= $scope.allNumber - 1) {
            //                   $scope.nowArr.push($scope.bettingData[i]);
            //                 }
            //               }
            //             };
            //             //go
            //             $scope.pageGo1 = function (pageNow) {
            //               $scope.nowArr = [];
            //               if (pageNow >= 1 && pageNow <= $scope.allPage) {
            //                 $scope.defaultPage = pageNow;
            //               }
            //               for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
            //                 if (i <= $scope.allNumber - 1) {
            //                   $scope.nowArr.push($scope.bettingData[i]);
            //                 }
            //               }
            //             };
            //           } else {
            //             $scope.sts = data.status;
            //             $scope.nullData = data.result.result;
            //             $scope.nowArr = [];
            //             //play.cozyTip("<span>暂无投注记录</span>");
            //           }
            //
            //
            //         } else if (vm.lottType == 2) {//追号记录
            //           if (data.status == 1) {
            //             $scope.sts1 = data.status;
            //
            //             $scope.cancelStatus = data.result.result[0].is_open;
            //             $scope.chaseData = data.result.result;
            //
            //             for (var b = 0; b < $scope.chaseData.length; b++) {
            //               var playId = $scope.chaseData[b].play_id;
            //               for (var i in wf_list) {
            //                 for (var j in wf_list[i]) {
            //                   var status = $.inArray(playId, wf_list[i][j]);
            //                   if (status != -1) {
            //                     $scope.chaseData[b].playName = j;
            //                   }
            //                 }
            //               }
            //             }
            //             console.log($scope.chaseData);
            //
            //             $scope.allNumber1 = $scope.chaseData.length;
            //             $scope.allPage1 = Math.ceil($scope.allNumber1 / 10);
            //             $scope.defaultPage1 = 1;
            //             $scope.nowArr1 = [];
            //             for (var i = 0; i < ($scope.allNumber1 < 10 ? $scope.allNumber1 : 10); i++) {
            //               $scope.nowArr1.push($scope.chaseData[i]);
            //             }
            //
            //             //下一页
            //             $scope.pageDown2 = function () {
            //               $scope.nowArr1 = [];
            //               if ($scope.defaultPage1 < $scope.allPage1) {
            //                 $scope.defaultPage1++;
            //               }
            //               for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
            //                 if (i <= $scope.allNumber1 - 1) {
            //                   $scope.nowArr1.push($scope.chaseData[i]);
            //                 }
            //               }
            //             };
            //             //上一页
            //             $scope.pageUp2 = function () {
            //               $scope.nowArr1 = [];
            //               if ($scope.defaultPage1 > 1) {
            //                 $scope.defaultPage1--;
            //               }
            //               for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
            //                 if (i <= $scope.allNumber1 - 1) {
            //                   $scope.nowArr1.push($scope.chaseData[i]);
            //                 }
            //               }
            //             };
            //             //go
            //             $scope.pageGo2 = function (pageNow1) {
            //               $scope.nowArr1 = [];
            //               if (pageNow1 >= 1 && pageNow1 <= $scope.allPage1) {
            //                 $scope.defaultPage = pageNow1;
            //               }
            //               for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
            //                 if (i <= $scope.allNumber1 - 1) {
            //                   $scope.nowArr1.push($scope.chaseData[i]);
            //                 }
            //               }
            //             };
            //           } else {
            //             $scope.sts1 = data.status;
            //             $scope.nullData1 = data.result.result;
            //             $scope.nowArr1 = [];
            //             //play.cozyTip("<span>暂无投注记录</span>");
            //           }
            //         }
            //
            //         $scope.$digest();
            //       });
        }

        //追号记录
        $scope.chaseNumber = function (type) {
            yikeYbc.chaseNumber(type, token)
                .then(function (data) {
                });
        };
        //撤销投注订单
        $scope.cancelOrder = function (id) {
            //play.cozyTip("<span>你确定要撤销该投注？</span>");
            yikeYbc.cancelOrder(token, id)
                .then(function (data) {
                    if (data.status == 1) {
                        console.log($scope.cancelStatus);
                        play.cozyTip("<span>撤销订单成功</span>");
                        $scope.$digest();
                        record();
                    }
                });

        };

        //账变记录

        //账变类型
        vm.accountType = [
            {
                name: '充值账变',
                value: 0
            },
            {
                name: '提现账变',
                value: 1
            },
            {
                name: '投注账变',
                value: 2
            },
            {
                name: '奖金账变',
                value: 3
            },
            {
                name: '反水账变',
                value: 4
            },
            {
                name: '团队赚水',
                value: 5
            },
            {
                name: '活动礼金',
                value: 6
            }
        ];
        //账变查询|| 分页
        //默认页数
        $scope.defaultPages = 1;
        $scope.currentPage = 1;
        $scope.changeBill = changeBill;
        function changeBill() {
            yikeYbc.AccountChange(token, $scope.defaultPages)
                .then(function (data) {
                    if (data.status == 1) {

                        $scope.variablsts = data.status;

                        $scope.variableData = data.result.result;

                        //总条数
                        $scope.totalNumber = data.result.total;
                        //总页数
                        $scope.totalPage = Math.ceil($scope.totalNumber / 10);

                        //上一页
                        $scope.pageUp = function () {
                            if ($scope.defaultPages > 1 || $scope.currentPage > 1) {
                                $scope.defaultPages--;
                                $scope.currentPage--;
                                changeBill();
                            }

                        };
                        //下一页
                        $scope.pageDown = function () {
                            if ($scope.defaultPages < $scope.totalPage && $scope.currentPage < $scope.totalPage) {
                                $scope.defaultPages++;
                                $scope.currentPage++;
                                changeBill();
                            }
                        };
                        //goPage
                        $scope.goPages = function () {
                            if ($scope.currentPage >= 1 && $scope.currentPage <= $scope.totalPage) {
                                $scope.defaultPages = $scope.currentPage;
                                changeBill($scope.currentPage);
                            }
                        };

                    } else {
                        $scope.sts1 = data.status;
                        $scope.nullData1 = data.result.result;
                    }
                    $scope.$digest();
                });
        }


        //取款记录
        $scope.withdrawals = function () {
            yikeYbc.withdrawals(token, 1)
                .then(function (data) {
                });
        }
    }
})();



