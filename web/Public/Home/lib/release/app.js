// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'home.module', 'yike'])

    .run(function ($ionicPlatform, $rootScope, $yikeUtils) {
        window.toast = $yikeUtils.toast;
        $ionicPlatform.ready(function () {
            $rootScope.TOKEN = TOKEN;
            window.token = TOKEN;
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/an gular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        // setup an abstract state for the tabs directive
            .state('home', {
                url: '/home',
                controller: 'HomeCtrl',
                templateUrl: 'templates/home.html',
                cache: false
            })

            // Each tab has its own nav history stack:
            /*活动页*/
            .state('active', {
                url: '/active',
                controller: 'ActiveCtrl',
                templateUrl: 'templates/active.html',
                cache: false
            })
            /*幸运28*/
            .state('luck28', {
                url: '/luck28',
                controller: 'LuckCtrl',
                templateUrl: 'templates/luck28.html',
                cache: false
            })
            /*彩票页*/
            .state('lottery', {
                url: '/lottery/:cp/:wf',
                controller: 'LotteryCtrl',
                templateUrl: 'templates/lottery.html',
                cache: false
            });


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home')
    });

/**
 * Created by NicoleQi on 2016/12/10.
 */
(function () {
    'use strict';

    angular
        .module('lottery.controller', [])
        .controller('LotteryCtrl', LotteryCtrl);
    LotteryCtrl.$inject = ['$scope', '$yikeUtils', '$state', '$ionicModal'];
    /* @ngInject */
    function LotteryCtrl($scope, $yikeUtils, $state, $ionicModal) {
        if (!TOKEN) window.location.href = window.location.protocol + "//" + window.location.host + '/login.html';

        $scope.$on('$ionicView.beforeLeave', function () {
            typeof($scope.timerId) != 'undefined' && clearInterval($scope.timerId);
        });

        $scope.$watch('data.multiple', function () {
            var multiple;
            if (typeof($scope.data.multiple) == 'undefined') return;
            try {
                multiple = parseInt($scope.data.multiple, 10);
                if (multiple < 1) {
                    multiple = 1;
                }
                $scope.data.multiple = multiple;
                $scope.$$phase || $scope.$apply();
            } catch (ex) {
                $scope.data.multiple = 1;
                $scope.$$phase || $scope.$apply();

                $yikeUtils.toast('请输入整数');
                return false;
            }
            calc();
        });

        var betWaitIng = false;
        var cpId = $state.params.cp,
            wfId = $state.params.wf,
            token = TOKEN;
        var heigh_rebeat = 8.5;
        var baseLen = 0, checkList = [];
        var playMethod = 1;
        var rx2 = [
                '120002', '120001', '120038',
                '120004', '120003', '120039'
            ],
            rx3 = [
                '130002', '130001', '130038', '130042', '130041', '130044',
                '130043', '130030', '130039'
            ],
            rx4 = [
                '140002', '140001',
                '140041', '140042', '140043', '140044'
            ];

        $scope.wfListStatus = false; //玩法是否隐藏
        $scope.data = {cpId: cpId, wfId: wfId, multiple: 1};
        $scope.wf = {};
        $scope.winning = {
            status: false,
            winTitle: '',
            title: '',
            close: function () {
                $scope.winning.status = false;
            }
        };
        $scope.bet = {
            perAmount: 2,
            betList: [],
            count: 0,
            money: 0,
            status: false,
            betSucStatus: false,
            betSucClose: function (clear) {
                if (clear) {
                    $scope.bet.clear();
                }
                $scope.bet.betSucStatus = false;
            },
            clear: function () {
                if ($scope.bet.betList.length < 1) {
                    $scope.winning.title = '您还没有投注内容！';
                    $scope.winning.status = true;
                    return;
                }
                $scope.bet.betList = [];
                $scope.bet.count = 0;
                $scope.bet.money = 0;
            },
            sucData: ''

        }
        $scope.chaseNum = {
            index: 2,
            changeIndex: function (index) {
                $scope.chaseNum.index = index;
                $scope.chaseNum.gen();
            },
            status: false,
            chaseNumOpen: function () {
                if ($scope.bet.betList.length == 0) {
                    $scope.winning.title = '请选择追号内容！';
                    $scope.winning.status = true;
                    return;
                }
                $scope.chaseNum.gen();
                $scope.chaseNum.status = true;
            },
            chaseNumClose: function () {
                $scope.chaseNum.status = false;
                $scope.chaseNum.issues = [];
                $scope.chaseNum.checkedCount = 0;
                $scope.chaseNum.totalMoney = 0;
            },
            count: 10,
            multiple: 1,
            issues: [],
            gen: function () {
                $scope.chaseNum.issues = [];
                $scope.chaseNum.checkedCount = 0;
                $scope.chaseNum.totalMoney = 0;
                for (var i = 0, l = $scope.chaseNum.count; i < l; i++) {
                    var item = {
                        checked: false,
                        issue: i,
                        time: i,
                    }
                    if ($scope.chaseNum.index == 2) {
                        item['multiple'] = $scope.chaseNum.multiple;
                        item['money'] = item['multiple'] * 2 * $scope.bet.count;
                    } else if ($scope.chaseNum.index == 3) {
                        item['multiple'] = Math.pow($scope.chaseNum.multiple, i);
                        item['money'] = item['multiple'] * 2 * $scope.bet.count;
                    }
                    $scope.chaseNum.issues.push(item);
                }
            },
            checkItem: function (item) {
                item.checked != item.checked;
                $scope.chaseNum.checkedCount = item.checked ? $scope.chaseNum.checkedCount + 1 : $scope.chaseNum.checkedCount - 1;
                $scope.chaseNum.totalMoney = item.checked ? $scope.chaseNum.totalMoney += item.money : $scope.chaseNum.totalMoney -= item.money;
            },
            checkedCount: 0,
            totalMoney: 0,
            stop: false,
            submit: function () {
                if ($scope.chaseNum.checkedCount < 1) {
                    $scope.winning.title = '请勾选追号内容！';
                    $scope.winning.status = true;
                    return;
                }
                var data = [];
                var traceInfo = [];
                for (var i = 0, l = $scope.chaseNum.issues.length; i < l; i++) {
                    if ($scope.chaseNum.issues[i].checked) {
                        var item = {
                            periods_num: $scope.chaseNum.issues[i].issue,
                            bet_money: $scope.chaseNum.issues[i].money,
                            multiple: $scope.chaseNum.issues[i].multiple
                        };
                        traceInfo.push(item);
                    }
                }
                for (var i = 0, l = $scope.bet.betList.length; i < l; i++) {
                    var item = {
                        play_id: wfId,
                        lottery: $scope.lotteryId,
                        data: $scope.bet.betList[i].num,
                        play: $scope.playTitle,
                        play_name: $scope.playTitleName,
                        rebate_count: $scope.bet.betList[i].rebeat.key,
                        lottery_name: $scope.lotteryName,
                        win_stop: $scope.chaseNum.stop ? 1 : 0,
                        trace_info: traceInfo
                    }
                    data.push(item);
                }
                var params = {
                    token: token,
                    data: JSON.stringify(data)
                }
                yikeYbc.followBet(params).then(function (res) {
                    if (res.status == 1) {
                        $scope.chaseNum.status = false;
                        $scope.chaseNum.sucData = res.result;
                        $scope.chaseNum.sucStatus = true;
                        $scope.$$phase || $scope.$apply();
                    } else {
                        $scope.winning.title = '追号失败！';
                        $scope.winning.status = true;
                        return;
                    }
                }, function (err) {
                    $scope.winning.title = '追号失败！';
                    $scope.winning.status = true;
                    return;
                });
            },
            sucStatus: false,
            sucData: '',
            openSucWin: function () {
                $scope.chaseNum.sucStatus = true;
            },
            closeSucWin: function (clear) {
                if (clear) {
                    $scope.bet.clear();
                }
                $scope.chaseNum.sucStatus = false;
            }
        }
        $scope.fsgreenNum = 0;
        $scope.openDataStatus = true;
        $scope.wfTimeStart = 0;
        $scope.reIndex = 2;

        $scope.toggle = toggle;
        $scope.da = da;
        $scope.xiao = xiao;
        $scope.dan = dan;
        $scope.shuang = shuang;
        $scope.qing = qing;
        $scope.quan = quan;
        $scope.doBet = doBet;
        $scope.ConfirmationBet = ConfirmationBet;
        $scope.calc = calc;
        $scope.playKinds = playKinds;
        $scope.selectPlayType = selectPlayType;
        $scope.playChoseName = playChoseName;
        $scope.BettingRecord = BettingRecord;
        $scope.checkBoxChange = function (pos) {
            $scope.rxwf[pos] = !$scope.rxwf[pos];
            calc($scope.data.wf.type);
        };
        //改变玩法列表状态
        $scope.changeWfListStatus = function (status) {
            $scope.wfListStatus = status;
        };

        //选择玩法
        $scope.selectWf = function (item, title) {
            wfId = item.id;
            $scope.data.wfId = item.id;
            $scope.playTitle = $scope.playTitlePre;
            $scope.playTitleName = title;
            $scope.wf['name'] = item.title;
            $scope.wf['id'] = item.id;
            $scope.wf['help'] = item.help;
            $scope.wfListStatus = false;
            $scope.data.wf = item;
            render();
        };

        $scope.addBasket = function () {
            if (typeof($scope.data.total) === 'undefined' || $scope.data.total < 1) {
                $scope.winning.title = '请选择投注内容';
                $scope.winning.status = true;
                return;
            }
            var number = addCp();
            var betMoney = $scope.data.total * $scope.bet.perAmount * ($scope.data.multiple || 1);
            var item = {
                name: $scope.wf['name'],
                num: number,
                count: $scope.data.total,
                multiple: $scope.data.multiple || 1,
                money: betMoney,
                rebeat: {
                    key: $scope.rebeat.key,
                    money: $scope.rebeat.lists[$scope.rebeat.key].money,
                    per: $scope.rebeat.lists[$scope.rebeat.key].per
                }
            }
            $scope.bet.betList.push(item);
            $scope.bet.count += parseInt($scope.data.total);
            $scope.bet.money += betMoney;
            $scope.data.total = 0;
            for (var i = 0, l = $scope.data.rows.length; i < l; i++) {
                AV._.each($scope.data.rows[i].nums, function (num) {
                    num.checked = false;
                });
            }
        }

        $scope.deleteBetItem = function (item) {
            var index = $scope.bet.betList.indexOf(item);
            $scope.bet.betList.splice(index, 1);
            $scope.bet.count -= item.count;
            $scope.bet.money -= item.money;
        }
        $scope.doubleMultiple = function () {
            /*$scope.addMultipleShow = true;
             setTimeout(function(){
             $scope.addMultipleShow = false;
             }, 500);*/
            if (typeof $scope.data.multiple === 'undefined') {
                $scope.data.multiple = 2;
            } else {
                $scope.data.multiple *= 2;
            }
        }
        $scope.changeMultiple = function (index) {
            if (typeof $scope.data.multiple === 'undefined') {
                $scope.data.multiple = 1;
            } else {
                if (index == 1) {
                    $scope.data.multiple += 1;
                } else {
                    if ($scope.data.multiple - 1 == 0) return;
                    $scope.data.multiple -= 1;
                }
            }
        }

        //机选
        $scope.random = function (num) {
            var result = $lottery_bet_random.create_bonus_bet_num(cpId, wfId, num);
            if (result.type == 'select') {
                AV._.each($scope.data.rows, function (item) {
                    qing(item.nums);
                });
                if (result.ls && result.ls.length && result.ls[0]) {
                    AV._.each(result.ls[0].value, function (item, index) {
                        AV._.each(item, function (val) {
                            if ($scope.data.rows[index].nums[0].num == 1) {
                                toggle($scope.data.rows[index].nums[val - 1]);
                            } else {
                                toggle($scope.data.rows[index].nums[val]);
                            }
                        })

                    });
                }
            } else if (result.type == 'input') {
                $scope.data.input = '';
                $scope.data.input = result.ls[0].value[0].join('');
                calc('input');
            }

        }

        $scope.openBetModal = function () {
            if (typeof($scope.data.total) === 'undefined' && $scope.bet.betList.length == 0 || $scope.data.total < 1 && $scope.bet.betList.length == 0) {
                $scope.winning.title = '请选择投注内容';
                $scope.winning.status = true;
                return;
            }
            if ($scope.data.total > 0) $scope.addBasket();
            $scope.bet.status = true;
        };
        $scope.closeBetModal = function () {
            $scope.bet.status = false;
            $scope.$$phase || $scope.$digest();
        };

        init();

        function init() {
            getLotteryMenuList();
            BettingRecord($scope.reIndex);
            initOpenData();
        }

        //渲染数据
        function range(begin, end) {
            var _range = [];
            for (var i = begin; i < end + 1; i++) {
                _range.push({
                    num: i,
                    checked: false
                });
            }
            return _range;
        }

        function getLotteryMenuList() {
            /*彩票游戏彩种列表*/
            yikeYbc.lotteryMenuList().then(function (data) {
                $scope.lotteryList = data.result.result;
                $scope.lotteryHot = data.result.hot;

                //初始化彩种列表类型的值
                for (var i = 0, l = $scope.lotteryHot.length; i < l; i++) {
                    if ($scope.lotteryHot[i].lottery_id == cpId) {
                        $scope.playTypes = $scope.lotteryHot[i].play;
                        $scope.playTitle = $scope.lotteryHot[i].play[0].title;
                        //初始化彩种类型下面玩法的值
                        $scope.lotteryId = $scope.lotteryHot[i].id;
                        $scope.lotteryName = $scope.lotteryHot[i].name;
                        //初始化彩票玩法类型
                        $scope.playName = $scope.lotteryHot[i].play[0].title;
                        break;
                    }
                }
                yikeYbc.lotteryPlayChose($scope.lotteryId, $scope.playName).then(function (data) {
                    $scope.teamList = data.result.result;
                    $scope.playTitleName = $scope.teamList[0].title;
                    $scope.wf['name'] = $scope.teamList[0].row[0].title;
                    wfId = $scope.teamList[0].row[0].id;
                    $scope.data.wfId = wfId;
                    $scope.wf['id'] = $scope.teamList[0].row[0].id;
                    $scope.wf['help'] = $scope.teamList[0].row[0].help;
                    $scope.data.wf = $scope.teamList[0].row[0];
                    initRebeat();
                    render();
                    changeLottery();
                });
            });
        }

        function initRebeat() {
            var rebeat = $scope.data.wf.param.data[0],
                bonus = rebeat.bonus,
                cvMoney = rebeat.convert_money,
                cvCount = rebeat.convert;
            $scope.rebeat = {
                key: 0,
            };
            var lists = [];
            for (var i = 0; i <= cvCount; i++) {
                var item = {
                    key: i,
                    money: i * cvMoney + parseInt(bonus),
                    per: (heigh_rebeat - 0.1 * i).toFixed(2)
                }
                lists.push(item);
            }
            $scope.rebeat.lists = lists;
        }

        function initOpenData() {
            var timeStart = Date.now();
            yikeYbc.openLotteryData({cpId: cpId, token: token}).then(function (res) {
                if (res.status == 1) {
                    if (res.result.now.difference_time > 0) {
                        typeof($scope.timerId) != 'undefined' && clearInterval($scope.timerId);
                    } else {
                        if (typeof($scope.timerId) == 'undefined') {
                            $scope.timerId = setInterval(function () {
                                initOpenData();
                            }, 5000);
                        }
                        return;
                    }
                    $scope.openDataStatus = false;
                    var timeEnd = Date.now();
                    initTimer(res.result.now.difference_time - parseInt((timeEnd - timeStart) / 1000));
                    $scope.openData = {
                        record: []
                    };
                    for (var i = 0, l = res.result.result.length; i < l; i++) {
                        var data = [];
                        for (var j = 0, jl = res.result.result[i].data.length; j < jl; j++) {
                            data.push({index: j, num: res.result.result[i].data.charAt(j)});
                        }
                        var item = {
                            periods: res.result.result[i].periods,
                            data: data
                        };
                        $scope.openData.record.push(item);
                    }
                }
            }, function (err) {
            });
        }

        //initOpenData();
        function zero(n) {
            var n = parseInt(n, 10);
            if (n > 0) {
                if (n <= 9) {
                    n = "0" + n;
                }
                return String(n);
            } else {
                return "00";
            }
        };
        function initTimer(time) {
            var time = time;
            $scope.timerId = setInterval(function () {
                time -= 1;
                updateTimer(time);
            }, 1000);
        }

        function updateTimer(dur) {
            if (dur < 0) {
                if ((0 - dur % 5) == 0) {
                    initOpenData();
                }
                return;
            }
            if (dur == 0) $scope.openDataStatus = true;
            var pms = {
                day: "00",
                month: "00",
                year: "0"
            };
            if (dur >= 0) {
                var sec = zero(dur % 60);
                pms.sec = {
                    shi: parseInt(sec / 10),
                    ge: sec % 10
                }
                //pms.sec = zero(dur % 60);
                var mini = Math.floor((dur / 60)) > 0 ? Math.floor((dur / 60)) % 60 : 0;
                pms.mini = {
                    shi: parseInt(mini / 10),
                    ge: mini % 10
                }
                //pms.mini = Math.floor((dur / 60)) > 0 ? zero(Math.floor((dur / 60)) % 60) : "00";
                var hour = Math.floor((dur / 3600)) > 0 ? Math.floor((dur / 3600)) % 24 : 0;
                pms.hour = {
                    shi: parseInt(hour / 10),
                    ge: hour % 10
                }
                //pms.hour = Math.floor((dur / 3600)) > 0 ? zero(Math.floor((dur / 3600)) % 24) : 0;

                pms.day = Math.floor((dur / 86400)) > 0 ? zero(Math.floor((dur / 86400)) % 30) : "00";
                //月份，以实际平均每月秒数计算
                pms.month = Math.floor((dur / 2629744)) > 0 ? zero(Math.floor((dur / 2629744)) % 12) : "00";
                //年份，按按回归年365天5时48分46秒算
                pms.year = Math.floor((dur / 31556926)) > 0 ? Math.floor((dur / 31556926)) : "0";
            }
            $scope.pms = pms;
            $scope.$$phase || $scope.$digest();
        }

        //绘制彩种玩法种类
        function playKinds(item) {
            if (item.lottery_id == cpId) return;
            $scope.lotteryId = item.id;
            clearInterval($scope.timerId)
            $scope.openDataStatus = true;
            cpId = item.lottery_id;
            $scope.data.cpId = item.lottery_id;
            initOpenData();
            yikeYbc.lotteryPlayChose($scope.lotteryId, item.name).then(function (data) {
                $scope.teamList = data.result.result;
                $scope.wf['name'] = $scope.teamList[0].row[0].title;
                wfId = $scope.teamList[0].row[0].id;
                $scope.data.wfId = wfId;
                $scope.wf['id'] = $scope.teamList[0].row[0].id;
                $scope.wf['help'] = $scope.teamList[0].row[0].help;
                $scope.data.wf = $scope.teamList[0].row[0];
                render();
            });
        }

        //选择具体彩票类型
        function selectPlayType(lotteryName) {
            $scope.playTypes = lotteryName.play;
        }

        //绘制彩票玩法选择
        function playChoseName(name) {
            var timeStart = Date.now();
            $scope.wfTimeStart = timeStart;
            yikeYbc.lotteryPlayChose($scope.lotteryId, name).then(function (data) {
                if ($scope.wfTimeStart != timeStart) return;
                $scope.playTitlePre = name;
                $scope.wfListStatus = true;
                $scope.teamList = data.result.result;
                $scope.$digest();
            })
        }

        //投注记录
        function BettingRecord(type) {
            $scope.reIndex = type;
            yikeYbc.BettingRecord(token, type)
                .then(function (data) {
                    console.log(data);
                    if (type == 1) {
                        $scope.betRecord = data.result.result;
                        $scope.isOpen = $scope.betRecord[0].is_open;
                        $scope.isWin = $scope.betRecord[0].is_win;
                    } else if (type == 2) {
                        $scope.followRecord = data.result.result;
                    }
                    $scope.$$phase || $scope.$digest();
                });
        }

        function tuodan(num) {
            var tuoduan = ['43', '49', '51', '53', '56', '58', '60', '47', '41'];
            if (tuoduan.indexOf(wfId) != -1 && $scope.data.betNum && !num.checked) {
                var islive = true;
                var toudan_betNum = $scope.data.betNum.split("-");
                for (var i = 0, l = toudan_betNum.length; i < l; i++) {
                    toudan_betNum[i] = toudan_betNum[i].split(',');
                    if (toudan_betNum[i].indexOf(num.num + "") != -1) {
                        islive = false;
                    }
                }
                return islive;

            } else {
                return true;
            }
        }

        function quan(nums, index) {
            $scope.fsgreenNum = 1;
            $scope.fsindexNum = index;
            AV._.each(nums, function (num) {
                num.checked = tuodan(num);
            });
            calc('select');
        }

        function da(nums, index) {
            $scope.fsgreenNum = 2;
            $scope.fsindexNum = index;
            AV._.each(nums, function (num, index) {
                index >= nums.length / 2 ? num.checked = tuodan(num) : num.checked = false;
            });
            calc('select');
        }

        function xiao(nums, index) {
            $scope.fsgreenNum = 3;
            $scope.fsindexNum = index;
            AV._.each(nums, function (num, index) {
                index < nums.length / 2 ? num.checked = tuodan(num) : num.checked = false;
            });
            calc('select');
        }

        function dan(nums, index) {
            $scope.fsgreenNum = 4;
            $scope.fsindexNum = index;
            AV._.each(nums, function (num) {
                parseInt(num.num) % 2 != 0 ? num.checked = tuodan(num) : num.checked = false;
            });
            calc('select');
        }

        function shuang(nums, index) {
            $scope.fsgreenNum = 5;
            $scope.fsindexNum = index;
            AV._.each(nums, function (num) {
                parseInt(num.num) % 2 == 0 ? num.checked = tuodan(num) : num.checked = false;
            });
            calc('select');
        }

        function qing(nums, index) {
            $scope.fsgreenNum = 6;
            setTimeout(function () {
                $scope.fsgreenNum = $scope.fsgreenNum == 6 ? 7 : $scope.fsgreenNum;
            }, 1000);
            $scope.fsindexNum = index;
            /* setTimeout(function(){
             $scope.fsgreenNum = 0;
             }, 2000);*/
            AV._.each(nums, function (num) {
                num.checked = false;
            });
            calc('select');
        }

        function clear() {

        }

        function toggle(num) {
            if ($scope.is28 && $scope.data.total >= 1) {
                $yikeUtils.toast('该彩种一次只能一注哦!');
                return;
            }
            $scope.fsgreenNum = 0;
            var tuoduan = ['43', '49', '51', '53', '56', '58'];
            if (tuoduan.indexOf(wfId) != -1 && $scope.data.betNum && !num.checked) {
                var toudan_betNum = $scope.data.betNum.split("-");

                for (var i = 0, l = toudan_betNum.length; i < l; i++) {
                    toudan_betNum[i] = toudan_betNum[i].split(',');
                    if (toudan_betNum[i].indexOf(num.num + "") != -1) {
                        $yikeUtils.toast('胆码和拖码不能存在相同的号码');
                        return;
                    }
                }
            }
            num.checked ? num.checked = false : num.checked = true;
            calc('select');
        }

        function get_check_input_num_arr(num_arr, base_len, num_separator, check_type) {
            //var lt_elem = $("#lt_write_del");
            //lt_elem.removeData("error_num").removeData('repeat_num').removeData('no_repeat_num');
            var error_num = [], repeat_num = [], no_repeat_num = [];
            var dictionary = LOTTERY_DETAIL['LOTTERY_' + playMethod];
            var max = dictionary['num_max'];
            var min = dictionary['num_min'];
            var arr_len = num_arr.length;
            var num_dict = {};
            for (var i = 0; i < arr_len; i++) {
                var _n = num_arr[i];
                var num = _n.split(num_separator == '' ? /\D*/g : num_separator);
                var flag = num.length == base_len;
                if (flag) {
                    for (var key in num) {
                        flag = num[key] <= max && num[key] >= min;
                        if (!flag) break;
                    }
                }
                if (flag) {
                    if (check_type == 1) {
                        flag = check_input_num_no_repeat(num);
                    }
                    else if (check_type == 2) {
                        flag = check_input_num_repeat(num);
                    }
                    else if (check_type == 3) {
                        flag = check_input_num_no_all_repeat(num);
                    }
                    else if (check_type == 4) {
                        flag = check_input_num_repeat(num);
                        if (flag) flag = check_input_num_no_all_repeat(num);
                    }
                }
                if (!flag) {
                    error_num[error_num.length] = num.join(num_separator);
                    num_arr.splice(i, 1);
                    arr_len--;
                    i--;
                }
                else {
                    if (_n in num_dict) {
                        repeat_num[repeat_num.length] = '' + _n;
                    }
                    else {
                        num_dict[_n] = '';
                        no_repeat_num[no_repeat_num.length] = '' + _n;
                    }
                }
            }
            //lt_elem.data("error_num", error_num).data('repeat_num', repeat_num).data('no_repeat_num', no_repeat_num).data('right_num', num_arr);
            return num_arr;
        };

        function getInputNumArrAfterRepeace(val, numSeparator) {
            val = val.replace(/[^\n\S]+/g, " ");
            if (numSeparator == ' ') {
                val = val.replace(/[^\d\s]+|\n+/g, ",").replace(/(^[,]*)|([,]*$)/g, "")
                    .replace(/\s+[,]+\s+|\s+[,]+|[,]+\s+/g, ",");
            }
            else {
                val = val.replace(/\D+/g, ",").replace(/(^[,]*)|([,]*$)/g, "");
            }
            return val.split(",");
        }

        function getInputNumArr(val) {
            return getInputNumArrAfterRepeace(val, $scope.data.wf['calculate']['num_separator']);
        }

        function checkInputNumArr(val) {
            var wf_param = $scope.data.wf;
            var base_len = wf_param['calculate']['base_len'];
            var num_separator = wf_param['calculate']['num_separator'] == null ? '' : wf_param['calculate']['num_separator'];
            var check_type = wf_param['calculate']['check_type'];
            return get_check_input_num_arr(val, base_len, num_separator, check_type);
        }

        function calc(type) {
            if (typeof($scope.is28) != 'undefined') {
                type = 'is28';
            }
            var _calculate = $scope.data.wf.calculate;
            checkList = $('input[name="renxuan"]:checked') || [];
            baseLen = checkList.length;
            if (type == 'select') {
                var numArr = [];
                AV._.each($scope.data.rows, function (row) {
                    var _row = [];
                    AV._.each(row.nums, function (num) {
                        if (num.checked) {
                            _row.push(num.num);
                        }
                    });
                    var wfstr = String(wfId).substr(0, 4);
                    if (_row.length > 0) {
                        numArr.push(_row);
                    } else if (wfId == 9 || wfId == 400041 || wfstr == 1400 || wfstr == 1200 || wfstr == 1300) {
                        numArr.push([]);
                    }
                    /*else if (wfId == 9 || wfId == 400041) {
                     numArr.push([]);
                     }*/
                });
                if (numArr.length == $scope.data.rows.length) {
                    var total = lottery_fnc.return_bet_count(numArr, $scope.data.wfId, baseLen);
                    $scope.data.total = total;
                } else {
                    if (wfId == 9 || wfId == 400041 || wfId == 140002 || wfId == 130002 || wfId == 120002 || wfId == 400056 || wfId == 230032 || wfId == 230033 || wfId == 230034) {
                        var total = lottery_fnc.return_bet_count(numArr, $scope.data.wfId, baseLen);
                        $scope.data.total = total;
                    } else {
                        $scope.data.total = 0;
                    }
                }
                var _numArr = [];
                AV._.each(numArr, function (arr) {
                    _numArr.push(arr.join(_calculate.num_separator || ''));
                });
                $scope.data.betNum = _numArr.join(_calculate.row_separator || ',');
            } else if (type == 'input') {
                var input = $scope.data.input;
                input = getInputNumArr(input);
                input = checkInputNumArr(input);

                var total = lottery_fnc.return_bet_count(input, $scope.data.wfId, baseLen);
                if (cpId == 27 && (wfId == 400032 || wfId == 400033 || wfId == 400034 || wfId == 400035)) {
                    var list = [];
                    AV._.each(input, function (item) {
                        list.push(item.split(' ').join(','));
                    });
                    input = list;
                }
                $scope.data.total = total;
                $scope.data.betNum = input;
            } else if (type == 'is28') {
                if (wfId != '600004') {
                    var numArr = [];
                    AV._.each($scope.data.rows, function (row) {
                        var _row = [];
                        AV._.each(row.nums, function (num) {
                            if (num.checked) {
                                numArr.push(num.num);
                            } else {
                                var index = numArr.indexOf(num.num);
                                if (index != -1) {
                                    numArr.splice(index, 1);
                                }
                            }
                        });
                    });
                    if (numArr.length > 0) {
                        var total = numArr.length;
                        $scope.data.total = total;
                    }
                    var _numArr = numArr.join(_calculate.row_separator || ',');
                    $scope.data.betNum = _numArr;
                } else {
                    var numArr = [];
                    AV._.each($scope.data.rows, function (row) {
                        var _row = [];
                        AV._.each(row.nums, function (num) {
                            if (num.checked) {
                                numArr.push(num.num);
                            } else {
                                var index = numArr.indexOf(num.num);
                                if (index != -1) {
                                    numArr.splice(index, 1);
                                }
                            }
                        });
                    });
                    $scope.data.total = 1;
                    var _numArr = numArr.join(_calculate.row_separator || ',');
                    $scope.data.betNum = _numArr;
                }
            }
            getSelectNum();
            $scope.$$phase || $scope.$apply();
        }

        function getSelectNum() {
            if ($scope.data.betNum) {
                $scope.selectNumStr = $scope.data.betNum.toString();
            }
            if (wfId == '600002') {
                var betArr = $scope.data.betNum.split(',');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (parseInt(bet)) {
                        case 0:
                            name += '大';
                            break;
                        case 1:
                            name += '小';
                            break;
                        case 2:
                            name += '单';
                            break;
                        case 3:
                            name += '双';
                            break;
                    }
                });
                $scope.selectNumStr = name;
            } else if (wfId == '600003') {
                var betArr = $scope.data.betNum.split(',');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (parseInt(bet)) {
                        case 0:
                            name += '红';
                            break;
                        case 1:
                            name += '绿';
                            break;
                        case 2:
                            name += '蓝';
                            break;
                    }
                });
                $scope.selectNumStr = name;
            } else if (wfId == '600004') {

            } else if (wfId == '600005') {
                var betArr = $scope.data.betNum.split(',');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (parseInt(bet)) {
                        case 0:
                            name += '豹子(8, 8, 8)';
                            break;
                    }
                });
                $scope.selectNumStr = name;
            } else if (wfId == '600006') {
                var betArr = $scope.data.betNum.split(',');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (parseInt(bet)) {
                        case 0:
                            name += '大单';
                            break;
                        case 1:
                            name += '小单';
                            break;
                        case 2:
                            name += '大双';
                            break;
                        case 3:
                            name += '小双';
                            break;
                    }
                });
                $scope.selectNumStr = name
            } else if (wfId == '600007') {
                var betArr = $scope.data.betNum.split(',');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (parseInt(bet)) {
                        case 0:
                            name += '极大';
                            break;
                        case 1:
                            name += '极小';
                            break;
                    }
                });
                $scope.selectNumStr = name;
            } else if (wfId == '400056') {
                if (!$scope.data.betNum) return;
                var betArr = $scope.data.betNum.split(',');
                var name = '';

                var keys = [];
                AV._.each($scope.data.pk_lhd_num, function (item, index) {
                    keys.push(index);
                });
                AV._.each(betArr, function (bet) {
                    name += keys[bet];
                });
                $scope.selectNumStr = name;
            } else if (wfId == '230032') {
                if (!$scope.data.betNum) return;
                $scope.data.betNum = $scope.data.betNum.split(',').join('$');
                var betArr = $scope.data.betNum.split('$');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (bet) {
                        case '000':
                            name += '小小小,';
                            break;
                        case '001':
                            name += '小小大,';
                            break;
                        case '010':
                            name += '小大小,';
                            break;
                        case '011':
                            name += '小大大,';
                            break;
                        case '100':
                            name += '大小小,';
                            break;
                        case '101':
                            name += '大小大,';
                            break;
                        case '110':
                            name += '大大小,';
                            break;
                        case '111':
                            name += '大大大,';
                            break;
                    }
                });
                $scope.selectNumStr = name.slice(0, name.length - 1);
            } else if (wfId == '230033') {
                if (!$scope.data.betNum) return;
                $scope.data.betNum = $scope.data.betNum.split(',').join('$');
                var betArr = $scope.data.betNum.split('$');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (bet) {
                        case '000':
                            name += '质质质,';
                            break;
                        case '001':
                            name += '质质合,';
                            break;
                        case '010':
                            name += '质合质,';
                            break;
                        case '011':
                            name += '质合合';
                            break;
                        case '100':
                            name += '合质质,';
                            break;
                        case '101':
                            name += '合质合,';
                            break;
                        case '110':
                            name += '合合质,';
                            break;
                        case '111':
                            name += '合合合,';
                            break;
                    }
                });
                $scope.selectNumStr = name.slice(0, name.length - 1);
            } else if (wfId == '230034') {
                if (!$scope.data.betNum) return;
                $scope.data.betNum = $scope.data.betNum.split(',').join('$');
                var betArr = $scope.data.betNum.split('$');
                var name = '';
                AV._.each(betArr, function (bet) {
                    switch (bet) {
                        case '111':
                            name += '奇奇奇,';
                            break;
                        case '110':
                            name += '奇奇偶,';
                            break;
                        case '101':
                            name += '奇偶奇,';
                            break;
                        case '100':
                            name += '奇偶偶,';
                            break;
                        case '011':
                            name += '偶奇奇,';
                            break;
                        case '010':
                            name += '偶奇偶,';
                            break;
                        case '001':
                            name += '偶偶奇,';
                            break;
                        case '000':
                            name += '偶偶偶,';
                            break;
                    }
                });
                $scope.selectNumStr = name.slice(0, name.length - 1);
            }
        }

        function render() {
            //try {
            //这里可以优化一下
            var wf = $scope.data.wf;
            $scope.data.baseLen = 2;
            if (AV._.indexOf(rx2, wfId) != -1) {
                $scope.rxwf = {
                    wan: false,
                    qian: false,
                    bai: false,
                    shi: true,
                    ge: true,
                };
                $scope.data.baseLen = 2;
            }
            if (AV._.indexOf(rx3, wfId) != -1) {
                $scope.rxwf = {
                    wan: false,
                    qian: false,
                    bai: true,
                    shi: true,
                    ge: true,
                };
                $scope.data.baseLen = 3;
            }
            if (AV._.indexOf(rx4, wfId) != -1) {
                $scope.rxwf = {
                    wan: false,
                    qian: true,
                    bai: true,
                    shi: true,
                    ge: true,
                };
                $scope.data.baseLen = 4;
            }
            //$scope.data.slides = AV._.flatten(item.row);
            //var initialSlide = AV._.indexOf($scope.data.slides, $scope.data.wfId);
            var rows = [];
            if (wf.param.cs == 'dx_ds') {
                AV._.each(wf.param.titles, function (title) {
                    var row = {
                        title: title,
                        nums: [
                            {num: '大', checked: false},
                            {num: '小', checked: false},
                            {num: '单', checked: false},
                            {num: '双', checked: false},
                        ]
                    };
                    rows.push(row);
                });
            } else if (wf.param.cs == 'eleven_five_dds') {
                AV._.each(wf.param.titles, function (title) {
                    var row = {
                        title: title,
                        nums: [
                            {num: '5单', checked: false},
                            {num: '4单', checked: false},
                            {num: '3单', checked: false},
                            {num: '2单', checked: false},
                            {num: '1单', checked: false},
                            {num: '0单', checked: false}
                        ]
                    };
                    rows.push(row);
                });
            } else if (wf.param.cs == 'fc_spice_012') {
                AV._.each(wf.param.titles, function (title) {
                    var row = {
                        title: title,
                        nums: [
                            {num: title + '00', checked: false},
                            {num: title + '01', checked: false},
                            {num: title + '02', checked: false},
                            {num: title + '10', checked: false},
                            {num: title + '11', checked: false},
                            {num: title + '12', checked: false},
                            {num: title + '20', checked: false},
                            {num: title + '21', checked: false},
                            {num: title + '22', checked: false}
                        ]
                    };
                    rows.push(row);
                });
            } else if (wfId == '500012' || wfId == '500013') {
                AV._.each(wf.param.titles, function (title) {
                    var row = {
                        title: title,
                        nums: [
                            {num: '通', checked: false}
                        ]
                    };
                    rows.push(row);
                });
            } else if (wf.param.cs == 'ks_et_bz') {
                AV._.each(wf.param.titles, function (title) {
                    if (title == '二同号') {
                        var row = {
                            title: title,
                            nums: [
                                {num: '11', checked: false},
                                {num: '22', checked: false},
                                {num: '33', checked: false},
                                {num: '44', checked: false},
                                {num: '55', checked: false},
                                {num: '66', checked: false}
                            ]
                        };
                    }
                    if (title == '不同号') {
                        var row = {
                            title: title,
                            nums: [
                                {num: '1', checked: false},
                                {num: '2', checked: false},
                                {num: '3', checked: false},
                                {num: '4', checked: false},
                                {num: '5', checked: false},
                                {num: '6', checked: false}
                            ]
                        };
                    }
                    rows.push(row);
                });
            } else if (typeof(wf.special) != 'undefined' && wf.special) {
                if ($scope.rooms) {
                    for (var i = 0, l = $scope.data.rows.length; i < l; i++) {
                        for (var i2 = 0, l2 = $scope.data.rows[i].nums.length; i2 < l2; i2++) {
                            $scope.data.rows[i].nums[i2].checked = false;
                        }
                    }

                    calc('is28');
                    return;
                }
                gp.lottery.find_lottery_bet_limit({lottery_id: cpId}, function (rs) {
                    if (rs.success == 1) {
                        $scope.rooms = rs.data.detail;
                        $scope.checkedRoom = rs.data.detail[0];
                        $rootScope.checkedRoom = $scope.checkedRoom;
                        $scope.data.betMoney = $scope.checkedRoom.min_bet;
                        $scope.data.unit = 1;
                        elocalStorage.setObject('unit_type', 1);
                        $scope.get28betInfo = function (data) {
                            var row = {};
                            AV._.each(data, function (item) {
                                if (item.WF_ID == wfId) {
                                    var odds = JSON.parse(item.ODDS);
                                    if (wfId == '600001') {
                                        row = {
                                            title: wf.title,
                                            nums: [
                                                {num: '0', checked: false, betRebeat: odds[0]},
                                                {num: '1', checked: false, betRebeat: odds[1]},
                                                {num: '2', checked: false, betRebeat: odds[2]},
                                                {num: '3', checked: false, betRebeat: odds[3]},
                                                {num: '4', checked: false, betRebeat: odds[4]},
                                                {num: '5', checked: false, betRebeat: odds[5]},
                                                {num: '6', checked: false, betRebeat: odds[6]},
                                                {num: '7', checked: false, betRebeat: odds[7]},
                                                {num: '8', checked: false, betRebeat: odds[8]},
                                                {num: '9', checked: false, betRebeat: odds[9]},
                                                {num: '10', checked: false, betRebeat: odds[10]},
                                                {num: '11', checked: false, betRebeat: odds[11]},
                                                {num: '12', checked: false, betRebeat: odds[12]},
                                                {num: '13', checked: false, betRebeat: odds[13]},
                                                {num: '14', checked: false, betRebeat: odds[14]},
                                                {num: '15', checked: false, betRebeat: odds[15]},
                                                {num: '16', checked: false, betRebeat: odds[16]},
                                                {num: '17', checked: false, betRebeat: odds[17]},
                                                {num: '18', checked: false, betRebeat: odds[18]},
                                                {num: '19', checked: false, betRebeat: odds[19]},
                                                {num: '20', checked: false, betRebeat: odds[20]},
                                                {num: '21', checked: false, betRebeat: odds[21]},
                                                {num: '22', checked: false, betRebeat: odds[22]},
                                                {num: '23', checked: false, betRebeat: odds[23]},
                                                {num: '24', checked: false, betRebeat: odds[24]},
                                                {num: '25', checked: false, betRebeat: odds[25]},
                                                {num: '26', checked: false, betRebeat: odds[26]},
                                                {num: '27', checked: false, betRebeat: odds[27]}
                                            ]
                                        };
                                    }

                                    if (wfId == '600002') {
                                        row = {
                                            title: wf.title,
                                            nums: [{num: '0', name: '大', betRebeat: odds[0], checked: false}, {
                                                num: '1',
                                                name: '小',
                                                betRebeat: odds[1],
                                                checked: false
                                            }, {num: '2', name: '单', betRebeat: odds[2], checked: false}, {
                                                num: '3',
                                                name: '双',
                                                betRebeat: odds[3],
                                                checked: false
                                            }]
                                        };
                                    } else if (wfId == '600003') {
                                        row = {
                                            title: wf.title,
                                            nums: [{num: '0', name: '红', betRebeat: odds[0], checked: false}, {
                                                num: '1',
                                                name: '绿',
                                                betRebeat: odds[1],
                                                checked: false
                                            }, {num: '2', name: '蓝', betRebeat: odds[2], checked: false}]
                                        };
                                    } else if (wfId == '600004') {
                                        $scope.baoNum = [];
                                        for (var i = 0; i < 28; i++) {
                                            var item = {id: i, value: i};
                                            $scope.baoNum.push(item);
                                        }
                                        $scope.bao1 = Math.ceil(Math.random() * 27);
                                        $scope.bao2 = Math.ceil(Math.random() * 27);
                                        $scope.bao3 = Math.ceil(Math.random() * 27);
                                        row = {
                                            title: wf.title,
                                            betRebeat: odds[0],
                                            nums: [{
                                                num: $scope.bao1,
                                                name: '特码包三',
                                                betRebeat: odds[0],
                                                checked: true
                                            }, {
                                                num: $scope.bao2,
                                                name: '特码包三',
                                                betRebeat: odds[0],
                                                checked: true
                                            }, {num: $scope.bao3, name: '特码包三', betRebeat: odds[0], checked: true}]
                                        };
                                        $scope.setBao1 = function (num) {
                                            $scope.bao1 = num;
                                            $scope.data.rows[0].nums[0].num = num;
                                            calc('is28');
                                        }
                                        $scope.setBao2 = function (num) {
                                            $scope.bao2 = num;
                                            $scope.data.rows[0].nums[1].num = num;
                                            calc('is28');
                                        }
                                        $scope.setBao3 = function (num) {
                                            $scope.bao3 = num;
                                            $scope.data.rows[0].nums[2].num = num;
                                            calc('is28');
                                        }
                                    } else if (wfId == '600005') {
                                        row = {
                                            title: wf.title,
                                            nums: [{num: '0', name: '豹子', betRebeat: odds[0], checked: false}]
                                        };
                                    } else if (wfId == '600006') {
                                        row = {
                                            title: wf.title,
                                            nums: [{
                                                num: '0',
                                                name: '大单',
                                                betRebeat: odds[0],
                                                checked: false
                                            }, {num: '1', name: '小单', betRebeat: odds[1], checked: false}, {
                                                num: '2',
                                                name: '大双',
                                                betRebeat: odds[2],
                                                checked: false
                                            }, {num: '3', name: '小双', betRebeat: odds[3], checked: false}]
                                        };
                                    } else if (wfId == '600007') {
                                        row = {
                                            title: wf.title,
                                            nums: [{
                                                num: '0',
                                                name: '极大',
                                                betRebeat: odds[0],
                                                checked: false
                                            }, {num: '1', name: '极小', betRebeat: odds[1], checked: false}]
                                        };
                                    }
                                }
                            });
                            rows.push(row);
                            if (wfId == '600004') {
                                calc('is28');
                            }
                        }
                        gp.lottery.get_odds_info({
                            lottery_id: cpId,
                            '3rd_id': $scope.checkedRoom.token
                        }, function (res) {
                            if (res.success == 1) {
                                $scope.get28betInfo(res.data.data.odds);
                            }
                            ;

                        });
                        $scope.choseCheckRoom = function (room) {
                            rows = [];
                            $scope.checkedRoom = room;
                            $scope.data.betMoney = $scope.checkedRoom.min_bet;
                            $rootScope.checkedRoom = room;
                            $yikeUtils.loadingShow('<ion-spinner icon="bubbles"></ion-spinner>');
                            gp.lottery.get_odds_info({
                                lottery_id: cpId,
                                '3rd_id': $scope.checkedRoom.token
                            }, function (res) {
                                $yikeUtils.loadingHide();
                                if (res.success == 1) {
                                    $scope.get28betInfo(res.data.data.odds);
                                    $scope.data.rows = [];
                                    $scope.data.rows = rows;
                                    $scope.data.total = 0;
                                    $scope.selectNumStr = '';
                                    $scope.showroom = false;
                                } else {
                                    $yikeUtils.toast('网络错误');
                                }
                                ;
                            });
                        }
                    } else {

                    }
                });
                $scope.is28 = true;

                $scope.choseRoom = function () {
                    $scope.showroom = !$scope.showroom;
                }
            } else {
                AV._.each(wf.param.title, function (title) {
                    var row = {
                        title: title,
                        nums: range(wf.param.start, wf.param.end)
                    };
                    rows.push(row);
                });
            }
            $scope.data.rows = rows;
            $scope.$$phase || $scope.$apply();
            //} catch (ex) {
            //}
        }

        function doBet() {
            if (betWaitIng) {
                $scope.winning.title = '彩票正在投注中！';
                $scope.winning.status = true;
                return;
            }
            betWaitIng = true;
            try {
                if (0) {
                    $yikeUtils.toast('未获取到彩票期数信息');
                } else {
                    if ($scope.data.wf.param.num_location == 'checkbox') {
                        var _val = [];
                        for (var i = 0; i < checkList.length; i++) {
                            var obj = checkList[i];
                            _val.push(obj.value);
                        }
                        number = _val.join(',') + '@' + number;
                    }
                    if (AV._.indexOf([
                            '45',
                            '320202',
                            '330301',
                            '320006',
                            '330006',
                            '340006',
                            '350006',
                            '360006',
                            '370006',
                            '380006',
                        ], wfId) != -1) {
                        number = number.split(' ').join(',');
                    }
                    var data = [];
                    for (var i = 0, l = $scope.bet.betList.length; i < l; i++) {
                        var item = {
                            play_id: wfId,
                            lottery: $scope.lotteryId,
                            data: $scope.bet.betList[i].num,
                            periods_num: 30,//$scope.openData.record[0].periods,
                            beMoney: $scope.bet.betList[i].money,
                            multiple: $scope.bet.betList[i].multiple,
                            play: $scope.playTitle,
                            play_name: $scope.playTitleName,
                            rebate_count: $scope.bet.betList[i].rebeat.key,
                            lottery_name: $scope.lotteryName,
                            type: 1
                        }
                        data.push(item);

                    }
                    var params = {
                        token: token,
                        data: JSON.stringify(data)
                    }
                    yikeYbc.doBet(params).then(function (res) {
                        betWaitIng = false;
                        if (res.status == 1) {
                            $scope.closeBetModal();
                            $scope.bet.sucData = res.result;
                            $scope.bet.betSucStatus = true;
                        } else {
                            $scope.winning.title = '购买失败！';
                            $scope.winning.status = true;
                        }
                    }, function (err) {
                        betWaitIng = false;
                    });
                }
            } catch (e) {
                betWaitIng = false;
            }
        }

        function addCp() {
            var number;
            if ($scope.data.wf.type == 'input') {
                if (wfId == '500008' || wfId == '500002') {
                    number = $scope.data.betNum[0].split('').join(',');
                } else {
                    number = $scope.data.betNum.join('$');
                }
            } else if ($scope.data.wf.param.cs == 'dx_ds') {
                number = $scope.data.betNum.replace(/大/g, '9');
                number = number.replace(/小/g, '1');
                number = number.replace(/单/g, '3');
                number = number.replace(/双/g, '2');
            } else if ($scope.data.wf.param.cs == 'eleven_five_dds') {
                number = $scope.data.betNum.replace(/5单/g, '0');
                number = number.replace(/4单/g, '1');
                number = number.replace(/3单/g, '2');
                number = number.replace(/2单/g, '3');
                number = number.replace(/1单/g, '4');
                number = number.replace(/0单/g, '5');
            } else if (wfId == '500012' || wfId == '500013') {
                number = '';
            } else if ($scope.data.wf.param.cs == 'ks_et_bz') {
                number = $scope.data.betNum.replace(/11/g, '1');
                number = number.replace(/22/g, '2');
                number = number.replace(/33/g, '3');
                number = number.replace(/44/g, '4');
                number = number.replace(/55/g, '5');
                number = number.replace(/66/g, '6');
            } else if (wfId == '230031') {
                number = $scope.data.betNum.split(',').join('$');
            } else if (wfId == '400056') {
                number = $scope.data.betNum.replace(/龙/g, '');
                number = number.replace(/虎/g, '');
            } else {
                number = $scope.data.betNum;
            }
            return number;
        }

        function ConfirmationBet() {
            if ($scope.bet.betList.length < 1) {
                $scope.winning.title = '请添加投注号码！';
                $scope.winning.status = true;
                return;
            }
            $scope.bet.status = true;
        }
    }
})();



/**
 * Created by NicoleQi on 2016/12/10.
 */
(function () {
    'use strict';

    angular
        .module('luck.controller', [])
        .controller('LuckCtrl', LuckCtrl);
    LuckCtrl.$inject = ['$scope'];
    /* @ngInject */
    function LuckCtrl($scope){
        $scope.$on('$ionicView.afterEnter', function(){
            headHover();
            choseNav();

        });
        changeCasino()
    }
})();

/**
 *延边彩
 * @param uid
 * @param url
 * @constructor
 */

function yikeYbc(url, uid) {
    this.url = url + '?i=' + uid + '&c=entry&m=yike_game';
    this.uid = uid;
    // this.openid = openid;
}

yikeYbc.prototype = {
    constructor: yikeYbc,
    /**
     * 基础查询函数
     * @param controller
     * @param action
     * @param op
     * @returns {AV.Promise}
     */
    query: function (data) {
        data.token = data.token || TOKEN;
        data.m = data.m || 'yike_game';
        var promise = new AV.Promise();
        var url = this.url;
        for (var key in data) {
            if (url != "") {
                url += "&";
            }
            url += key + "=" + [] + encodeURIComponent(data[key]);
        }
        $.ajax({
            url: url,
            dataType: 'jsonp',
            processData: false,
            type: 'get',
            success: function (data) {
                var status = data.status;
                if (status == 1) {
                    promise.resolve(data);
                } else if (status == 0) {
                    toast(data.result.result);
                    promise.reject(data);
                } else if (status == -3) {
                    toast(data.result.result);
                    location.href = '#/login';
                    return;
                }
            },
            error: function (i, data) {
                promise.reject(data);
            }
        });
        return promise;
    },
    /**
     * 首页banner
     * @returns {*|AV.Promise}
     */
    changeBanner: function () {
        return this.query({
            do: 'banner',
            m: 'yike_game',
            play_id: 1,
            op: 'index'
        });
    },
    /**
     * 首页通知公告列表
     * prams token
     *  prams type       重要通知是1 派奖信息是2 维护公告是3
     * @returns {*|AV.Promise}
     */
    noticeList: function (token, type) {
        return this.query({
            do: 'smessage',
            op: 'list',
            play_id: 1,
            token: token,
            type: type
        });
    },
    /**
     * 首页通知公告列表详情
     * prams token
     * prams noticeId
     * @returns {*|AV.Promise}D
     */
    noticeListDetails: function (token, noticeId) {
        return this.query({
            do: 'smessage',
            play_id: 1,
            token: token,
            id: noticeId
        });
    },
    /**
     * 彩票游戏彩种列表
     * @returns {*|AV.Promise}
     */
    lotteryMenuList: function () {
        return this.query({
            do: 'lottery',
            m: 'yike_game'
        });
    },
    /**
     * 彩票玩法选择
     * prams
     * @returns {*|AV.Promise}
     */
    lotteryPlayChose: function (lotteryId, playName, token) {
        return this.query({
            do: 'play',
            m: 'yike_game',
            token: token,
            lottery_id: lotteryId,
            play_name: playName
        });
    },

    /**
     * 报表中心
     * @returns {*|AV.Promise}
     */
    /*彩票团队报表*/
    teamReport: function (token, times) {
        return this.query({
            do: 'report',
            op: 'team',
            token: token,
            time: times
        });
    },
    /*彩票个人报表*/
    reportCenter: function (data, token, times, page) {
        return this.query({
            do: 'report',
            op: data,
            token: token,
            time: times,
            page: page
        });
    },
    /*盈亏报表*/
    profitReport: function (token, x, profitName) {
        return this.query({
            do: 'report',
            op: 'profit',
            token: token,
            time: x,
            name: profitName
        });
    },
    /*注册*/
    register: function (name, pwd) {
        return this.query({
            do: 'register',
            user_name: name,
            password: pwd
        })
    },
    /***login***/
    login: function (userName, userWord) {
        return this.query({
            do: 'login',
            user_name: userName,
            password: userWord
        });
    },
    /*退出登录*/
    loginOut: function (token) {
        return this.query({
            do: 'logout',
            token: token
        });
    },
    //充值
    /**
     * 提现默认银行卡和次数
     * @param token
     * @returns {*|AV.Promise}
     */
    depositBankNum: function (token) {
        return this.query({
            do: 'withdrawals',
            op: 'index',
            token: token
        });
    },
    //提现
    depositApply: function (token, money, psw, bankid) {
        return this.query({
            do: 'withdrawals',
            op: 'withdrawals',
            token: token,
            money: money,
            password: psw,
            bank_id: bankid
        });
    },
    //提现记录
    withdrawalRecord: function (token, page, time) {
        return this.query({
            do: 'withdrawals',
            op: 'list',
            token: token,
            page: page,
            time: time
        });
    },
    //基础信息
    jichu: function (token) {
        return this.query({
            op: 'user',
            do: 'user',
            token: token
        })
    },
    //安全中心
    anquan: function (token) {
        return this.query({
            do: 'safety',
            token: token
        })
    },
    //保存手机
    phones: function (phone, token) {
        return this.query({
            do: 'binding',
            op: 'phone',
            phone: phone,
            token: token
        })
    },
    //保存邮箱
    emalis: function (email, token) {
        return this.query({
            do: 'binding',
            op: 'email',
            email: email,
            token: token
        })
    },
    //保存QQ
    qqs: function (qq, token) {
        return this.query({
            do: 'binding',
            op: 'qq',
            qq: qq,
            token: token
        })
    },
    //修改登录密码
    changeLoginPwd: function (token, old_password, password) {
        return this.query({
            do: 'revise',
            op: 'revise',
            token: token,
            old_password: old_password,
            password: password
        });
    },
    //修改资金密码
    changeWithdrawPwd: function (token, old_password, password) {
        return this.query({
            do: 'withdrawals',
            op: 'update_password',
            token: token,
            old_password: old_password,
            password: password
        });
    },
    //银行列表
    banklist: function () {
        return this.query({
            do: 'bank_card',
            op: 'bank'
        });
    },
    /**
     * 用户银行卡列表
     * @param token
     * @returns {*|AV.Promise}
     */
    userBankCard: function (token) {
        return this.query({
            do: 'bank_card',
            op: 'bank_card',
            token: token
        });
    },
//银行资料》绑定银行卡
    bindBankCard: function (token, accountName, bankId, bankCardNub, accountAddress) {
        return this.query({
            do: 'bank_card',
            op: 'add_card',
            token: token,
            name: accountName,
            bank_id: bankId,
            bank_card: bankCardNub,
            address: accountAddress

        });
    },
    //奖金详情彩票列表
    bonus: function () {
        return this.query({
            do: 'bonus',
            op: 'lottery'
        });
    },
    //奖金详情玩法列表
    wanfalist: function (name) {
        return this.query({
            do: 'bonus',
            op: 'play',
            lottery_id: 261,
            play_name: name
        });
    },
    /**获取用户信息***/
    userInfo: function (token) {
        return this.query({
            do: 'user',
            token: token
        })
    },
    /***游戏记录****/
    record: function (data, token, uesrName, times, lotteryName, playId, type) {
        return this.query({
            do: 'order',
            op: data,
            token: token,
            name: uesrName,
            time: times,
            lottery_name: lotteryName,
            play: playId,
            type: type
        });
    },
    /*追号记录*/
    chaseNumber: function (type, token) {
        return this.query({
            do: 'order',
            op: 'main',
            type: type,
            token: token
        });
    },
    /*撤销投注订单*/
    cancelOrder: function (token, id) {
        return this.query({
            do: 'order',
            op: 'revoke',
            token: token,
            id: id
        });
    },
    /*投注页游戏记录*/
    BettingRecord: function (token, type) {
        return this.query({
            do: 'order',
            op: 'main',
            token: token,
            type: type
        })
    },
    /**账变记录**/
    AccountChange: function (token, page) {
        return this.query({
            do: 'record',
            op: 'bill',
            token: token,
            page: page
        })
    },
    /*取款记录  ly*/
    withdrawals: function (token, page) {
        return this.query({
            do: 'withdrawals',
            op: 'list',
            token: token,
            page: page
        })
    },
    /**获取开奖数据**/
    openLotteryData: function (params) {
        return this.query({
            do: 'open_data',
            op: 'main',
            token: params.token,
            lottery: params.cpId
        });
    },
    //下注
    doBet: function (params) {
        /*return this.query({
         do: 'bet',
         token:params.token,
         play_id:params.wfId,
         lottery:params.cpId,
         data:params.data,
         periods_num:params.qs,
         bet_money:params.betMoney||10,
         play:params.playTitle,
         play_name:params.playName,
         rebate_count:params.rebeatKey,
         lottery_name:params.lotteryName
         });*/
        return this.query({
            do: 'bet',
            token: params.token,
            data: params.data
        });
    },
    //追号
    followBet: function (params) {
        return this.query({
            do: 'follow_bet',
            token: params.token,
            data: params.data
        });
    },
    /*团队 - 彩票走势*/
    TeamLottery: function (times, token) {
        return this.query({
            do: 'report',
            op: 'team',
            time: times,
            token: token
        });
    },
    //团队 - 下级管理----条件查询还没做
    subordinate: function (data, token) {
        return this.query({
            do: 'subordinate',
            op: 'subordinate',
            name: data.userName,
            ob: data.ob,
            token: token
        });
    },
    /*团队 - 下级管理 -修改备注*/
    modifyRemark: function (token, id, remarkText) {
        return this.query({
            do: 'subordinate',
            op: 'add_remark',
            token: token,
            id: id,
            name: remarkText
        });
    },
    /*团队 - 下级管理 -删除备注*/
    deletedRemark: function (token, id) {
        return this.query({
            do: 'subordinate',
            op: 'delete_remark',
            token: token,
            id: id
        });
    },
    //团队 - 下级管理--添加下级
    addSubordinate: function (token, type, data) {
        return this.query({
            do: 'subordinate',
            op: 'add',
            token: token,
            type: type,
            user_name: data.subordinateUser,
            password: data.subordinatePassWord,
            high_rebate: data.highRebate,
            low_rebate: data.lowRebate
        });
    },

    //团队 - 下级取款记录
    drawRecord: function (times, token) {
        return this.query({
            do: 'subordinate',
            op: 'withdrawals',
            time: times,
            token: token
        });
    },
    /*团队 - 开户记录*/
    openAccount: function (token) {
        return this.query({
            do: 'account',
            op: 'list',
            token: token
        });
    },
    /*团队 - 新增开户*/
    newAccount: function (token, type, data) {
        return this.query({
            do: 'account',
            op: 'add',
            token: token,
            type: type,
            high_rebate: data.highRebate,
            low_rebate: data.lowRebate,
            remarks: data.remarks
        });
    },
    /*团队 - 删除开户记录*/
    removeAccount: function (token, id) {
        return this.query({
            do: 'account',
            op: 'delete',
            token: token,
            id: id
        });
    }
};


//var openid = elocalStorage.get('openid') || '';
var yikeYbc = new yikeYbc(WX_API_URL, WX_ID);

var loginModule = angular.module("login", []);
loginModule.controller("longCtrl", [
    "$scope", "$http", "$q", function ($scope, $http, $q) {

        var baseUrl = 'http://103.30.77.22:7885';

        var vm = $scope.vm = {};

        myUrl = "http://www.yike1908.com/app/index.php?callback=JSON_CALLBACK";
        vm.checked = 0;

        //刷新验证码
        vm.refresh = function () {
            document.getElementById('m_imgCode').src = baseUrl + '/valid_code?code_type=login&amp;t=' + Math.random();
            console.log(Math.random());
        };
        //登陆
        vm.submit = function () {
            var defer = $q.defer();
            var promise = defer.promise;
            $http({
                method: "JSONP",
                params: {"user_name": vm.userName, "password": vm.userWord, do: "login"},
                url: myUrl
            }).success(function (data) {
                defer.resolve(data);
            });
            promise.then(function (data) {
                vm.data = data;
                console.log(vm.data);
            });
            window.location.href = "http://localhost:8100/#/home";
            //登陆不成功就
            vm.refresh();
        };

        vm.retrievePwd = function () {

        }

    }])



angular.module('register', ['ionic', 'yike'])
    .controller('registerCtrl', registerCtrl);

registerCtrl.$inject = ['$scope', '$yikeUtils', '$state'];
function registerCtrl($scope, $yikeUtils, $state) {
    $scope.vm = {
        name: '',
        psd: ''
    };
    $scope.register = register;
    function register() {
        if (!$scope.vm.name) {
            $yikeUtils.toast('请输入账号');
        } else if (!$scope.vm.pwd) {
            $yikeUtils.toast('请输入密码');
        } else {
            yikeYbc.register($scope.vm.name, $scope.vm.pwd)
                .then(function (data) {
                    //页面跳转
                    window.location.href = "http://localhost:8100/#/login.html";
                });
        }
    }

}


/**
 * Created by NicoleQi on 2016/12/10.
 */
(function () {
    'use strict';

    angular
        .module('active.controller', [])
        .controller('ActiveCtrl', ActiveCtrl);
    ActiveCtrl.$inject = ['$scope'];
    /* @ngInject */
    function ActiveCtrl($scope){
        $scope.$on('$ionicView.afterEnter', function(){
            headHover();
            choseNav();
            gameShowChange();
            choseActiveKind();
            activeAction();
        });
    }
})();

/**
 * Created by HL on 2016/12/28.
 */
(function () {
  'use strict';

  angular
    .module('bankcard.controller', [])
    .controller('bankcardCtrl', bankcardCtrl);
  bankcardCtrl.$inject = ['$scope'];
  /* @ngInject */
  function bankcardCtrl($scope){
    var token=localStorage.getItem('token');
    $scope.formValue= {
      accountName:'',
      bankCardNub:'',
      accountAddress:'',
      presentPassword:''
    };
    init();
    function init() {
       //获取用户银行卡列表
       yikeYbc.userBankCard(token)
       .then(function(data){
       $scope.userbank=data.result.result;
       $scope.reg = /^(\d{0})\d+(\d{4})$/;
       $scope.$digest();
       });
    }
    //获取银行列表
    yikeYbc.banklist()
       .then(function(data){
        $scope.bankname=data.result.result;
         $scope.bankId=data.result.result[0].id;
        $scope.$digest();
      });
    //绑定银行卡
    $scope.banks=function(){
      var reg1 = /^[0-9]*$/;
     if($scope.formValue.accountAddress==''){
     play.cozyTip('请输入开户地址');
     }else if($scope.formValue.accountName==''){
      play.cozyTip('请输入开户名')
     }else if($scope.formValue.bankCardNub==''){
     play.cozyTip('请输入银行卡号')
     }else if($scope.formValue.bankCardNub.length<19 || $scope.formValue.bankCardNub.length>19){
     play.cozyTip('请输入有效的银行卡号')
     }else if($scope.formValue.presentPassword==''){
     play.cozyTip('请输入资金密码')
     }else if(!reg1.test($scope.formValue.presentPassword)){
     play.cozyTip('请输入数字密码')
     }else {
     yikeYbc.bindBankCard( token,
       $scope.formValue.accountName,
       $scope.bankId,
       $scope.formValue.bankCardNub,
       $scope.formValue.accountAddress,
       $scope.formValue.presentPassword)
       .then(function(data){
        play.cozyTip(data.result.result);
       })
     }
    }
    }
})();

/**
 * Created by HL on 2017/1/3.
 */
(function () {
  'use strict';
  angular
    .module('bonus.details.controller',[])
    .controller('bonusdetailsrCtrl',bonusdetailsrCtrl);
   bonusdetailsrCtrl.$inject = ['$scope'];
   /* @ngInject */
    function bonusdetailsrCtrl($scope){
    var token=localStorage.getItem('token');
      init();
      function init(){
          $scope.status=0;
          $scope.selectSort=function(i){
          $scope.status=i;
        };
        //获取个人信息
          yikeYbc.jichu(token)
          .then(function(data){
            $scope.data=data.result.result;
            $scope.$digest()
          });
          //奖金详情彩票列表
          yikeYbc.bonus()
          .then(function(data){
            $scope.datas=data.result.result;
            $scope.listData=data.result.result.lottery;
            $scope.$digest();
          })
      }
  }
})();

/**
 * Created by NicoleQi on 2016/12/10.
 */
(function () {
    'use strict';

    angular
    .module('home.controller', [])
    .controller('HomeCtrl', HomeCtrl);

    HomeCtrl.$inject = ['$scope','$sce', '$rootScope', '$state'];
    /* @ngInject */
    function HomeCtrl($scope,$sce, $rootScope, $state){
        var token = localStorage.getItem('token');
        if(!token) window.location.href = window.location.protocol + "//" + window.location.host+'/login.html' ;
        $scope.$on('$ionicView.afterEnter', function(){
            headHover();
            choseNav();
            gameShowChange();
            swiperImg();
            changeDownload();
            changeNoticeNav(1);
            changeNoticeType();
        });

        //首页轮播图
        yikeYbc.changeBanner()
            .then(function(data){
                $scope.banner = data.result.banner;
                $scope.$digest();
                Caroursel.init($('.caroursel'));
        });

        //banner图下面的小图切换效果
        $scope.slotImg = slotImg;
        function slotImg(){
            play.cozyTip("<p class='cozy-tip'>暂未开放，敬请期待！</p>");
        }
        //首页通知公告列表
        $scope.changeNoticeNav = changeNoticeNav;
        function changeNoticeNav(type){
            yikeYbc.noticeList(token,type)
                .then(function(data){
                    $scope.noticeList = data.result.result;
                    $scope.$digest();
            });
        }
        //首页通知公告列表详情
        $scope.noticeListDetails = noticeListDetails;
        function noticeListDetails(noticeId){
            yikeYbc.noticeListDetails(token,noticeId).then(function(data){
                play.noticeListPop();
              $scope.popNoticeList =  data.result.result;
              $scope.listId = data.result.result.id;
              $scope.$digest();
            });
        }
        //首页通知公告列表详情切
        $scope.changeNoticeDetails = changeNoticeDetails;
        function changeNoticeDetails(noticeId){
            yikeYbc.noticeListDetails(token,noticeId).then(function(data){
                $scope.popNoticeList =  data.result.result;
                $scope.listId = data.result.result.id;
                $scope.$digest();
            });
        }




    }

})();

/**
 * Created by frank on 2016/8/30.
 */
(function () {
    'use strict';

    angular
        .module('home.module', [
            'home.controller',
            'active.controller',
            'luck.controller',
            'lottery.controller',
            'record.controller',
            'jichu.controller',
            'updapassword.controller',
            'bankcard.controller',
            'jichu.controller',
            'safetycenter.controller',
            'bonus.details.controller',
            'my.news.controller',
            'team.controller',
            'report.controller',
            'recharge.controller',
            'header.controller'
        ])
})();

/**
 * Created by HL on 2016/12/26.
 */
(function () {
  'use strict';

  angular
    .module('jichu.controller', [])
    .controller('jichuCtrl', jichuCtrl);
  jichuCtrl.$inject = ['$scope'];
  /* @ngInject */
  function jichuCtrl($scope){
    var token=localStorage.getItem('token');
   init();
   function init(){
      yikeYbc.jichu(token)
       .then(function(data){
       $scope.data=data.result.result;
       $scope.$digest()
       })
   }
  }
})();

/**
 * Created by NicoleQi on 2016/12/13.
 */
(function () {
  'use strict';

  angular
    .module('header.controller', [])
    .controller('HeaderCtrl', HeaderCtrl);
  /* @ngInject*/
  HeaderCtrl.$inject = ['$rootScope','$scope','$yikeUtils', '$state'];
  /* @ngInject*/
  function HeaderCtrl($rootScope,$scope,$yikeUtils, $state) {
    rechargeCenter();
    recordCenter();
    personalCenter();
    teamCenter();
    reportCenter();
    changeLeftMenu();
    orderOperation();
    lowerRebateMessage();

    //退出登录
    $scope.logOut = longOut;

      var token = TOKEN;
    //获取用户信息
    function init(){
      yikeYbc.userInfo(token)
        .then(function(data){
          if( data.status == 1){
            $scope.user = data.result.result;
            $scope.userName = $scope.user.user_name;
            $scope.isAgent = $scope.user.is_agent;
            //$scope.isAgent = 0;
            //localStorage.setItem("loginState", data.result.result.login_state);
          }

      });
    }

    //退出登录
    function longOut (){
      yikeYbc.loginOut(token)
        .then(function(data){
          $scope.$digest();
          if(data.status == 1){
            window.location.href = "http://localhost:8100/login.html";
          }

      });
    }
    init();

  }
})();



/**
 * Created by HL on 2017/1/3.
 */
(function () {
  'use strict';
  angular
    .module('my.news.controller', [])
    .controller('MynewsCtrl',MynewsCtrl);
  MynewsCtrl.$inject = ['$scope'];
  /* @ngInject */
  function MynewsCtrl($scope){
    //var token=localStorage.getItem('token');
    var vm = $scope.vm = {};
    init();
    function init(){

    }

    //初始化
    $(".date").datetimepicker();
    $(".date").datetimepicker();


    //格式化日期：yyyy-MM-dd
    function formatDate(date) {
      var myyear = date.getFullYear();
      var mymonth = date.getMonth()+1;
      var myweekday = date.getDate();

      if(mymonth < 10){
        mymonth = "0" + mymonth;
      }
      if(myweekday < 10){
        myweekday = "0" + myweekday;
      }
      return (myyear+"/"+mymonth + "/" + myweekday);
    }

    var now = new Date();
    $scope.ToDay = formatDate(now);

    //今天
    $scope.toDay = function(){
      var now = new Date();
      $scope.today = formatDate(now);

      $(".date").val($scope.today);
      $(".date").val($scope.today);
    };

    //昨天
    $scope.yesTerDay = function(){
      var now = new Date();
      now.setDate(now.getDate()-1);
      $scope.yesTday = formatDate(now);

      $(".date").val($scope.yesTday);
      $(".date").val($scope.yesTday);
    };

    //本周日期
    $scope.thisWeek = function(){
      var now = new Date();
      var nowWeek = now.getDay();// 当前星期
      $scope.tswkEnd = formatDate(now); // 本周结束日期
      now.setDate(now.getDate()-nowWeek);
      $scope.tswkStart = formatDate(now); // 本周开始日期

      $(".date").val($scope.tswkStart);
      $(".date").val($scope.tswkEnd);
    };
    //上周
    $scope.lastWeek = function(){
      var now = new Date();
      var nowWeek = now.getDay();
      now.setDate(now.getDate()-nowWeek-7);
      $scope.startLastWeek = formatDate(now); // 上周开始日期
      now.setDate(now.getDate()+6);
      $scope.endLastWeek = formatDate(now); // 上周结束日期
      $(".date").val($scope.startLastWeek);
      $(".date").val($scope.endLastWeek);

    };
    //本月
    $scope.thisMonth  = function(){

      var now = new Date();
      var nowDate = now.getDate();//当前日期
      $scope.endThisMonth= formatDate(now); // 本月结束日期
      now.setDate(now.getDate()-nowDate+1);
      $scope.startThisMonth = formatDate(now); // 本月开始日期

      $(".date").val($scope.startThisMonth);
      $(".date").val($scope.endThisMonth);
    }

    //上月
    $scope.lastMonth = function(){
      var now = new Date();
      var nowDate = now.getDate();//当前日期
      now.setDate(now.getDate()-nowDate+1);
      now.setMonth(now.getMonth() - 1);
      $scope.startLastMonth = formatDate(now); // 上月开始日期

      now.setMonth(now.getMonth() +1);
      now.setDate(now.getDate()-1);
      $scope.endLastMonth = formatDate(now); // 上月结束日期

      $(".date").val($scope.startLastMonth);
      $(".date").val($scope.endLastMonth);
    };


    //今天、昨天、、、、、
    vm.chose = [
      {name:'今天', value:'today'},
      {name:'昨天', value:'yesterday'},
      {name:'本周', value:'this-week'},
      {name:'上周', value:'prev-week'},
      {name:'本月', value:'this-month'},
      {name:'上月', value:'prev-month'}
    ];
    vm.timeName = vm.chose[0].name;


    $scope.changeDate = changeDate;
    function changeDate(name){
      vm.timeName = name;
      if(name == '今天'){
        $scope.toDay();
      }else if( name == '昨天'){
        $scope.yesTerDay();
      }else if( name == '本周'){
        $scope.thisWeek();
      }else if( name == '上周'){
        $scope.lastWeek();
      }else if( name == '本月'){
        $scope.thisMonth();
      }else if( name == '上月'){
        $scope.lastMonth();
      }
    }

  }
})();

/**
 * Created by HL on 2017/1/5.
 */
(function () {
  'use strict';
  angular
    .module('phone.controller', [])
    .controller('phoneCtrl',phoneCtrl);
  phoneCtrl.$inject = ['$scope'];
  /* @ngInject */
  function phoneCtrl($scope){
    var token=localStorage.getItem('token');
    init();
    function init(){
    }
    /*保存qq*/
    $scope.formValue={
    phone:'18784252878'
    };
    $scope.rest=rest;
    function rest(){
      yikeYbc.phones($scope.formValue.phone,token)
        .then(function(data){
        })
    }
  }
})();

/**
 * Created by HL on 2017/1/11.
 */
(function(){

  angular
    .module('recharge.controller',[])
    .controller('RechargeCtrl',RechargeCtrl);

    RechargeCtrl.$inject=['$scope'];
    function RechargeCtrl($scope){
    var token=localStorage.getItem('token');
    var vm = $scope.vm = {};
    var page=1;
    init();
    function init(){
    }
    //提现
   $scope.formValue = {
    money: '',
    psw: ''
   };
  yikeYbc.depositBankNum(token)
    .then(function (data) {
      $scope.bankCard = data.result.bank.bank_card;
      $scope.bankName = data.result.bank.bank_name;
      $scope.Name = data.result.bank.name;
      $scope.bankid = data.result.bank.id;
      $scope.balance = data.result.remind.balance;
      $scope.allNum = data.result.remind.all_num;
      $scope.freeNum = data.result.remind.free_num;
      $scope.poundage = data.result.remind.poundage;
      $scope.content = data.result.notice.content;
      $scope.$digest();
    });
  $scope.tixian=function(){

  if($scope.formValue.money==''){

  play.cozyTip('请输入金额')

  }else if($scope.formValue.psw==''){

  play.cozyTip('请输入密码')

  }else {
  yikeYbc.depositApply(token, $scope.formValue.money, $scope.formValue.psw, $scope.bankid)
    .then(function(data){
    })
  }
  };

   /*绑定新的银行卡*/

   yikeYbc.banklist()
     .then(function(data){
     $scope.banknames=data.result.result;
     $scope.bankId=data.result.result[0].id;
     $scope.$digest();
     });

      $scope.users={
      accountName:'',
      bankCardNub:'',
      accountAddress:'',
      presentPassword:''
      };
   $scope.RechargeBindBank=function(){

  var reg1 = /^[0-9]*$/;

  if($scope.users.accountAddress==""){

    play.cozyTip('请输入开户地址')

  }else if($scope.users.accountName==''){

    play.cozyTip('请输入开户名')

  }else if($scope.users.bankCardNub==''){

    play.cozyTip('请输入银行卡号')

  }else if($scope.users.bankCardNub.length<19 || $scope.users.bankCardNub.length>19){

    play.cozyTip('请输入有效的银行卡号')

  }else if($scope.users.presentPassword==''){

    play.cozyTip('请输入资金密码')

  }else if(!reg1.test($scope.users.presentPassword)){

    play.cozyTip('请输入数字密码')

  }else {
    yikeYbc.bindBankCard( token,
      $scope.users.accountName,
      $scope.bankId,
      $scope.users.bankCardNub,
      $scope.users.accountAddress,
      $scope.users.presentPassword)
      .then(function(data){
        play.cozyTip(data.result.result);
      })
     }
  };

  //获取余额信息
    yikeYbc.jichu(token)
      .then(function(data){
      $scope.data=data.result.result;
      $scope.$digest()
      });
    /*充取转记录*/
    $scope.status=0;
    $scope.selectSort=function(i){
    $scope.status=i;
     };

      //初始化
      $(".date").datetimepicker();
      $(".date").datetimepicker();


      //格式化日期：yyyy-MM-dd
      function formatDate(date) {
        var myyear = date.getFullYear();
        var mymonth = date.getMonth()+1;
        var myweekday = date.getDate();

        if(mymonth < 10){
          mymonth = "0" + mymonth;
        }
        if(myweekday < 10){
          myweekday = "0" + myweekday;
        }
        return (myyear+"/"+mymonth + "/" + myweekday);
      }

      var now = new Date();
      $scope.ToDay = formatDate(now);

      //今天
      $scope.toDay = function(){
        var now = new Date();
        $scope.today = formatDate(now);

        $(".date").val($scope.today);
        $(".date").val($scope.today);
      };

      //昨天
      $scope.yesTerDay = function(){
        var now = new Date();
        now.setDate(now.getDate()-1);
        $scope.yesTday = formatDate(now);

        $(".date").val($scope.yesTday);
        $(".date").val($scope.yesTday);
      };

      //本周日期
      $scope.thisWeek = function(){
        var now = new Date();
        var nowWeek = now.getDay();// 当前星期
        $scope.tswkEnd = formatDate(now); // 本周结束日期
        now.setDate(now.getDate()-nowWeek);
        $scope.tswkStart = formatDate(now); // 本周开始日期

        $(".date").val($scope.tswkStart);
        $(".date").val($scope.tswkEnd);
      };
      //上周
      $scope.lastWeek = function(){
        var now = new Date();
        var nowWeek = now.getDay();
        now.setDate(now.getDate()-nowWeek-7);
        $scope.startLastWeek = formatDate(now); // 上周开始日期
        now.setDate(now.getDate()+6);
        $scope.endLastWeek = formatDate(now); // 上周结束日期
        $(".date").val($scope.startLastWeek);
        $(".date").val($scope.endLastWeek);

      };
      //本月
      $scope.thisMonth  = function(){

        var now = new Date();
        var nowDate = now.getDate();//当前日期
        $scope.endThisMonth= formatDate(now); // 本月结束日期
        now.setDate(now.getDate()-nowDate+1);
        $scope.startThisMonth = formatDate(now); // 本月开始日期

        $(".date").val($scope.startThisMonth);
        $(".date").val($scope.endThisMonth);
      };

      //上月
      $scope.lastMonth = function(){
        var now = new Date();
        var nowDate = now.getDate();//当前日期
        now.setDate(now.getDate()-nowDate+1);
        now.setMonth(now.getMonth() - 1);
        $scope.startLastMonth = formatDate(now); // 上月开始日期

        now.setMonth(now.getMonth() +1);
        now.setDate(now.getDate()-1);
        $scope.endLastMonth = formatDate(now); // 上月结束日期

        $(".date").val($scope.startLastMonth);
        $(".date").val($scope.endLastMonth);
      };


      //今天、昨天、、、、、
      vm.chose = [
        {name:'今天', value:'today'},
        {name:'昨天', value:'yesterday'},
        {name:'本周', value:'this-week'},
        {name:'上周', value:'prev-week'},
        {name:'本月', value:'this-month'},
        {name:'上月', value:'prev-month'}
      ];
      vm.timeName = vm.chose[0].name;


      $scope.changeDate = changeDate;
      function changeDate(name){
        vm.timeName = name;
        if(name == '今天'){
          $scope.toDay();
        }else if( name == '昨天'){
          $scope.yesTerDay();
        }else if( name == '本周'){
          $scope.thisWeek();
        }else if( name == '上周'){
          $scope.lastWeek();
        }else if( name == '本月'){
          $scope.thisMonth();
        }else if( name == '上月'){
          $scope.lastMonth();
        }
      }
    //获取记录
       $scope.query=function() {
        //获取时间段
         $scope.start_time = $(".date").val();
         $scope.end_time = $(".date").val();
         $scope.time=[
           $scope.start_time,
           $scope.end_time
         ];
        yikeYbc.withdrawalRecord(token,page,$scope.time)
          .then(function (date) {
          console.log(date);
          if(data.status==0){
          play.cozyTip(date.result.result)
          }
          });
      }
    }
})();

/**
 * Created by NicoleQi on 2016/12/13.
 */
(function () {
  'use strict';

  angular
    .module('record.controller', [])
    .controller('recordCtrl', recordCtrl);
  /* @ngInject*/
  recordCtrl.$inject = ['$scope'];
  /* @ngInject*/

  function recordCtrl($scope) {
    var vm = $scope.vm = {};
    //获取token
    var token = localStorage.getItem('token');


    //初始化
    $(".recordTime1").datetimepicker();
    $(".recordTime2").datetimepicker();


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

    //tab 切换页面
    $scope.data = {
      current: "1"
    };
    $scope.actions = {
      setCurrent: function (param) {
        $scope.data.current = param;
      }
    };

    vm.lott = [
      {name: '彩票记录', type: 1},
      {name: '追号记录', type: 2}
    ]
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

      yikeYbc.record(vm.opValue, token, vm.name, $scope.times, vm.gameName, vm.playId, vm.lottType)
        .then(function (data) {
          if (vm.lottType == 1) {
            if (data.status == 1) {
              $scope.sts = data.status;
              $scope.bettingData = data.result.result;

              for (var b = 0; b < $scope.bettingData.length; b++) {
                var playId = $scope.bettingData[b].play_id;
                for (var i in wf_list) {
                  for (var j in wf_list[i]) {
                    var status = $.inArray(playId, wf_list[i][j]);
                    if (status != -1) {
                      $scope.bettingData[b].playName = j;
                    }
                  }
                }
              }

              $scope.allNumber = $scope.bettingData.length;
              $scope.allPage = Math.ceil($scope.allNumber / 10);
              $scope.defaultPage = 1;
              $scope.nowArr = [];
              for (var i = 0; i < ($scope.allNumber < 10 ? $scope.allNumber : 10); i++) {
                $scope.nowArr.push($scope.bettingData[i]);
              }

              //下一页
              $scope.pageDown1 = function () {
                $scope.nowArr = [];
                if ($scope.defaultPage < $scope.allPage) {
                  $scope.defaultPage++;
                }
                for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
                  if (i <= $scope.allNumber - 1) {
                    $scope.nowArr.push($scope.bettingData[i]);
                  }
                }
              };
              //上一页
              $scope.pageUp1 = function () {
                $scope.nowArr = [];
                if ($scope.defaultPage > 1) {
                  $scope.defaultPage--;
                }
                for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
                  if (i <= $scope.allNumber - 1) {
                    $scope.nowArr.push($scope.bettingData[i]);
                  }
                }
              };
              //go
              $scope.pageGo1 = function (pageNow) {
                $scope.nowArr = [];
                if (pageNow >= 1 && pageNow <= $scope.allPage) {
                  $scope.defaultPage = pageNow;
                }
                for (var i = ($scope.defaultPage - 1) * 10; i < ($scope.defaultPage * 10); i++) {
                  if (i <= $scope.allNumber - 1) {
                    $scope.nowArr.push($scope.bettingData[i]);
                  }
                }
              };
            } else {
              $scope.sts = data.status;
              $scope.nullData = data.result.result;
              $scope.nowArr = [];
              //play.cozyTip("<span>暂无投注记录</span>");
            }


          } else if (vm.lottType == 2) {//追号记录
            if (data.status == 1) {
              $scope.sts1 = data.status;

              $scope.cancelStatus = data.result.result[0].is_open;
              $scope.chaseData = data.result.result;

              for (var b = 0; b < $scope.chaseData.length; b++) {
                var playId = $scope.chaseData[b].play_id;
                for (var i in wf_list) {
                  for (var j in wf_list[i]) {
                    var status = $.inArray(playId, wf_list[i][j]);
                    if (status != -1) {
                      $scope.chaseData[b].playName = j;
                    }
                  }
                }
              }
              console.log($scope.chaseData);

              $scope.allNumber1 = $scope.chaseData.length;
              $scope.allPage1 = Math.ceil($scope.allNumber1 / 10);
              $scope.defaultPage1 = 1;
              $scope.nowArr1 = [];
              for (var i = 0; i < ($scope.allNumber1 < 10 ? $scope.allNumber1 : 10); i++) {
                $scope.nowArr1.push($scope.chaseData[i]);
              }

              //下一页
              $scope.pageDown2 = function () {
                $scope.nowArr1 = [];
                if ($scope.defaultPage1 < $scope.allPage1) {
                  $scope.defaultPage1++;
                }
                for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
                  if (i <= $scope.allNumber1 - 1) {
                    $scope.nowArr1.push($scope.chaseData[i]);
                  }
                }
              };
              //上一页
              $scope.pageUp2 = function () {
                $scope.nowArr1 = [];
                if ($scope.defaultPage1 > 1) {
                  $scope.defaultPage1--;
                }
                for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
                  if (i <= $scope.allNumber1 - 1) {
                    $scope.nowArr1.push($scope.chaseData[i]);
                  }
                }
              };
              //go
              $scope.pageGo2 = function (pageNow1) {
                $scope.nowArr1 = [];
                if (pageNow1 >= 1 && pageNow1 <= $scope.allPage1) {
                  $scope.defaultPage = pageNow1;
                }
                for (var i = ($scope.defaultPage1 - 1) * 10; i < ($scope.defaultPage1 * 10); i++) {
                  if (i <= $scope.allNumber1 - 1) {
                    $scope.nowArr1.push($scope.chaseData[i]);
                  }
                }
              };
            } else {
              $scope.sts1 = data.status;
              $scope.nullData1 = data.result.result;
              $scope.nowArr1 = [];
              //play.cozyTip("<span>暂无投注记录</span>");
            }
          }

          $scope.$digest();
        });
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
    function changeBill () {
      yikeYbc.AccountChange(token, $scope.defaultPages)
        .then(function (data) {
          if (data.status == 1) {

            $scope.variablsts = data.status;

            $scope.variableData = data.result.result;

            //总条数
            $scope.totalNumber = data.result.total;
            //总页数
            $scope.totalPage =  Math.ceil($scope.totalNumber / 10);

            //上一页
            $scope.pageUp = function(){
              if($scope.defaultPages > 1 || $scope.currentPage > 1){
                $scope.defaultPages--;
                $scope.currentPage--;
                changeBill();
              }

            };
            //下一页
            $scope.pageDown = function(){
              if($scope.defaultPages < $scope.totalPage && $scope.currentPage  < $scope.totalPage){
                $scope.defaultPages++;
                $scope.currentPage++;
                changeBill();
              }
            };
            //goPage
            $scope.goPages = function(){
                if($scope.currentPage >= 1 && $scope.currentPage <= $scope.totalPage){
                  $scope.defaultPages = $scope.currentPage;
                  changeBill($scope.currentPage);
                }
            };

          }else{
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




/**
 * Created by NicoleQi on 2016/12/13.
 */
(function () {
  'use strict';

  angular
    .module('report.controller', [])
    .controller('reportCtrl', reportCtrl);
  /* @ngInject*/
  reportCtrl.$inject = ['$scope'];
  /* @ngInject*/

  function reportCtrl($scope) {

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

      $(".date").val($scope.today);
      $(".date1").val($scope.today);
    };

    //昨天
    $scope.yesTerDay = function () {
      var now = new Date();
      now.setDate(now.getDate() - 1);
      $scope.yesTday = formatDate(now);

      $(".date").val($scope.yesTday);
      $(".date1").val($scope.yesTday);
    };
    //本周日期
    $scope.thisWeek = function () {
      var now = new Date();
      var nowWeek = now.getDay();// 当前星期
      $scope.tswkEnd = formatDate(now); // 本周结束日期
      now.setDate(now.getDate() - nowWeek);
      $scope.tswkStart = formatDate(now); // 本周开始日期

      $(".date").val($scope.tswkStart);
      $(".date1").val($scope.tswkEnd);
    };
    //上周
    $scope.lastWeek = function () {
      var now = new Date();
      var nowWeek = now.getDay();
      now.setDate(now.getDate() - nowWeek - 7);
      $scope.startLastWeek = formatDate(now); // 上周开始日期
      now.setDate(now.getDate() + 6);
      $scope.endLastWeek = formatDate(now); // 上周结束日期
      $(".date").val($scope.startLastWeek);
      $(".date1").val($scope.endLastWeek);

    };
    //本月
    $scope.thisMonth = function () {

      var now = new Date();
      var nowDate = now.getDate();//当前日期
      $scope.endThisMonth = formatDate(now); // 本月结束日期
      now.setDate(now.getDate() - nowDate + 1);
      $scope.startThisMonth = formatDate(now); // 本月开始日期

      $(".date").val($scope.startThisMonth);
      $(".date1").val($scope.endThisMonth);
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

      $(".date").val($scope.startLastMonth);
      $(".date1").val($scope.endLastMonth);
    };


    var token = localStorage.getItem('token');
    var rp = $scope.rp = {};
    var tm = $scope.tm = {};

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var days = date.getDate();
    if (month < 10) {
      month = '0' + month;
    }
    if (days < 10) {
      days = '0' + days;
    }
    var nowTime = year + "/" + month + "/" + days;
    $scope.time1 = nowTime;
    $scope.time2 = nowTime;


    $("#jqueryPicker1").datetimepicker();
    $("#jqueryPicker2").datetimepicker();
    $("#jqueryPicker3").datetimepicker();
    $("#jqueryPicker4").datetimepicker();
    $("#jqueryPicker5").datetimepicker();
    $("#jqueryPicker6").datetimepicker();
    $("#jqueryPicker7").datetimepicker();
    $("#jqueryPicker8").datetimepicker();

    //查询参数
    tm.chose = [
      {name: '今天', value: 'today'},
      {name: '昨天', value: 'yesterday'},
      {name: '本周', value: 'this-week'},
      {name: '上周', value: 'prev-week'},
      {name: '本月', value: 'this-month'},
      {name: '上月', value: 'prev-month'}
    ];

    tm.timeName = tm.chose[0].name;

    tm.timeName = tm.chose[0].name; //默认选中今天

    rp.parameter = [
      {name: '个人', value: 'personal'},
      {name: '团队', value: 'team'}
    ];
    rp.opValue = rp.parameter[0].value;

    $scope.changeDate = changeDate;
    function changeDate(name) {
      tm.timeName = name;
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

    //彩票团队报表
    $scope.teamReport = function (){

      yikeYbc.teamReport()
        .then(function(data){
          console.log(data);
        });
    };

    //彩票个人报表
    rp.report = function (op) {
      var start_time = $('#jqueryPicker1').val();
      var end_time = $('#jqueryPicker2').val();
      $scope.times = [
        start_time,
        end_time
      ];
      yikeYbc.reportCenter(op, token, $scope.times, 1)
        .then(function (data) {
        });
    };


    //盈亏报表
    $scope.profitName = '';
    $scope.profitReport = function(){
      var start_time = $('#jqueryPicker5').val();
      var end_time = $('#jqueryPicker6').val();
      $scope.times = [
        {
          start_time:start_time,
          end_time:end_time
        }
      ];
      var x = JSON.stringify($scope.times);
      yikeYbc.profitReport(token,x,$scope.profitName)
        .then(function(data){
          console.log(data);
        });
    };

  }
})();




/**
 * Created by HL on 2017/1/3.
 */
(function () {
  'use strict';
  angular
    .module('safetycenter.controller', [])
    .controller('safetycenterCtrl',safetycenterCtrl);
  safetycenterCtrl.$inject = ['$scope'];
  /* @ngInject */
  function safetycenterCtrl($scope){
    var token=localStorage.getItem('token');
    $scope.formValue={
    phone:'',
    email:'',
    qq:''
    };
    init();
    function init(){
      /*登录记录*/
      yikeYbc.anquan(token)
        .then(function(data){
          $scope.data=data.result.result;
          $scope.$digest();
        });
    }
   //绑定QQ
   $scope.bindqq=function(){
   if($scope.formValue.qq=='') {
     play.cozyTip('请输入QQ号码')
   }else{
    yikeYbc.qqs($scope.formValue.qq,token)
    .then(function(data){
    if(data.status==1){
    play.cozyTip(data.result.result);
    }else if(data.status==0){
    play.cozyTip(data.result.result)
    }else {
      play.cozyTip('绑定失败')
    }
    })
   }
   };
   //绑定邮箱
  $scope.email=function() {
    if ($scope.formValue.email == '') {
      play.cozyTip('请输入邮箱')
    }else {
      yikeYbc.emalis($scope.formValue.email, token)
        .then(function (data) {
          if (data.status == 1) {
            play.cozyTip(data.result.result);
          } else {
            play.cozyTip(data.result.result)
          }
        })
    }
  };
  //绑定手机
  $scope.phone=function(){
  if($scope.formValue.phone==''){
    play.cozyTip('请输入手机号码');
  }else if($scope.formValue.phone.length<11){
  play.cozyTip('请输入有效的手机号码')
  }else {
  yikeYbc.phones($scope.formValue.phone,token)
    .then(function(data){
    if(data.status==1){
    play.cozyTip(data.result.result);
    }else if(data.status==0){
    play.cozyTip(data.result.result);
    }else {
     play.cozyTip('绑定失败')
    }
    })
   }
   }
  }
})();

/**
 * Created by ROCK on 2017/1/4.
 */
/**
 * Created by NicoleQi on 2016/12/13.
 */
(function () {
  'use strict';

  angular
    .module('team.controller', [])
    .controller('teamCtrl', teamCtrl);
  /* @ngInject*/
  teamCtrl.$inject = ['$scope'];
  /* @ngInject*/

  function teamCtrl( $scope) {

    var vm = $scope.vm = {};
    //获取token 登陆状态
    var token = localStorage.getItem('token');


    init();
    function init(){
      yikeYbc.jichu(token)
         .then(function(data){
          //console.log(data);
          $scope.data=data.result.result;
          $scope.$digest();
        })
    }


    //团队统计nav
    vm.teamNav = [
      {name:'彩票',value:'lottery'},
      {name:'AG',value:'ag'},
      {name:'MG',value:'mg'},
      {name:'PT',value:'pt'},
      {name:'NT',value:'nt'},
      {name:'沙巴体育',value:'sports'},
      {name:'幸运28',value:'lucky28'}
    ];
    vm.teamNavValue = vm.teamNav[0].value;

    //走势表
    $(function () {
      var chart;
      $(document).ready(function () {
        var now = new Date();
        var options = {
          "plotOptions": {
            "series": {
              //"pointStart":Date.UTC( 2000, 1, 2 ),
              "pointInterval": 3600 * 1000 * 24
            },
            "line": {
              "enableMouseTracking": true,
              "dataLabels": {"enabled": false}
            }
          },
          "credits": {"enabled": false},
          "title": {"text": ""},
          "subtitle": {"text": ""},
          "chart": {"renderTo": "container", "type": "line"},
          "yAxis": {
            "title": {"text": ""}
          },
          "xAxis": {
            "labels": {
              "formatter": function () {
                return Highcharts.dateFormat("%m-%d", this.value);
              }
            },
            "type": "datetime"
          },
          "tooltip": {"xDateFormat": "%Y-%m-%d", "shared": true, "enabled": true, "crosshairs": true},

          series: [{
            name: '投注量',
            data: [76, 68, 12, 16, 30,0],
            color:'#7CB5EC'
          }, {
            name: '游戏返点',
            data: [0, 0.58, -0.018, -10, 0.29,0],
            color:'#F45B5B'
          }, {
            name: '实际盈亏',
            data: [76, -50.596, -11.982, 5, -10, 0, 0],
            color:'#90ED7D'
          }]

        };
        //alert(now.getFullYear());
        //options.pointInterval = 3600*1000*24;
        //alert(options.plotOptions.pointStart);
        options.plotOptions.series.pointStart = Date.UTC(now.getFullYear(), now.getMonth(), now.getDay());
        //alert(options.plotOptions.series.pointStart);
        Highcharts.setOptions(options);
        chart = new Highcharts.Chart(options);
      });

    });



    //初始化
    $(".teamTime1").datetimepicker();
    $(".teamTime2").datetimepicker();


    //格式化日期：yyyy-MM-dd
    function formatDate(date) {
      var myyear = date.getFullYear();
      var mymonth = date.getMonth()+1;
      var myweekday = date.getDate();

      if(mymonth < 10){
        mymonth = "0" + mymonth;
      }
      if(myweekday < 10){
        myweekday = "0" + myweekday;
      }
      return (myyear+"/"+mymonth + "/" + myweekday);
    }

    var now = new Date();
    $scope.ToDay = formatDate(now);


    //最近一周
    $scope.lastSeven = function(){
      var now = new Date();
      now.setDate(now.getDate()-6);
      $scope.startToday = formatDate(now);
      console.log($scope.startToday);
      $(".teamTime1").val($scope.startToday);
      //$(".teamTime2").val($scope.today);
    };

    //最近一月
    $scope.recentJanuary = function(){
      var now = new Date();
      now.setDate(now.getDate()-31);
      $scope.startToday = formatDate(now);
      $(".teamTime1").val($scope.startToday);
      //$(".teamTime2").val($scope.today);
    };
    //最近三月
    $scope.recentMarch = function(){
      var now = new Date();
      now.setDate(now.getDate()-92);
      $scope.startToday = formatDate(now);
      console.log($scope.startToday);
      $(".teamTime1").val($scope.startToday);
      //$(".teamTime2").val($scope.today);
    };


    //最近时间
    vm.lastTm = [
      {name:'最近一周',value:1},
      {name:'最近一个月',value:2},
      {name:'最近三个月',value:3}
    ];
    vm.tmName = vm.lastTm[0].name;
    $scope.toggle = function(name){
      vm.tmName = name;
      if(name == '最近一周'){
        $scope.lastSeven();
      }else if( name == '最近一个月'){
        $scope.recentJanuary();
      }else if( name == '最近三个月'){
        $scope.recentMarch();
      }
    };


    //今天
    $scope.toDay = function(){
      var now = new Date();
      $scope.today = formatDate(now);

      $(".teamTime1").val($scope.today);
      $(".teamTime2").val($scope.today);
    };

    //昨天
    $scope.yesTerDay = function(){
      var now = new Date();
      now.setDate(now.getDate()-1);
      $scope.yesTday = formatDate(now);

      $(".teamTime1").val($scope.yesTday);
      $(".teamTime2").val($scope.yesTday);
    };


    //本周日期
    $scope.thisWeek = function(){
      var now = new Date();
      var nowWeek = now.getDay();// 当前星期
      $scope.tswkEnd = formatDate(now); // 本周结束日期
      now.setDate(now.getDate()-nowWeek);
      $scope.tswkStart = formatDate(now); // 本周开始日期

      $(".teamTime1").val($scope.tswkStart);
      $(".teamTime2").val($scope.tswkEnd);
    };
    //上周
    $scope.lastWeek = function(){
      var now = new Date();
      var nowWeek = now.getDay();
      now.setDate(now.getDate()-nowWeek-7);
      $scope.startLastWeek = formatDate(now); // 上周开始日期
      now.setDate(now.getDate()+6);
      $scope.endLastWeek = formatDate(now); // 上周结束日期
      $(".teamTime1").val($scope.startLastWeek);
      $(".teamTime2").val($scope.endLastWeek);

    };
    //本月
    $scope.thisMonth  = function(){

      var now = new Date();
      var nowDate = now.getDate();//当前日期
      $scope.endThisMonth= formatDate(now); // 本月结束日期
      now.setDate(now.getDate()-nowDate+1);
      $scope.startThisMonth = formatDate(now); // 本月开始日期

      $(".teamTime1").val($scope.startThisMonth);
      $(".teamTime2").val($scope.endThisMonth);
    };

    //上月
    $scope.lastMonth = function(){
      var now = new Date();
      var nowDate = now.getDate();//当前日期
      now.setDate(now.getDate()-nowDate+1);
      now.setMonth(now.getMonth() - 1);
      $scope.startLastMonth = formatDate(now); // 上月开始日期

      now.setMonth(now.getMonth() +1);
      now.setDate(now.getDate()-1);
      $scope.endLastMonth = formatDate(now); // 上月结束日期

      $(".teamTime1").val($scope.startLastMonth);
      $(".teamTime2").val($scope.endLastMonth);
    };


    //今天、昨天、、、、、
    vm.chose = [
      {name:'今天', id:1},
      {name:'昨天', id:2},
      {name:'本周', id:3},
      {name:'上周', id:4},
      {name:'本月', id:5},
      {name:'上月', id:6}
    ];
    vm.timeName = vm.chose[0].name;
    //选择时间
    $scope.changeDate = changeDate;
    function changeDate(name){
      vm.timeName = name;
      if(name == '今天'){
        $scope.toDay();
      }else if( name == '昨天'){
        $scope.yesTerDay();
      }else if( name == '本周'){
        $scope.thisWeek();
      }else if( name == '上周'){
        $scope.lastWeek();
      }else if( name == '本月'){
        $scope.thisMonth();
      }else if( name == '上月'){
        $scope.lastMonth();
      }
    }

    //-----下级管理-------
    //登陆状态
    $scope.loginStatus = [
      {name:'全部',value:''},
      {name:'在线',value:1},
      {name:'离线',value:0}
    ];
    $scope.defaultValue = $scope.loginStatus[0].value;

    //范围
    $scope.range = [
      {name:'全部下级',value:'all'},
      {name:'直属下级',value:''}
    ];
    $scope.rangeValue = $scope.range[0].value;
    //根据
    $scope.accordTo = [
      {name:'注册时间',value:'registerTime'},
      {name:'用户名',value:'userName'},
      {name:'余额',value:'balance'}
    ];
    $scope.accordValue = $scope.accordTo[0].value;
    //排序
    $scope.sort = [
      {name:'升序',value:'ascending'},
      {name:'倒序',value:'reverse'}
    ];
    $scope.sortValue = $scope.sort[0].value;



    //查询下级
    $scope.name = '';
    $scope.subordinate = subordinate;
    function subordinate(){

      //$scope.balanceStart = $(".balanceStart").val();
      //$scope.balanceEnd = $(".balanceEnd").val();
      //$scope.rebateStart = $(".rebateStart").val();
      //$scope.rebateEnd = $(".rebateEnd").val();
      //
      //$scope.balance = [
      //  $scope.balanceStart,
      //  $scope.balanceEnd
      //];
      //$scope.rebate = [
      //  $scope.rebateStart,
      //  $scope.rebateEnd
      //];
      var data={
        userName:$scope.name,
        ob:$scope.rangeValue
      };
      yikeYbc.subordinate(data,token)
        .then(function(data){
          $scope.subordinateUser = data.result.result;
          console.log( $scope.subordinateUser);

          $scope.remarkTotal = $scope.subordinateUser.length;
          $scope.remarkAllPage = Math.ceil($scope.remarkTotal / 10);

          //分页
          $scope.remarkDefaultPage = 1;
          $scope.nowRemarkArr = [];
          for(var i=0; i<($scope.remarkTotal < 10?$scope.remarkTotal:10);i++){
            $scope.nowRemarkArr.push($scope.subordinateUser[i]);
          }

          //下一页
          $scope.pageDownRemark = function(){
            $scope.nowRemarkArr = [];
            if($scope.remarkDefaultPage<$scope.remarkAllPage){
              $scope.remarkDefaultPage++;
            }
            for(var i=($scope.remarkDefaultPage-1)*10;i<($scope.remarkDefaultPage*10);i++){
              if(i<=$scope.remarkTotal-1){
                $scope.nowRemarkArr.push($scope.subordinateUser[i]);
              }
            }
          };
          //上一页
          $scope.pageUpRemark = function(){
            $scope.nowRemarkArr = [];
            if($scope.remarkDefaultPage>1){
              $scope.remarkDefaultPage--;
            }
            for(var i=($scope.remarkDefaultPage-1)*10;i<($scope.remarkDefaultPage*10);i++){
              if(i<=$scope.remarkTotal-1){
                $scope.nowRemarkArr.push($scope.subordinateUser[i]);
              }
            }
          };
          //go
          $scope.pageGoRemark = function(pageNowRemark){
            $scope.nowRemarkArr = [];
            if(pageNowRemark>=1&&pageNowRemark<=$scope.remarkAllPage){
              $scope.remarkDefaultPage = pageNowRemark;
            }
            for(var i=($scope.remarkDefaultPage-1)*10;i<($scope.remarkDefaultPage*10);i++){
              if(i<=$scope.remarkTotal-1){
                $scope.nowRemarkArr.push($scope.subordinateUser[i]);
              }
            }
          };
          $scope.remarkSts = data.status;
          $scope.nullRemarkData = data.result.result;
          $scope.$digest();

        });
    }

    //下级管理 - 修改备注
    $scope.changeRemark = function(id,remarkText){
      if(remarkText==''||remarkText==undefined){
        play.cozyTip('<span>请输入备注名</span>');
      }else{
        yikeYbc.modifyRemark(token,id,remarkText)
          .then(function(data){
            console.log(data);
            subordinate();
          });
      }

    };
    //下级管理-删除备注
    $scope.removeRemark = function(id){
      yikeYbc.deletedRemark(token,id)
        .then(function(data){
          $scope.remarkText = '';
          subordinate();
      });
    };

    //团队中心--彩票走势
    $scope.TeamLottery = function(){
      console.log(123);
      $scope.start_time = $(".teamTime1").val();
      $scope.end_time = $(".teamTime2").val();

      $scope.times=[
        $scope.start_time,
        $scope.end_time
      ];
      yikeYbc.TeamLottery($scope.times,token)
        .then(function(data){
        });
    };

    //下级管理-添加下级
    $scope.addSubordinate = function(type){
      var data = {
        subordinateUser:$scope.subordinateUserName,
        subordinatePassWord:$scope.subordinatePassWord,
        highRebate:$scope.highRebate,
        lowRebate:$scope.lowRebate
      };
      if($scope.subordinateUserName == '' || $scope.subordinateUserName == undefined){
        play.cozyTip('<span>请输入用户名</span>');
      }else if($scope.subordinateUserName.length>15 || $scope.subordinateUserName.length < 6 ){
        play.cozyTip('<span>用户名只能由6-15位的字母和数字组成!</span>');
      }else if($scope.subordinatePassWord == '' || $scope.subordinatePassWord == undefined){
        play.cozyTip('<span>请输入密码</span>');
      }else{
        yikeYbc.addSubordinate(token,type,data)
          .then(function(data){
            console.log(data);
            if(data.status == 1){
              //alert('添加成功');
              play.cozyTip(data.result.result);
            }else{
              play.cozyTip(data.result.result);
            }
          });
      }
    };



    /*---------开户中心----------*/
    //开户记录
    $scope.defaultPage = 1;
    $scope.openAccount=openAccount;
     //openAccount();
    function openAccount(){
      yikeYbc.openAccount(token)
        .then(function(data){
          $scope.sts = data.status;
          //console.log($scope.sts);
          $scope.listData = data.result.result;
          $scope.allNum = $scope.listData.length;
          $scope.allPage = Math.ceil($scope.allNum / 10);

          //分页
          $scope.defaultPage = 1;
          $scope.nowArr = [];
          for(var i=0; i<($scope.allNum < 10?$scope.allNum:10);i++){
            $scope.nowArr.push($scope.listData[i]);
          }

          //下一页
          $scope.pageDown = function(){
            $scope.nowArr = [];
            if($scope.defaultPage<$scope.allPage){
              $scope.defaultPage++;
            }
            for(var i=($scope.defaultPage-1)*10;i<($scope.defaultPage*10);i++){
              if(i<=$scope.allNum-1){
                $scope.nowArr.push($scope.listData[i]);
              }
            }
          };
          //上一页
          $scope.pageUp = function(){
            $scope.nowArr = [];
            if($scope.defaultPage>1){
              $scope.defaultPage--;
            }
            for(var i=($scope.defaultPage-1)*10;i<($scope.defaultPage*10);i++){
              if(i<=$scope.allNum-1){
                $scope.nowArr.push($scope.listData[i]);
              }
            }
          };
          //go
          $scope.pageGo = function(pageNow){
            $scope.nowArr = [];
            if(pageNow>=1&&pageNow<=$scope.allPage){
              $scope.defaultPage = pageNow;
            }
            for(var i=($scope.defaultPage-1)*10;i<($scope.defaultPage*10);i++){
              if(i<=$scope.allNum-1){
                $scope.nowArr.push($scope.listData[i]);
              }
            }
          };
          $scope.$digest();
      });
    }
    //删除开户记录
    $scope.removeAccount = function(id){
      yikeYbc.removeAccount(token,id)
        .then(function(data){
          console.log(data);
          if(data.status == 1 ){
            $scope.nowArr ='';
            $scope.$digest();
            play.cozyTip("<span>删除成功</span>");
            openAccount();
          }
      });
    };

    //快速调点
    $scope.fastPoint = function(){
      $scope.highRebate = 0;
      $scope.lowRebate = 0;
    };
    //角色
    vm.accountType = [
      {name:'代理',value:1},
      {name:'会员',value:2}
    ];
    vm.accountValue = vm.accountType[0].value;
    //新增用户
    $scope.accountNew = function(type){
      var data = {
        highRebate:$scope.highRebate,
        lowRebate:$scope.lowRebate,
        remarks:$scope.remarks
      };
      yikeYbc.newAccount(token,type,data)
        .then(function(data){
          //openAccount();
      });
    };

    //下级取款记录
      $scope.draw = function(){
      $scope.start_time = $(".teamTime1").val();
      $scope.end_time = $(".teamTime2").val();
      $scope.times=[
        $scope.start_time,
        $scope.end_time
      ];
      //console.log($scope.times);
      yikeYbc.drawRecord($scope.times,token)
        .then(function(data){
          $scope.state = data.status;
        });
    };





  }
})();




/**
 * Created by HL on 2016/12/28.
 */
(function () {
  'use strict';

  angular
    .module('updapassword.controller',[])
    .controller('UpdapasswordCtrl',UpdapasswordCtrl);

  UpdapasswordCtrl.$inject = ['$scope','$yikeUtils','$ionicHistory','$ionicLoading'];
  /* @ngInject */
  function UpdapasswordCtrl($scope,$yikeUtils,$ionicHistory,$ionicLoading){
    var token=localStorage.getItem('token');
    $scope.updata=updata;
    $scope.modificationWithdrawDepositPassword=modificationWithdrawDepositPassword;
    $scope.user={
      oldPassword:'',
      newPassword:'',
      confirmPassword:''
    };
    $scope.user={
      oldPasswords:'',
      newPasswords:'',
      confirmPasswords:''
    };
    $scope.status=0;
    init();
    function init(){
    yikeYbc.jichu(token)
    .then(function(data){
      $scope.data=data.result.result;
      $scope.$digest();
    })
    }
    $scope.selectSort=function(i){
      $scope.status=i;
    };
    //修改登录密码
    function updata(){
      if ($scope.user.oldPassword == '' || $scope.user.newPassword == '') {
        $yikeUtils.toast('请先输入提现密码');
      }else if ($scope.user.oldPassword.length < 6 || $scope.user.oldPassword.length > 12 || $scope.user.newPassword.length < 6 || $scope.user.newPassword.length > 12) {
        $yikeUtils.toast('提现密码位数(6~12)');
      } else if ($scope.user.confirmPassword != $scope.user.newPassword) {
        $yikeUtils.toast('两次密码不一致');
      }else {
        yikeYbc.changeLoginPwd(token,$scope.user.oldPassword,$scope.user.newPassword)
          .then(function (data) {
          if(data.status==1){
          play.cozyTip(data.result.result)
          }else {
          play.cozyTip('密码修改失败')
          }
          });
       $scope.$digest();
      }

     }
     $scope.loginrest=loginrest;
     function loginrest(){
      $scope.user.oldPassword='';
      $scope.user.newPassword='';
      $scope.user.confirmPassword='';
     }
    //修改资金密码
    function modificationWithdrawDepositPassword() {
      if ($scope.user.oldPasswords == '' || $scope.user.newPasswords == '') {
        $yikeUtils.toast('请先输入提现密码');
      }else if ($scope.user.oldPasswords.length < 6 || $scope.user.oldPasswords.length > 12 || $scope.user.newPasswords.length < 6 || $scope.user.newPasswords.length > 12) {
        $yikeUtils.toast('提现密码位数(6~12)');
      } else if ($scope.user.confirmPasswords != $scope.user.newPasswords) {
        $yikeUtils.toast('两次密码不一致');
      }else {

        yikeYbc.changeWithdrawPwd(token,$scope.user.oldPasswords,$scope.user.newPasswords)
          .then(function (data) {
            if(data.status==1){
              play.cozyTip(data.result.result)
            }else {
              play.cozyTip('密码修改失败')
            }
            $scope.$digest();
          })
      }
    }
   $scope.rest=rest;
   function rest(){
     $scope.user.oldPasswords='';
     $scope.user.newPasswords='';
     $scope.user.confirmPasswords='';
   }
  }
})();

/**
 * Created by NicoleQi on 2016/11/30.
 */
function activeAction(){
    sethight();
    $('.dowebok').flexslider({
        animation: 'slide',
        pauseOnHover: true,
        slideshow: true,
        slideshowSpeed: 3000,
        prevText: '上一个',
        nextText: '下一个'
    });
    choseActiveKind();
}

var pwidth;
var phight;
function sethight(){
     pwidth=$(document).width();
     phight=240*(pwidth/505);
     $('.moduletable-banner').css('width', pwidth);
     $('.moduletable-banner').css('height', 400);
     $('.flex-title').css('margin-top', phight-40);
     $('.slides img').css('width', pwidth);
     $('.slides img').css('width', 958);
     $('.slides img').css('height', 548);
}

function choseActiveKind(){
    $(".active-kind a").click(function(){
        $(this).siblings().removeClass("change-active");
        $(this).addClass("change-active");
    })
}


//彩票logo
var LOTTERY_LOGO = {
    "1": "img/game/1.png",
    "2": "img/game/jiangxss.png",
    "3": "img/game/2.png",
    "4": "img/game/fuc.png",
    "5": "img/game/pail.png",
    "6": "img/game/jiangx.png",
    "7": "img/game/xinjiang.png",
    "8": "img/game/cq11x5.png",
    "9": "img/game/11x5.png",
    "10": "img/game/shan.png",
    "11": "img/game/shif.png",
    "12": "img/game/guang.png",
    "13": "img/game/hunank.png",
    "14": "img/game/shssl.png",
    "15": "img/game/bjkl8.png",
    "16": "img/game/liuhec.png",
    "17": "img/game/pl5.png",
    "18": "img/game/zuqjc.png",
    "19": "img/game/baijial.png",
    "20": "img/game/an.png",
    "21": "img/game/xingy.png",
    "22": "img/game/shangh.png",
    "23": "img/game/js.png",
    "24": "img/game/k3.png",
    "25": "img/game/hubk3.png",
    "26": "img/game/jil.png",
    "27": "img/game/pk.png",
    "28": "img/game/mmc.png",
    "29": "img/game/ff.png",
    "30": "img/game/5f.png",
    "32": "img/game/28.png",
    "42": "img/game/beij.png",
    "43": "img/game/gx.png",
    "46": "img/game/beij5.png",
    "47": "img/game/hang1.5.png",
    "48": "img/game/canada.png",
    "49": "img/game/taiw.png",
    "50": "img/game/beij28.png",
    "51": "img/game/hang28.png", 
    "52": "img/game/canada28.png",
    "53":"img/game/taiwan28.png",
    "62":"img/game/xjp2fc.png",
    "65":"img/game/dj15fc.png",
    "91":"img/game/els15fc.png",
    "96":"img/game/xxn45mc.png"
};

//银行
var BANK_LIST = {
    "101": "工商银行",
    "102": "农业银行",
    "103": "建设银行",
    "104": "中国银行",
    "105": "招商银行",
    "106": "交通银行",
    "107": "民生银行",
    "108": "光大银行",
    "109": "浦发银行",
    "110": "兴业银行",
    "111": "中信银行",
    "112": "邮政储蓄",
    "113": "平安银行",
    "114": "广发银行",
    "115": "上海银行",
    "116": "北京银行",
    "117": "华夏银行",
    "118": "上海农商",
    "119": "北京农商",
    "120": "渤海银行",
    "121": "支付宝",
    "122": "财付通"
};
//棋牌游戏结果
var CHESS_RESULT = {
    '-1': '输',
    '0': '和',
    '1': '赢'
};
//用户类型
var USER_TYPE = {
    "1" : "会员",
    "0" : "代理"
};
// 充值/取款审核状态
var MONEY_AUDIT_STATE = {
    "0" : "待审核",
    "1" : "审核通过",
    "2" : "<font color='red'>不通过</font>"
};

//游戏分类
var GAME_TYPE = {
    "1" : "棋牌",
    "2" : "彩票",
    "3" : "皇冠体育",
    "4" : "PT老虎机",
    "5" : "NT老虎机",
    "6" : "AG女优馆",
    "7" : "DS太阳城",
    "8" : "PLAYTECH",
    "9" : "MG老虎机",
    "10" : "BBIN",
    "11" : "BBIN"
};

var GAME_NAME = {
    "pt" : "PT老虎机",
    "nt" : "NT老虎机",
    "mg" : "MG老虎机",
    "lottery" : "彩票",
    "ag" : "AG女优馆",
    "sport" : "皇冠体育",
    "qps" : "棋牌",
    "ig" : "DS太阳城",
    "playtech" : "PLAYTECH",
    "bbin" : "BBIN",
    "agbbin" : "BBIN"
};
/**** 需要转入转出的游戏 ****/
var TRANSFER_GAME_LIST = [
    "sport", "ag", "pt", "nt", "mg", "qps", "ig", "playtech", 'bbin', 'agbbin'
];
var CHANGE_MONEY_TYPE_CLASSIFY = [
    {name: '全部', ls:['']},
    {name: '入款', ls: ['1', '101', '102', '103']},
    {name: '出款', ls: ['2', '121', '122']},
    {name: '转账', ls: ['3', '4', '13', '14']},
    {name: '彩票', ls: ['204', '205', '206', '209', '210', '211', '212', '213', '214', '215', '216']},
    {name: '活动', ls: ['17', '18', '19', '20', '21', '22', '104','105', '106','125', '126', '127']},
    {name: '分红', ls: ['15', '16', '108', '128']},
    {name: '其他', ls: ['12', '23', '107', '123', '124']}
];
var CAPITAL_TYPE_CLASSIFY = {
    income: ['1', '101', '102', '103'],
    takeout: ['2', '121', '122'],
    activity: ['17', '18', '19', '20', '21', '22', '104','105', '106','125', '126', '127']
};
//资金流水变动类型
var CHANGE_MONEY_TYPE_CAPTION = {
    "1": "充值",
    "2": "出款",
    "3": "转入游戏",
    "4": "游戏转出",
    "10": "推荐奖励",
    "12": "其他",
    "13": "转账出款",
    "14": "转账入款",
    "15": "分红",
    "16": "分红撤销",
    "17": "消费退佣",
    "18": "盈亏退佣",
    "19": "充值退佣",
    "20": "活动奖励",
    "21": "日工资",
    "22": "日工资撤销",
    "23": "会员返水",
    "101": "人工入款",
    "102": "冲账-取消出款",
    "103": "冲账-重复出款",
    "104": "人工存入-入款优惠",
    "105": "人工存入-返点优惠",
    "106": "人工存入-活动优惠",
    "107": "负数额度归零",
    "108": "人工存入-红利",
    "121": "冲账-入款误存",
    "122": "手动申请出款",
    "123": "负数额度回冲",
    "124": "扣除非法下注派彩",
    "125": "人工扣除-入款优惠",
    "126": "人工扣除-返点优惠",
    "127": "人工扣除-活动优惠",
    "128": "人工扣除-红利",
    "204": "彩票下注",
    "205": "彩票返水",
    "206": "彩票中奖",
    "209": "彩票撤单",
    "210": "彩票活动",
    "211": "彩票团队赚水",
    "212": "彩票冻结金额",
    "213": "彩票解冻金额",
    "214": "彩票中奖撤销",
    "215": "彩票返水撤销",
    "216": "彩票团队赚水撤销"
};
// 彩种分类
var LOTTERY_CLASSIFY = {
    gp: ['1', '2', '3', '7', '29', '30', '6', '8', '9', '10', '20', '22', '23', '24', '25', '26', '11', '12', '13', '21', '27'],
    dp: ['4', '5', '14', '17']
};
var cpList = [
    {
        title:'时时彩',
        row:[
            {cpId:1, wfId:150001},
            {cpId:3, wfId:150001},
            {cpId:7, wfId:150001},
        ],
        img:'ssc'   
    },
    {
        title:'十一选五',
        row:[
            {cpId:6,wfId:44}
        ],
        img:'el-five'
    },
    {
        title:'快三',
        row:[
            {cpId:23,wfId:500001}
        ],
        img:'ks'
    },
    {
        title:'快乐十分',
        row:[
            {cpId:11,wfId:61}
        ],
        img:'kl'
    },
    {
        title:'快乐彩',
        row:[
            {cpId:62,wfId:150001}
        ],
        img:'klc'
    },
    {
        title:'北京赛车',
        row:[
            {cpId:16,wfId:81}
        ],
        img:'bjsc'
    },
    {
        title:'福彩',
        row:[
            {cpId:4,wfId:24}
        ],
        img:'fc'
    },
]
//彩种
var LOTTERY= {
    "1": "重庆时时彩",
    "2": "江西时时彩",
    "3": "天津时时彩",
    "4": "福彩3D",
    "5": "排列三",
    "6": "江西11选5",
    "7": "新疆时时彩",
    "8": "重庆11选5",
    "9": "广东11选5",
    "10": "山东11选5",
    "11": "天津快乐十分",
    "12": "广东快乐十分",
    "13": "湖南快乐十分",
    "14": "上海时时乐",
    "15": "北京快乐8",
    "16": "香港六合彩",
    "17": "排列五",
    "18": "足球竞猜",
    "19": "百家乐",
    "20": "安徽11选5",
    "21": "重庆幸运农场",
    "22": "上海11选5",
    "23": "江苏快3",
    "24": "安徽快3",
    "25": "湖北快3",
    "26": "吉林快3",
    "27": "PK拾",
    "28": "秒秒彩",
    "29": "分分彩",
    "30": "五分彩",
    "46": "北京5分彩",
    "47": "韩国1.5分彩",
    "48": "加拿大3.5分彩",
    "49": "台湾5分彩",
    "32": "幸运28",
    "42": "北京快3",
    "43": "广西快3",
    //"32": "幸运28",
    "50": "北京28",
    "51": "韩国28",
    "52": "加拿大28",
    "53": "台湾28",
    //"59": "分分3D",
    //"60": "分分11选5",
    "62": "新加坡2分彩",
    "65": "东京1.5分彩",
    "91": "俄罗斯1.5分彩",
    "96": "新西兰45秒彩"
};
//彩票类型
var LOTTERY_TYPE= {
    '1': '时时彩',
    '2': '福彩',
    '3': '11选5',
    '4': '快乐十分',
    '5': '快乐8',
    '6': '香港六合彩',
    '7': '足球竞猜',
    '8': '百家乐',
    '9': '快三',
    '10': 'pk10',
    '11': '幸运28',
    '14': '幸运农场'
};
//彩种分类
var LOTTERY_METHOD= {
    '1': '1',
    '2': '1',
    '3': '1',
    '46': '1',
    '47': '1',
    '48': '1',
    '49': '1',
    '4': '2',
    '5': '2',
    '6': '3',
    '7': '1',
    '8': '3',
    '9': '3',
    '10': '3',
    '11': '4',
    '12': '4',
    '13': '4',
    '14': '2',
    '15': '5',
    '16': '6',
    '17': '1',
    '18': '7',
    '19': '8',
    '20': '3',
    //'21': '14',
    '21': '4',
    '22': '3',
    '23': '9',
    '24': '9',
    '25': '9',
    '26': '9',
    '27': '10',
    '28': '1',
    '29': '1',
    '30': '1',
    '32': '13',
    '42': '9',
    '43': '9',
    '50': '13',
    '51': '13',
    '52': '13',
    '53': '13',
    '62': '1',
    '65': '1',
    '91': '1',
    '96': '1'
};

var PLAY_METHOD = {
    '1': {
        '1': '后三一码不定',
        '2': '后三直选复式',
        '3': '后三直选单式',
        '4': '后三组三复式',
        '5': '后三组三单式',
        '6': '后三组六复式',
        '7': '后三组六单式',
        '8': '后三直选和值',
        '9': '五星定位胆',
        '10': '五星前二复式',
        '11': '五星前二单式',
        '12': '后二直选复式',
        '13': '后二直选单式',
        '14': '后二组选复式',
        '15': '后二组选单式',
        '16': '后二大小单双',
        '17': '前三直选复式',
        '18': '前三直选单式',
        '19': '前三一码不定',
        '20': '前三组三复式',
        '21': '前三组三单式',
        '22': '前三组六复式',
        '23': '前三组六单式',
        '120001': '任2直选单式',
        '120002': '任2直选复式',
        '120003': '任2组选单式',
        '120004': '任2组选复式',
        '120038': '任2直选和值',
        '120039': '任2组选和值',
        '120203': '前二组选单式',
        '120204': '前二组选复式',
        '120205': '前二大小单双',
        '120232': '前二直选跨度',
        '120233': '前二组选包胆',
        '120238': '前二直选和值',
        '120239': '前二组选和值',
        '123532': '后二直选跨度',
        '123533': '后二组选包胆',
        '123538': '后二直选和值',
        '123539': '后二组选和值',
        '130001': '任3直选单式',
        '130002': '任3直选复式',
        '130030': '任3混合',
        '130038': '任3直选和值',
        '130039': '任3组选和值',
        '130041': '任3组三单式',
        '130042': '任3组三复式',
        '130043': '任3组六单式',
        '130044': '任3组六复式',
        '130307': '前三组选混合',
        '130308': '前三直选和值',
        '130331': '前三直选组合',
        '130332': '前三直选跨度',
        '130333': '前三组选包胆',
        '130337': '前三大小单双',
        '130339': '前三组选和值',
        '130352': '前三二码不定',
        '131401': '中三直选单式',
        '131402': '中三直选复式',
        '131403': '中三组三单式',
        '131404': '中三组三复式',
        '131405': '中三组六单式',
        '131406': '中三组六复式',
        '131408': '中三直选和值',
        '131409': '中三一码不定',
        '131431': '中三直选组合',
        '131432': '中三直选跨度',
        '131433': '中三组选包胆',
        '131437': '中三大小单双',
        '131439': '中三组选和值',
        '131452': '中三二码不定',
        '132407': '后三组选混合',
        '132531': '后三直选组合',
        '132532': '后三直选跨度',
        '132533': '后三组选包胆',
        '132537': '后三大小单双',
        '132539': '后三组选和值',
        '132552': '后三二码不定',
        '140001': '任4直选单式',
        '140002': '任4直选复式',
        '140041': '任4组选24',
        '140042': '任4组选12',
        '140043': '任4组选6',
        '140044': '任4组选4',
        '140401': '前四直选单式',
        '140402': '前四直选复式',
        '140431': '前四直选组合',
        '140441': '前四组选24',
        '140442': '前四组选12',
        '140443': '前四组选6',
        '140444': '前四组选4',
        '140451': '前四一码不定',
        '140452': '前四二码不定',
        '141501': '后四直选单式',
        '141502': '后四直选复式',
        '141531': '后四直选组合',
        '141541': '后四组选24',
        '141542': '后四组选12',
        '141543': '后四组选6',
        '141544': '后四组选4',
        '141551': '后四一码不定',
        '141552': '后四二码不定',
        '150001': '五星直选复式',
        '150030': '五星直选单式',
        '150031': '五星直选组合',
        '150041': '五星组选120',
        '150042': '五星组选60',
        '150043': '五星组选30',
        '150044': '五星组选20',
        '150045': '五星组选10',
        '150046': '五星组选5',
        '150052': '五星二码不定',
        '150053': '五星三码不定',
        '150060': '百家乐',
        '150061': '一帆风顺',
        '150062': '好事成双',
        '150063': '三星报喜',
        '150064': '四季发财',
        '150065': '中三组选混合',
        '13003001': '任3混合组三',
        '13003002': '任3混合组六',
        '13033303': '包胆组三',
        '13033306': '包胆组六',
        '13033903': '和值组三',
        '13033906': '和值组六',
        '15003101': '一星',
        '15003102': '二星',
        '15003103': '三星',
        '15003104': '四星',
        '15003105': '五星',
        '15006001': '庄闲',
        '15006002': '对子',
        '15006003': '豹子',
        '15006004': '天王'
    },
    '2': {
        '13033303': '包胆组三',
        '13033306': '包胆组六',
        '13033903': '和值组三',
        '13033906': '和值组六',
        '4': '后三组三复式',
        '6': '后三组六复式',
        '24': '三星直选复式',
        '25': '三星直选单式',
        '26': '三星组三复式',
        '27': '三星组三单式',
        '28': '三星组六复式',
        '29': '三星组六单式',
        '30': '前一直选复式',
        '31': '前二直选复式',
        '32': '前二直选单式',
        '33': '不定位复式',
        '34': '后一直选',
        '35': '后二直选复式',
        '36': '后二直选单式',
        '37': '三星直选和值',
        '220203': '前二组选复式',
        '220204': '前二组选单式',
        '220205': '前二大小单双',
        '221303': '后二组选复式',
        '221304': '后二组选单式',
        '221305': '后二大小单双',
        '230007': '三星组选混合',
        '230008': '三星组选和值',
        '230009': '三星定位胆',
        '230010': '三星二码胆',
        '230031': '三星趣味012',
        '230032': '三星趣味大小',
        '230033': '三星趣味质合',
        '230034': '三星趣味奇偶',
        '23000803': '组三和值',
        '23000806': '组六和值'
    },
    '3': {
        '38': '前一直选',
        '39': '前二直选复式',
        '40': '前二组选复式',
        '41': '前二组选胆拖',
        '42': '任选2中2复式',
        '43': '任选二胆拖',
        '44': '前三直选复式',
        '45': '前三直选单式',
        '46': '前三组选复式',
        '47': '前三组选胆拖',
        '48': '任选3中3复式',
        '49': '任选三胆拖',
        '50': '任选4中4复式',
        '51': '任选四胆拖',
        '52': '任选5中5复式',
        '53': '任选五胆拖',
        '54': '任选五单式',
        '55': '任选6中5复式',
        '56': '任选六胆拖',
        '57': '任选7中5复式',
        '58': '任选七胆拖',
        '59': '任选8中5复式',
        '60': '任选八胆拖',
        '310005': '任选1中1复式',
        '310006': '任选1中1单式',
        '320006': '任选2中2单式',
        '320201': '前二组选单式',
        '320202': '前二直选单式',
        '330006': '任选3中3单式',
        '330301': '前三组选单式',
        '330303': '前三不定胆',
        '330304': '前三定位胆',
        '340006': '任选4中4单式',
        '350006': '任选5中5单式',
        '350008': '定单双',
        '350009': '猜中数',
        '360006': '任选6中5单式',
        '370006': '任选7中5单式',
        '380006': '任选8中5单式'
    },
    '4': {
        '61': '首位数投',
        '62': '首位红投',
        '63': '二连直',
        '64': '二连组',
        '65': '快乐二',
        '66': '前三直',
        '67': '前三组',
        '68': '快乐三',
        '69': '快乐四',
        '70': '快乐五'
    },
    '5': {
        '71': '任选一',
        '72': '任选二',
        '73': '任选三',
        '74': '任选四',
        '75': '任选五',
        '76': '任选六',
        '77': '任选七',
        '78': '上下盘',
        '79': '奇偶盘',
        '80': '和值大小单双',
        '711': '任选一中一',
        '721': '任选二中二',
        '731': '任选三中三',
        '732': '任选三中二',
        '741': '任选四中四',
        '742': '任选四中三',
        '743': '任选四中二',
        '751': '任选五中五',
        '752': '任选五中四',
        '753': '任选五中三',
        '761': '任选六中六',
        '762': '任选六中五',
        '763': '任选六中四',
        '764': '任选六中三',
        '771': '任选七中七',
        '772': '任选七中六',
        '773': '任选七中五',
        '774': '任选七中四',
        '775': '任选七中零',
        '781': '中盘',
        '782': '上盘',
        '783': '下盘',
        '791': '和盘',
        '792': '奇盘',
        '793': '偶盘',
        '801': '大单',
        '802': '大双',
        '803': '小单',
        '804': '小双'
    },
    '6': {
        '81': '特码直选(A)',
        '82': '特码直选(B)',
        '83': '特码大小单双',
        '84': '四肖',
        '85': '平特色波',
        '86': '平特尾数',
        '87': '六肖',
        '88': '五不中',
        '89': '三全中',
        '90': '二全中',
        '91': '三中二',
        '92': '平码直选',
        '93': '平特一肖',
        '831': '特码大小单双（大）',
        '832': '特码大小单双（小）',
        '833': '特码大小单双（单）',
        '834': '特码大小单双（双）',
        '835': '特码大小单双（和）',
        '841': '四肖（中）',
        '851': '特码色波（红）',
        '852': '特码色波（蓝）',
        '853': '特码色波（绿）',
        '861': '平特尾数（0）',
        '862': '平特尾数（1-9）',
        '871': '六肖（中）',
        '872': '六肖（不中）',
        '873': '六肖（和）',
        '881': '五不中',
        '891': '三全中',
        '901': '二全中',
        '911': '三中二（中三）',
        '912': '三中二（中二）',
        '921': '平码直选',
        '931': '平特一肖（本命生肖）',
        '932': '平特一肖（其他生肖）'
    },
    '7': {
        '94': '胜负',
        '95': '总比分',
        '96': '总进球',
        '97': '半全场胜负',
        '98': '上下盘单双'
    },
    '8': {
        '99': '一星百家乐',
        '100': '二星百家乐',
        '991': '一星百家乐(庄)',
        '992': '一星百家乐(闲)',
        '993': '一星百家乐(和)',
        '1001': '二星百家乐(庄)',
        '1002': '二星百家乐(闲)',
        '1003': '二星百家乐(和)'
    },
    '9': {     //快三
        '500001': '二不同标准',
        '500002': '二不同单式',
        '500003': '二不同胆拖',
        '500004': '二同号标准',
        '500005': '二同号单式',
        '500006': '二同号复选',
        '500007': '三不同标准',
        '500008': '三不同单式',
        '500009': '三不同胆拖',
        '500010': '三不同和值',
        '500011': '三同号单选',
        '500012': '三同号通选',
        '500013': '三连号通选',
        '500029': '大小单双',
        '500014': '和值'
    },
    '10': {     //pk10
        '400001': '第一名',
        '400002': '第二名',
        '400003': '第三名',
        '400004': '第四名',
        '400005': '第五名',
        '400006': '第六名',
        '400007': '第七名',
        '400008': '第八名',
        '400009': '第九名',
        '400010': '第十名',
        '400011': '猜前一',
        '400012': '猜前二',
        '400013': '猜前三',
        '400014': '猜前四',
        '400015': '猜前五',
        '400016': '猜前六',
        '400017': '猜前七',
        '400018': '猜前八',
        '400019': '猜前九',
        '400020': '猜前十',
        '400021': '猜第一单式',
        '400022': '猜第二单式',
        '400023': '猜第三单式',
        '400024': '猜第四单式',
        '400025': '猜第五单式',
        '400026': '猜第六单式',
        '400027': '猜第七单式',
        '400028': '猜第八单式',
        '400029': '猜第九单式',
        '400030': '猜第十单式',
        '400031': '猜前一单式',
        '400032': '猜前二单式',
        '400033': '猜前三单式',
        '400034': '猜前四单式',
        '400035': '猜前五单式',
        '400036': '猜前六单式',
        '400037': '猜前七单式',
        '400038': '猜前八单式',
        '400039': '猜前九单式',
        '400040': '猜前十单式',
        '400041': '定位胆',
        '400051': '冠军大小单双',
        '400052': '亚军大小单双',
        '400053': '季军大小单双',
        '400054': '冠亚和值',
        '400055': '冠亚季和值',
        '400056': '龙虎斗'
    },
    '13': {
        '600001': '猜数字',
        '600002': '大小单双',
        '600003': '波色',
        '600004': '特码包三',
        '600005': '特殊组合',
        '600006': '大单小单大双小双',
        '600007': '极大极小'
    },
    '14': {
        '61': '首位数投',
        '62': '首位红投',
        '63': '二连直',
        '64': '二连组',
        '65': '快乐二',
        '66': '前三直',
        '67': '前三组',
        '68': '快乐三',
        '69': '快乐四',
        '70': '快乐五'
    }
};

//订单状态
var LOTTERY_STATUS= {
    '1': '未开奖',
    '2': '未中奖',
    '3': '撤销',
    '4': '中奖',
    '5': '异常'
};

//追单状态
var TRACE_STATUS= {
    '1': '进行中',
    '2': '已完成',
    '3': '取消'
};
//模式
var LOTTERY_MODES= {
    '0': '元',
    '1': '角',
    '2': '分',
    '3': '厘'
};
//帐变类型
var BILL_TYPE= {
    '0': '其它',
    '1': '取款申请',
    '2': '取款申请退回',
    '3': '存款',
    '4': '下注',
    '5': '返点',
    '6': '中奖',
    '7': '转入',
    '8': '转出',
    '9': '撤单',
    '10': '活动',
    '11': '棋牌',
    '12': '真人游戏'
};
//取款状态
var DRAW_STATUS= {
    '1': '申请中',
    '2': '已支付',
    '3': '已退回'
};

//密保问题
var QUESTIONS= {
    '1': [
        {id: 1, text: "您高中的班主任的名称是？"},
        {id: 2, text: "您母亲的生日是？"},
        {id: 3, text: "您母亲的姓名是？"},
        {id: 4, text: "您配偶的生日是？"},
        {id: 5, text: "您学号（或工号）是？"}
    ],
    '2': [
        {id: 1, text: "您父亲的生日是？"},
        {id: 2, text: "您父亲的姓名是？"},
        {id: 3, text: "您配偶的姓名是？"},
        {id: 4, text: "您小学的班主任的姓名是?"}
    ],
    '3': [
        {id: 1, text: "对您影响最大的人的名字是？"},
        {id: 2, text: "您初中的班主任的姓名是？"},
        {id: 3, text: "您最熟悉的童年好友的名字是？"},
        {id: 4, text: "您最熟悉的学校宿舍室友的名字是？"}
    ]
};

var PLAY_FILTER= {
    '1': [/*'150031','150060','141531','132531','132532','132407','132539','132533',
     '130331','130332','130307','130339','130333','123532','123539','123533',
     '120232','120239','120233','120001','120038','120003','120039',
     '130038','130041','130044','130043','130039','140001','150041',
     '150042','150043','150044','150045','150046','150060','150061','150062',
     '150063','150064','141541','141542','141543','141544','140041','140042',
     '140043','140044'*/'150060'],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [82, 92, 86, 88, 89, 90, 91, 93, 84, 87, 83, 85],
    '7': [],
    '8': [],
    '9': [],
    '10': [],
    '11': [],
    '12': [],
    '13': [],
    '14': []
};

var HIDDEN_LOTTERY_MONEY= {
    '1': [/*'150031','150060','141531','130030','130307','132407','120039','120239',
     '123539','130039','130339','131439','132539','120233','123533','130333',
     '131433','132533','120205','16','130337','132537','1','19','131452',
     '130352','141551','141552','150052','150053','14'*/],
    '2': [/*'26','27','28','29','220203','220204','221303','221304'*/],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '7': [],
    '8': [],
    '9': [],
    '10': [],
    '11': [],
    '12': [],
    '13': [],
    '14': []
};

var HIDDEN_LOTTERY_BONUS= {
    '1': ['130307', '130309', '130333', '131439', '131433', '132427', '132539', '132533', '131439'
        , '131539', '130030', '130039'],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '7': [],
    '8': [],
    '9': [],
    '10': [],
    '11': [],
    '12': [],
    '13': [],
    '14': []
};
var NOTICE_TYPE = {
    "4": "系统公告",
    "5": "游戏公告",
    "6": "体育公告"
};
// AG厅类型
var AG_ROUND_NAME = {
    'DSP': '国际厅',
    'AGQ': '旗舰厅',
    'VIP': '包桌厅',
    'SLOT': '电子游戏',
    'LED': '竞咪厅',
    'LOTTO': '彩票'
};
// AG设备类型
var AG_DEVICE_TYPE = {
    '0': '电脑',
    '1': '手机'
};
var AG_TRANSFER_DATA_TYPE = {
    HTR: '转账(捕鱼)',
    TR: '转账',
    LGR: '彩票结果',
    TEXBR: '下注',
    TEXGR: '棋牌结果',
    GR: '游戏结果'
};
// AG 数据类型(data_type)
var AG_DATA_TYPE = {
    BR: '下注',
    HBR: '下注',
    HTR: '转账(捕鱼)',
    EBR: '下注',
    TR: '转账',
    LBR: '下注',
    LGR: '彩票结果',
    TEXBR: '下注',
    TEXGR: '棋牌结果',
    GR: '游戏结果'
};
// AG 转账类别(transfer_type)
var AG_TRANSFER_TYPE = {
    OUT: '转出额度',
    IN: '转入额度',
    RECALC: '重新派彩',
    GBED: '代理修改額度',
    RECKON: '派彩',
    BET: '下注',
    RECALC_ERR: '重新派彩时扣款失败',
    CHANGE_CUS_BALANCE: '修改玩家账户额度',
    CHANGE_CUS_CREDIT: '修改玩家信用额度',
    RESET_CUS_CREDIT: '重置玩家信用额度',
    DONATEFEE: '玩家小费',
    CANCEL_BET: '系统取消下注',
    CANCEL_BET_ERR: '系统取消下注失败',
    PROPFEE: '礼物',
    withdraw: '转出额度',
    deposit: '转入额度',
    1: '場景捕魚',
    2: '抽獎',
    3: '轉帳',
    5: '任務獎勵',
    7: '捕魚王獎勵',
    RED_POCKET: '送紅包'
};
// AG 游戏名称
var AG_GAME_NAME = {
    BAC: '百家乐',
    CBAC: '包桌百家乐',
    LINK: '连环百家乐',
    DT: '龙虎',
    SHB: '骰宝',
    ROU: '轮盘',
    FT: '番攤',
    LBAC: '竞咪百家乐',
    ULPK: '终极德州扑克',
    SBAC: '保险百家乐',
    SL1: '巴西世界杯',
    SL2: '疯狂水果店',
    SL3: '3D 水族馆',
    PK_J: '视频扑克(杰克高手)',
    SL4: '极速赛车',
    PKBJ: '新视频扑克(杰克高手)',
    FRU: '水果拉霸',
    HUNTER: '捕鱼王',
    SLM1: '美女沙排(沙滩排球)',
    SLM2: '运财羊(新年运财羊)',
    SLM3: '武圣传',
    SC01: '幸运老虎机',
    TGLW: '极速幸运轮',
    SLM4: '武则天',
    TGCW: '赌场战争',
    SB01: '太空漫游',
    SB02: '复古花园',
    SB03: '关东煮',
    SB04: '牧场咖啡',
    SB05: '甜一甜屋',
    SB06: '日本武士',
    SB07: '象棋老虎机',
    SB08: '麻将老虎机',
    SB09: '西洋棋老虎机',
    SB10: '开心农场',
    SB11: '夏日营地',
    SB12: '海底漫游',
    SB13: '鬼马小丑',
    SB14: '机动乐园',
    SB15: '惊吓鬼屋',
    SB16: '疯狂马戏团',
    SB17: '海洋剧场',
    SB18: '水上乐园',
    SB25: '土地神',
    SB26: '布袋和尚',
    SB27: '正财神',
    SB28: '武财神',
    SB29: '偏财神',
    SB19: '空中战争',
    SB20: '摇滚狂迷',
    SB21: '越野机车',
    SB22: '埃及奥秘',
    SB23: '欢乐时光',
    SB24: '侏罗纪',
    AV01: '性感女仆',
    XG01: '龙珠',
    XG02: '幸运8',
    XG03: '闪亮女郎',
    XG04: '金鱼',
    XG05: '中国新年',
    XG06: '海盗王',
    XG07: '鲜果狂热',
    XG08: '小熊猫',
    XG09: '大豪客',
    SB30: '灵猴献瑞',
    SB31: '天空守护者',
    XG10: '龙舟竞渡',
    PKBD: '百搭二王',
    PKBB: '红利百搭',
    SB32: '齐天大圣',
    SB33: '糖果碰碰乐',
    SB34: '破冰'
};
// AG 订单状态
var AG_STATE = {
    '1': '已结算',
    '0': '未结算',
    '-1': '重置试玩额度',
    '-2': '注单被篡改',
    '-8': '取消指定局注单',
    '-9': '取消注单'
};
// IG 游戏名称
var IG_GAME_NAME = {
    'BACCARAT': '百家乐',
    'DRAGON_TIGER': '老虎机',
    'ROULETTE': '轮盘',
    'BACCARAT_INSURANCE': '保险百家乐',
    'SICBO': '骰宝',
    'XOC_DIA': '色碟'
};
//PT游戏名
var PT_GAME_NAME = {
    '1': '洛奇',
    '2': '钢铁侠2',
    '3': '金刚狼',
    '4': '钢铁侠 50线',
    '5': '钢铁侠3',
    '6': '索尔',
    '7': '复仇者联盟',
    '9': '钢铁侠',
    '10': '神奇四侠',
    '11': '神奇四侠50线',
    '12': '神奇绿巨人',
    '13': '神奇绿巨人50线',
    '14': '超胆侠',
    '15': '艾丽卡',
    '16': '恶灵骑士',
    '17': '刀锋战士',
    '18': 'X战警',
    '19': '角斗士',
    '21': '海底探宝',
    '23': '粉红豹',
    '24': '酷炫水果农场',
    '27': '火腿骑士',
    '28': '蜘蛛侠',
    '30': '万圣节财富',
    '31': 'X战警 50线',
    '32': 'Cashback先生',
    '33': '三只小猪与大灰狼',
    '34': '圣诞节老人惊喜',
    '35': '德托里传奇',
    '37': '船长的宝藏',
    '40': '沙漠财宝',
    '48': '高速公路之王',
    '61': '黄金之旅',
    '45': '保险柜',
    '51': '黄金召集',
    '52': '开心假日',
    '50': '疯狂水果',
    /*'2': '钻石谷',*/
    '25': '疯狂乐透',
    '26': '爱摩尔医生',
    '29': '沙漠财富2',
    '36': '海滩人生',
    '38': '一夜疯狂',
    '41': '角斗士累积',
    '39': '华尔街疯狂',
    '42': '古怪猴子',
    '43': '8台球',
    '44': '百慕大三角',
    /*'45': '疯狂7',*/
    '46': '招财进宝',
    '47': '舞龙',
    '53': '白王'
};

// 操作类型
var PT_CHANG_TYPE = {
    '0': '旋转',
    '1': '赌博',
    '2': '免费旋转',
    '3': '奖池',
    '4': '奖金游戏'
};

//新PT游戏名
var PLAYTECH_GAME_NAME = {
    romw : '多轮轮盘',
    pnp : '粉红豹',
    rky : '洛奇',
    ttl : '顶级王牌 - 足球传奇',
    tfs : '顶级王牌 - 世界足球明星',
    qop : '金字塔王后',
    fdt : '戴图理魔术7',
    ssp : '圣诞老人惊喜',
    dond_uk : '一掷千金 - 银行家富豪',
    dond_i : '一掷千金 - 世界老虎机',
    irm3 : '钢铁侠2',
    eas : '复活节惊喜',
    kkg : '金刚传奇',
    ttc : '顶级王牌 - 明星',
    ah2 : '异形猎手',
    tst : '网球明星',
    mcb : '现金先生',
    fnf50 : '神奇四侠50线',
    irm50 : '钢铁侠2 50线',
    hlk50 : '绿巨人50线',
    cm : '中国厨房',
    grel : '黄金召集',
    hlf : '万圣节财富',
    er : '度假站',
    dt2 : '沙漠宝藏2',
    mmy : '木乃伊',
    gts46 : '生命女神',
    gts50 : '宝石热',
    spm : '火腿骑士',
    evj : 'Everybodys Jackpot',
    gts51 : '幸运熊猫',
    gts52 : '疯狂海盗',
    gtsbwm : '足球宝贝',
    gtsftf : '足球迷',
    glrj : '角斗士',
    iceh : '冰球',
    gtsjzc : '爵士俱乐部',
    gtswng : '黄金翅膀',
    gtscnb : '警察和强盗',
    gtsdnc : '现金海豚',
    gtsatq : '亚特兰蒂斯女王',
    gtslgms : '野生游戏',
    gtsbayw : '海滩游侠',
    gtsdrdv : '戴夫与太阳神之眼',
    gtsmrln : '玛丽莲·梦露',
    gtsdgk : '龙之国度',
    gtsjhw : '约翰·韦恩',
    gtsstg : '苏丹的黄金',
    gtspor : '巨额财富',
    gtssprs : '黑道家族',
    gtscbl : '牛仔与外星人',
    trm : '雷神',
    gtsgoc : '圣诞鬼魂',
    gtscb : '现金方块',
    ghr : '恶灵骑士',
    gtsru : '魔方财富',
    gtssmdm : '无敌金刚',
    gtswg : '疯狂赌徒',
    gtssmbr : '巴西桑巴',
    gtshwkp : '公路之王pro',
    fnfrj : '时髦水果',
    cam : '美国队长',
    fff : '时髦水果农场',
    gtsltb : '小小英国人',
    avng : '复仇者联盟',
    wvm : '金刚狼',
    irmn3 : '钢铁侠3',
    ashamw : '亚马逊野外',
    gtscdl : 'Chippendales',
    lvb : '爱之船',
    ashbgt : '英国达人',
    spidc : '蜘蛛侠',
    xmn50 : 'X战警50线',
    paw : '三只小猪与狼',
    zcjb : '招财进宝',
    ashwgaa : '北极探险（疯狂赌徒2）',
    ashfmf : '满月财富',
    bld50 : '刀锋战士50线',
    gtsaod : '天使还是魔鬼',
    fth : '财富山',
    wlg : '舞龙',
    snsb : '日落海滩',
    gtsmnd : '金钱掉落',
    tmqd : '三剑客',
    gtsfc : '足球嘉年华',
    shmst : '神秘夏洛克',
    sol : '好运时刻',
    catqc : '猫女王',
    esm : '埃斯梅拉达',
    cnpr : '甜蜜派对',
    tglalcs : '炼金术士法术',
    ttwfs : '足球明星2014年',
    phot : '紫热',
    gtscirsj : '船长马戏团',
    ashhotj : '丛林之心',
    samz : '亚马逊的秘密',
    whk : '白王',
    ctiv : '拉斯维加斯之猫',
    fxf : '狐狸财富',
    pyrr : '金字塔法老',
    gtsir : '雪地奔跑',
    jpgt1 : '大奖野人',
    '1' : '财富跳转',
    '2' : '辛巴达黄金之旅',
    '3' : '谁想成为百万富翁',
    '4' : '翡翠公主',
    '5' : '大明帝国',
    '6' : '堂吉诃德的财富',
    '7' : '年年有余',
    '8bs' : '8球吃角子老虎机',
    hb : '埃斯梅拉达',
    al : '炼金实验室',
    bl : '海滩生活',
    bt : '百慕大三角',
    bld : '刀锋战士',
    ct : '船长的宝藏',
    cifr : '全景电影',
    fosl : '经典卷轴',
    c7 : '疯狂之七',
    drd : '超胆侠',
    dt : '沙漠宝藏',
    gs : '钻石谷',
    dlm : '多情博士',
    elr : '艾丽卡',
    fnf : '神奇四侠',
    fbr : '足球规则',
    fow : '奇迹森林',
    foy : '青春之泉',
    fmn : '疯狂水果',
    fm : '古怪猴子',
    glr : '角斗士',
    gc : '妖精洞',
    glg : '黄金游戏',
    gos : '金旅',
    bib : 'Great Blue',
    hh : '鬼屋',
    hk : '公路之王',
    irm : '钢铁侠',
    jb : '丛林摇摆',
    lm : '疯狂乐透',
    ms : '魔法老虎机',
    nk : '海王星王国',
    op : '海洋公主',
    pl : 'PartyLine',
    ssl : '转轴经典3',
    sfr : '转轴经典5',
    rnr : '摇摆舞',
    sc : '保险箱探宝',
    sib : '银弹',
    sf : '苏丹的财富',
    hlk : '绿巨人',
    ts : '时空过客',
    ta : '三个朋友',
    tp : '三倍利润',
    tr : '热带卷轴',
    ub : 'Ugga Bugga',
    wsffr : '玩转华尔街',
    wis : '狂野领袖',
    xmn : 'X战警'
};

var NT_GAME_NAME = {
    '200': '机器外星人',
    '201': '引力',
    '202': '阳光海滩',
    '203': '宇宙大爆炸',
    '204': '吸血鬼',
    '205': '破坏小组',
    '206': '神龙岛',
    '207': '埃及英雄',
    '208': '贡左的探索',
    '209': '萤光点点',
    '210': '狂热拳击',
    '211': '能量霸王花',
    '212': '水果盘',
    '213': '杰克与魔豆',
    '214': '杰克哈默垂',
    '215': '失落岛',
    '216': '幸运垂钓者',
    '217': '魔法之门',
    '218': '狂取香蕉',
    '219': '女神谬斯',
    '220': '神话少女',
    '221': '菜园觅食',
    '224': '星际大战',
    '225': '南方公园2',
    '226': '闪耀星空',
    '227': '海底工业城',
    '228': '神偷',
    '229': '野生火鸡',
    '230': '神灯精灵',
    '231': '僵尸',
    '232': '生活死',
    '233': '卷偷',
    '234': '富贵猪',
    '235': '辉煌胜利',
    '236': '双轴旋转',
    '237': '芝加哥之王'
};
//在线状态
var USER_ONLINE= {
    '0': '离线',
    '1': '在线'
};
var SPORT_TEAM_BET_ODDS = {
    101: '',
    102: '',
    106: '',
    108: '',
    501: '',
    502: '',
    506: '',
    508: ''
};
var SPORT_PARTS_EXPLAIN = {
    '1': {
        '': '',
        '1': '上班场',
        '2': '下半场'
    },
    '2': {
        '': '',
        '1': '第一节',
        '2': '第二节',
        '3': '第三节',
        '4': '第四节'
    }
};
var SPORT_ODDS_ID_DICT = {
    101: '独赢',
    102: '全场-让球',
    103: '全场-大小',
    104: '单双',
    105: '全场和局',
    106: '半场-让球',
    107: '半场-大小',
    108: '半场独赢',
    109: '半场和局',
    201: '1:0',
    202: '2:0',
    203: '2:1',
    204: '3:0',
    205: '3:1',
    206: '3:2',
    207: '4:0',
    208: '4:1',
    209: '4:2',
    210: '4:3',
    211: '0:0',
    212: '1:1',
    213: '2:2',
    214: '3:3',
    215: '4:4',
    216: '其他',
    301: '0~1',
    302: '2~3',
    303: '4~6',
    304: '7up',
    401: '主/主',
    402: '主/和',
    403: '主/客',
    404: '和/主',
    405: '和/和',
    406: '和/客',
    407: '客/主',
    408: '客/和',
    409: '客/客',
    501: '独赢',
    502: '全场-让球',
    503: '全场-大小',
    504: '单双',
    505: '全场和局',
    506: '半场-让球',
    507: '半场-大小',
    508: '半场独赢',
    509: '半场和局'
};
var SPORT_STATE = {
    '0': '撤销',
    '1': '正常',
    '2': '已结算',
    '3': '确认中',
    '4': '失败'
};
var AGBBIN_GAME_CODE = {
    BK: '篮球',
    BS: '棒球',
    F1: '其他',
    FB: '美足',
    FT: '足球',
    FU: '指数',
    IH: '冰球',
    SP: '冠军',
    TN: '网球',
    CB: 'Combo Parlay',

    LT: '六合彩',
    BJ3D: '北京3D',
    PL3D: '福彩3D',
    BBPK: 'BB PK3',
    BB3D: 'BB3D',
    BBKN: 'BB快乐彩',
    BBRB: 'BB滚球王',
    SH3D: '上海彩票',
    CQSC: '重庆时时彩',
    TJSC: '天津时时彩',
    JXSC: '江西时时彩',
    XJSC: '新疆时时彩',
    CQSF: '重庆十分彩',
    D3: '3D彩',
    P3: '排列三',
    BT: 'BB3D时时彩',
    T3: '上海时时彩',
    CQ: '重庆时时彩',
    JX: '江西时时彩',
    TJ: '天津时时彩',
    GXSF: '广西十分彩',
    GDSF: '广东十分彩',
    TJSF: '天津十分彩',
    BJKN: '北京快乐8',
    CAKN: '加拿大卑斯',
    AUKN: '澳洲首都商业区',
    BJPK: '北京PK拾',
    GDE5: '广东11选5',
    CQE5: '重庆11选5',
    JXE5: '江西11选5',
    SDE5: '山东十一运夺金',
    CQWC: '重庆Wild Card',
    JLQ3: '吉林快3',
    JSQ3: '江苏快3',
    AHQ3: '安徽快3',

    15006: '3D玉蒲团',
    15016: '厨王争霸',
    15017: '连环夺宝',
    15018: '激情243',
    15019: '倩女幽魂',
    15021: '全民狗仔',
    15022: '愤怒空域',
    15023: '连连看',
    15024: '2014世足赛',

    3001: '百家乐',
    3002: '二八杠',
    3003: '龙虎斗',
    3005: '三公',
    3006: '温州牌九',
    3007: '轮盘',
    3008: '骰宝',
    3010: '德州扑克',
    3011: '色碟',
    3012: '牛牛',
    3013: '赛本引',
    3014: '无限21点',
    3015: '番摊',

    5001: '水果拉霸',
    5002: '扑克拉霸',
    5003: '筒子拉霸',
    5004: '足球拉霸',
    5005: '异形大战',
    5006: '星爆',
    5007: '水果热潮',
    5008: 'Monkey GoGo',
    5009: '金刚',
    5011: '西游记',
    5012: '外星争霸',
    5013: '传统',
    5014: '丛林',
    5015: 'FIFA2010',
    5016: '史前丛林冒险',
    5017: '星际大战',
    5018: '齐天大圣',
    5019: '水果乐园',
    5020: '热带风情',
    5021: '7PK',
    5023: '7靶射击',
    5025: '法海斗白蛇',
    5026: '2012 伦敦奥运',
    5027: '功夫龙',
    5028: '中秋月光派对',
    5029: '圣诞派对',
    5030: '幸运财神',
    5034: '王牌5PK',
    5035: '加勒比扑克',
    5039: '鱼虾蟹',
    5040: 'Deuces Wild',
    5041: '7PK',
    5042: '遗失战场',
    5047: '尸乐园',
    5048: '特务危机',
    5049: '玉蒲团',
    5050: '战火佳人',
    5057: '明星97',
    5058: '疯狂水果盘',
    5059: '马戏团',
    5060: '动物奇观五',
    5061: '超级7',
    5062: '龙在囧途',
    5070: '黄金大转轮',
    5073: 'BaccaratWheel',
    5074: '钻石列车',
    5075: '圣兽传说',
    5076: '数字大转轮',
    5077: '水果大转轮',
    5078: '象棋大转轮',
    5079: '3D数字大转轮',
    5080: '乐透转轮',
    5083: '猜火车',
    5084: '怪物传奇',
    5086: 'Ocean Party',
    5088: '斗大',
    5089: '红狗',
    5091: '三国拉霸',
    5092: '封神榜',
    5093: '金瓶梅',
    5094: '金瓶梅2',
    5095: '斗鸡',
    5101: '欧式轮盘',
    5102: '美式轮盘',
    5103: '彩金轮盘',
    5104: '法式轮盘',
    5106: '三国志',
    5115: '经典21点',
    5116: '西班牙21点',
    5117: '维加斯21点',
    5118: '奖金21点',
    5131: '皇家德州扑克',
    5201: '火焰山',
    5202: '月光宝盒',
    5203: '爱你一万年',
    5204: '2014 FIFA',
    5401: '天山侠侣传',
    5402: '夜市人生',
    5403: '七剑传说',
    5404: '沙滩排球',
    5405: '暗器之王',
    5406: 'Starship27',
    5407: '别叫我小红帽',
    5601: '神秘岛探险',
    5701: 'LinkGem',
    5703: '我有钱',
    5704: '斗牛',
    5705: 'Treasure Pot',
    5706: '巧克力的热情',
    5707: '黄金豹',
    5801: '海豚世界',
    5802: '阿基里斯',
    5803: '阿兹特克宝藏',
    5804: '大明星',
    5805: '凯萨帝国',
    5806: '奇幻花园',
    5807: '东方魅力',
    5808: '浪人武士',
    5809: '空战英豪',
    5810: '航海时代',
    5811: '狂欢夜',
    5821: '国际足球',
    5822: '兔女郎',
    5823: '发大财',
    5824: '恶龙传说',
    5825: '金莲',
    5826: '金矿工',
    5827: '老船长',
    5828: '霸王龙',
    5831: '高球之旅',
    5832: '高速卡车',
    5833: '沉默武士',
    5834: '异国之夜',
    5835: '喜福牛年',
    5836: '龙卷风',
    5837: '喜福猴年',
    5888: 'JackPot',
    5901: 'Duo Bao',
    5902: 'Candy Party',
    5903: 'JACKPOT'
};
// 消息状态
var MESSAGE_READ_STATE = {
    '0': '未读',
    '1': '已读'
};
// 代理佣金类型
var PROXY_COMMISSION_TYPE = {
    '1': '消费佣金',
    '2': '盈亏佣金',
    '3': '充值佣金'
};
//银行网址
var BANK_WEBSITE = {
    "101": "http://www.icbc.com.cn/",
    "102": "http://www.abchina.com/",
    "103": "http://www.ccb.com/",
    "104": "http://www.boc.cn/",
    "105": "http://www.cmbchina.com/",
    "106": "http://www.bankcomm.com/",
    "107": "http://www.cmbc.com.cn/",
    "108": "http://www.cebbank.com/",
    "109": "http://www.spdb.com.cn/",
    "110": "http://www.cib.com.cn/",
    "111": "http://bank.ecitic.com/",
    "112": "http://www.psbc.com/",
    "113": "http://www.pingan.com/",
    "114": "http://www.cgbchina.com.cn/",
    "115": "http://www.bankofshanghai.com/",
    "116": "http://www.bankofbeijing.com.cn/",
    "117": "http://www.hxb.com.cn/",
    "118": "http://www.srcb.com/",
    "119": "http://www.bjrcb.com/",
    "120": "http://www.cbhb.com.cn/",
    "121": "https://www.alipay.com/",
    "122": ""
};


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

/**
 * Created by NicoleQi on 2016/11/25.
 */
$(document).ready(function () {
    if (location.pathname == '/login') {
        $('.section1').find('.login-left-form').animate({"left": '0'});
        $('.section1').find('.login-right-form').animate({"right": '0'});
        $('.main-wrapper').fullpage({
            verticalCentered: false,//内容垂直居中
            anchors: ['page1', 'page2', 'page3'],
            loopBottom: true,
            'onLeave': function (index) {
                if (index == 1) {
                    $('.section1').find('.login-left-form').animate({"left": '-50%'});
                    $('.section1').find('.login-right-form').animate({"right": '-50%'});
                }
                if (index != 2) {
                    $('.section2').find('.download-left').animate({"marginTop": "-100%"});
                    $('.section2').find('.phone-img1').animate({"marginLeft": "-145px", "left": "50%"});
                    $('.section2').find('.phone-img2').animate({"marginRight": "-145px", "right": "50%"});
                }
                if (index != 3) {
                    $('.section3').find('.download-btn').fadeOut();
                    $('.section3').find('.show-pic2').animate({"left": "0", "top": "0"});
                    $('.section3').find('.show-pic3').animate({"left": "0", "top": "0"});
                }
            },
            'afterLoad': function (anchorLink, index) {
                if (index == 1) {
                    $('.section1').find('.login-left-form').animate({"left": '0'});
                    $('.section1').find('.login-right-form').animate({"right": '0'});
                }
                if (index == 1) {
                    $('.section1').find('.login-left-form').delay(100).addClass('move');
                }
                if (index == 2) {
                    $('.section2').find('.download-left').animate({"marginTop": 0});
                    $('.section2').find('.phone-img1').animate({"marginLeft": 0, "left": 0}, 500);
                    $('.section2').find('.phone-img2').delay(200).animate({"marginRight": 0, "right": 0}, 1000);
                }
                if (index == 3) {
                    $('.section3').find('.download-btn').fadeIn(800);
                    $('.section3').find('.show-pic2').animate({"left": "100px", "top": "100px"}, 500);
                    $('.section3').find('.show-pic3').animate({"left": "190px", "top": "230px"}, 1000);
                }
            }
        });
    }

});

// 奖金玩法: 复式(选择号码投注)
var $lottery_random_bonus_select = function(){
    function formula_num_multiply(text_ls, value_ls){
        var count = 1, text = [], value = [];
        $.each(text_ls, function(i, t){
            var index = $lottery_random_base.random(t.length);
            text.push([t[index]]);
            value.push([value_ls[i][index]]);
        });
        return {count: count, text: text, value: value};
    }
    function formula_value_add(text_ls, value_ls, key){
        var count = 0, text = [], value = [];
        var value_dict = NUM_VALUE[''+key];
        $.each(value_ls, function(i, v){
            var index = $lottery_random_base.random(v.length);
            var num = v[index];
            count = parseInt(value_dict[''+num]);
            text.push([text_ls[i][index]]);
            value.push([num]);
        });
        return {count: count, text: text, value: value};
    }
    function formula_num_count(text_ls, value_ls){
        var count = 1, text = [], value = [];
        var row_count = text_ls.length;
        var row_index = $lottery_random_base.random(row_count);
        $.each(text_ls, function(i, t){
            if(i == row_index){
                var index = $lottery_random_base.random(t.length);
                text.push([t[index]]);
                value.push([value_ls[i][index]]);
            }
            else{
                text.push([]);
                value.push([]);
            }
        });
        return {count: count, text: text, value: value};
    }
    function formula_zx_fs(text_ls, value_ls, base_len){
        var text = [], value = [];
        base_len = parseInt(base_len);
        $.each(value_ls, function(i, v){
            var len = v.length;
            var row_text = [], row_value = [];
            var index = $lottery_random_base.random(len);
            for(var j=0; j<base_len; j++) {
                while ($lottery_random_base.num_in_array(v[index], row_value)) {
                    index = $lottery_random_base.random(len);
                }
                row_text.push(text_ls[i][index]);
                row_value.push(v[index]);
            }
            text.push(row_text);
            value.push(row_value);
        });
        var count = calculate.formula_zx_fs(value, base_len);
        return {count: count, text: text, value: value};
    }
    function formula_num_fold(text_ls, value_ls, base_len){
        var result = formula_zx_fs(text_ls, value_ls, base_len);
        result['count'] = calculate.formula_num_fold(result['value'], base_len);
        return result;
    }
    function formula_zx_one_more(text_ls, value_ls, one_row, more_row, base_len){
        one_row = parseInt(one_row);
        more_row = parseInt(more_row);
        base_len = parseInt(base_len);
        var count = 1, text = [[], []], value = [[], []];
        var index = $lottery_random_base.random(text_ls[one_row].length);
        text[one_row] = [text_ls[one_row][index]];
        value[one_row] = [value_ls[one_row][index]];
        var len = text_ls[more_row].length;
        var more_text = [], more_value = [];
        for(var i=0; i<base_len; i++){
            index = $lottery_random_base.random(len);
            while ($lottery_random_base.num_in_array(value_ls[more_row][index], value[one_row]) ||
                $lottery_random_base.num_in_array(value_ls[more_row][index], more_value)){
                index = $lottery_random_base.random(len);
            }
            more_text.push(text_ls[more_row][index]);
            more_value.push(value_ls[more_row][index]);
        }
        text[more_row] = more_text;
        value[more_row] = more_value;
        return {count: count, text: text, value: value};
    }
    function formula_count_fold(text_ls, value_ls, times){
        var count = 1, text = [], value = [];
        times = parseInt(times);
        var row_index = $lottery_random_base.random(text_ls.length);
        var i;
        for(i=0; i<row_index; i++){
            text.push([]);
            value.push([]);
        }
        var index = $lottery_random_base.random(text_ls[row_index].length);
        count *= times;
        text.push([text_ls[row_index][index]]);
        value.push([value_ls[row_index][index]]);
        for(i=row_index+1; i<text_ls.length; i++){
            text.push([]);
            value.push([]);
        }
        return {count: count, text: text, value: value};
    }
    function formula_group(text_ls, value_ls){
        var text = [], value = [];
        var row_count = text_ls.length;
        $.each(text_ls, function(i, t){
            var index = $lottery_random_base.random(t.length);
            text.push([t[index]]);
            value.push([value_ls[i][index]]);
        });
        var count = calculate.formula_group(value, row_count);
        return {count: count, text: text, value: value};
    }
    function formula_count_no_repeat(text_ls, value_ls){
        var count = 1, text = [], value = [];
        $.each(value_ls, function(i, v){
            var len = v.length;
            var index = $lottery_random_base.random(len);
            var flag = i > 0;
            while (flag) {
                for (var j = 0; j < i; j++) {
                    flag = $lottery_random_base.num_in_array(v[index], value[j]);
                    if(flag){
                        index = $lottery_random_base.random(len);
                        break;
                    }
                }
            }
            text.push([text_ls[i][index]]);
            value.push([v[index]]);
        });
        return {count: count, text: text, value: value};
    }
    function formula_dt(text_ls, value_ls, limit_row, base_len){
        var text = [], value = [];
        base_len = parseInt(base_len);
        $.each(value_ls, function(i, v){
            var len = v.length;
            var index = $lottery_random_base.random(len);
            var num_count = i == limit_row ? 1 : base_len;
            var row_text = [], row_value = [];
            for(var j=0; j<num_count; j++){
                var flag = true;
                while (flag) {
                    flag = $lottery_random_base.num_in_array(v[index], row_value);
                    if(!flag) {
                        for (var k = 0; k < value.length; k++) {
                            flag = $lottery_random_base.num_in_array(v[index], value[k]);
                            if (flag) {
                                break;
                            }
                        }
                    }
                    if(flag){
                        index = $lottery_random_base.random(len);
                    }
                }
                row_text.push(text_ls[i][index]);
                row_value.push(v[index]);
            }
            text.push(row_text);
            value.push(row_value);
        });
        var count = calculate.formula_dt(value, limit_row, base_len);
        return {count: count, text: text, value: value};
    }
    function fixed_one(text_ls, value_ls){
        return {count: 1, text: text_ls, value: value_ls};
    }
    function formula_rx_zhi_fs(text_ls, value_ls, site_count){
        var count = 1, text = [], value = [];
        var row_count = text_ls.length;
        var num_site = $lottery_random_base.get_rx_num_site(site_count, row_count);
        for(var i=0; i<row_count; i++){
            text.push([]);
            value.push([]);
        }
        $.each(num_site, function(_, site){
            var index = $lottery_random_base.random(text_ls[site].length);
            text[site].push(text_ls[site][index]);
            value[site].push(value_ls[site][index]);
        });
        return {count: count, text: text, value: value, num_site: num_site};
    }
    function formula_rx_value_add(text_ls, value_ls, key, site_count){
        var result = formula_value_add(text_ls, value_ls, key);
        result['num_site'] = $lottery_random_base.get_rx_num_site(site_count, 5);
        return result;
    }
    function formula_rx_zu_fs(text_ls, value_ls, base_len){
        var result = formula_zx_fs(text_ls, value_ls, base_len);
        result['num_site'] = $lottery_random_base.get_rx_num_site(base_len, 5);
        return result;
    }
    function formula_rx_zs_fs(text_ls, value_ls, times, site_count){
        var result = formula_num_fold(text_ls, value_ls, times);
        result['num_site'] = $lottery_random_base.get_rx_num_site(site_count, 5);
        return result;
    }
    function formula_rx_zx(text_ls, value_ls, one_row, more_row, base_len, site_count){
        var result = formula_zx_one_more(text_ls, value_ls, one_row, more_row, base_len);
        result['num_site'] = $lottery_random_base.get_rx_num_site(site_count, 5);
        return result;
    }
    function formula_rx_zl(text_ls, value_ls, base_len, site_count){
        var result = formula_zx_fs(text_ls, value_ls, base_len);
        result['num_site'] = $lottery_random_base.get_rx_num_site(site_count, 5);
        return result;
    }
    return {
        create_bet_num: function(wf_id, wf_dict, order_count){
            var result_ls = [];
            var wf_params = wf_dict['param'];
            var titles = wf_params['titles'];
            var row_count = $lottery_random_base.get_dict_len(titles);
            var i;
            var text_ls = [], value_ls = [];
            if('begin' in wf_params && 'end' in wf_params){
                var n_ls = $lottery_random_base.get_int_range_num(wf_params['begin'], wf_params['end']);
                for(i=0; i<row_count; i++) {
                    text_ls.push(n_ls);
                    value_ls.push(n_ls);
                }
            }
            else if('cs' in wf_params){
                var caption_value = NUM_CAPTION_VALUE[wf_params['cs']];
                if('num' in caption_value) {
                    var c_text = [], c_value = [];
                    for (var t in caption_value['num']) {
                        c_text.push('' + t);
                        if($.isPlainObject(caption_value['num'][''+t])){
                            c_value.push(caption_value['num']['' + t]['value']);
                        }
                        else {
                            c_value.push(caption_value['num']['' + t]);
                        }
                    }
                    for (i = 0; i < row_count; i++) {
                        text_ls.push(c_text);
                        value_ls.push(c_value);
                    }
                }
                else{
                    $.each(titles, function(title){
                        var c_text = [], c_value = [];
                        var _dict = caption_value[title];
                        for (var t in _dict['num']) {
                            c_text.push('' + t);
                            if($.isPlainObject(_dict['num'][''+t])){
                                c_value.push(_dict['num']['' + t]['value']);
                            }
                            else {
                                c_value.push(_dict['num']['' + t]);
                            }
                        }
                        text_ls.push(c_text);
                        value_ls.push(c_value);
                    });
                }
            }
            if(text_ls.length > 0){
                var wf_calc = wf_dict['calculate'];
                var num_separator = wf_calc['num_separator'] || '';
                var row_separator = wf_calc['row_separator'] || ',';
                for(i=0; i<order_count; i++){
                    var result = {};
                    switch (wf_calc['method']){
                        case 'formula_num_multiply' :
                            result = formula_num_multiply(text_ls, value_ls);
                            break;
                        case 'formula_value_add' :
                            result = formula_value_add(text_ls, value_ls, wf_calc['value']);
                            break;
                        case 'formula_num_count' :
                            result = formula_num_count(text_ls, value_ls);
                            break;
                        case 'formula_zx_fs' :
                            result = formula_zx_fs(text_ls, value_ls, wf_calc['base_len']);
                            break;
                        case 'formula_num_fold' :
                            result = formula_num_fold(text_ls, value_ls, wf_calc['base_len']);
                            break;
                        case 'formula_zx_one_more' :
                            result = formula_zx_one_more(text_ls, value_ls, wf_calc['oneRow'], wf_calc['moreRow'], wf_calc['base_len']);
                            break;
                        case 'formula_count_fold' :
                            result = formula_count_fold(text_ls, value_ls, wf_calc['bet']);
                            break;
                        case 'formula_group' :
                            result = formula_group(text_ls, value_ls);
                            break;
                        case 'formula_rx_zhi_fs' :
                            result = formula_rx_zhi_fs(text_ls, value_ls, wf_calc['base_len']);
                            break;
                        case 'formula_rx_value_add' :
                            result = formula_rx_value_add(text_ls, value_ls, wf_calc['value'], wf_calc['base_len']);
                            break;
                        case 'formula_rx_zu_fs' :
                            result = formula_rx_zu_fs(text_ls, value_ls, wf_calc['base_len']);
                            break;
                        case 'formula_rx_zs_fs' :
                            result = formula_rx_zs_fs(text_ls, value_ls, wf_calc['num_len'], wf_calc['base_len']);
                            break;
                        case 'formula_rx_zx' :
                            result = formula_rx_zx(text_ls, value_ls, wf_calc['oneRow'], wf_calc['moreRow'], wf_calc['num_len'], wf_calc['base_len']);
                            break;
                        case 'formula_rx_zl' :
                            result = formula_rx_zl(text_ls, value_ls, wf_calc['num_len'], wf_calc['base_len']);
                            break;
                        case 'formula_count_no_repeat' :
                            result = formula_count_no_repeat(text_ls, value_ls);
                            break;
                        case 'formula_dt' :
                            result = formula_dt(text_ls, value_ls, wf_calc['limit_row'], wf_calc['base_len']);
                            break;
                        case 'fixed_one' :
                            result = fixed_one(text_ls, value_ls);
                            break;
                    }
                    result['num_separator'] = num_separator;
                    result['row_separator'] = row_separator;
                    result_ls.push(result);
                }
            }
            return result_ls;
        }
    }
}();
// 奖金玩法, 单式(输入号码投注)
var $lottery_random_bonus_input = function(){
    function create_input_num(num_ls, num_len){
        var value = [];
        var len = num_ls.length;
        var row_value = [];
        for(var i=0; i<num_len; i++){
            row_value.push(num_ls[$lottery_random_base.random(len)]);
        }
        value.push(row_value);
        return value;
    }
    function create_input_num_no_repeat(num_ls, num_len){
        var value = [];
        var len = num_ls.length;
        var row_value = [];
        for(var i=0; i<num_len; i++){
            var index = $lottery_random_base.random(len);
            while ($lottery_random_base.num_in_array(num_ls[index], row_value)){
                index = $lottery_random_base.random(len);
            }
            row_value.push(num_ls[index]);
        }
        value.push(row_value);
        return value;
    }
    function create_input_num_repeat(num_ls, num_len){
        var value = [];
        if(num_len > 1) {
            var row_value = [];
            var repeat_count = $lottery_random_base.random(num_len);
            while (repeat_count < 1) {
                repeat_count = $lottery_random_base.random(num_len);
            }
            var repeat_site = [];
            var i;
            for (i = 0; i <= repeat_count; i++) {
                var site = $lottery_random_base.random(num_len);
                while ($lottery_random_base.num_in_array(site, repeat_site)) {
                    site = $lottery_random_base.random(num_len);
                }
                repeat_site.push(site);
            }
            var len = num_ls.length;
            var repeat_index = $lottery_random_base.random(len);
            for(i=0; i<num_len; i++){
                var index;
                if ($lottery_random_base.num_in_array(i, repeat_site)){
                    index = repeat_index;
                }
                else {
                    index = $lottery_random_base.random(len);
                    while (index == repeat_index){
                        index = $lottery_random_base.random(len);
                    }
                }
                row_value.push(num_ls[index]);
            }
            value.push(row_value);
        }
        return value;
    }
    function create_input_num_no_all_repeat(num_ls, num_len){
        var value = [];
        var len = num_ls.length;
        var row_value = [];
        for(var i=0; i<num_len; i++){
            var index = $lottery_random_base.random(len);
            if(i == (num_len-1)) {
                var flag = true;
                for(var j=1; j<i; j++){
                    flag = row_value[0] == row_value[j];
                    if(!flag){
                        break;
                    }
                }
                if(flag) {
                    while ($lottery_random_base.num_in_array(num_ls[index], row_value)) {
                        index = $lottery_random_base.random(len);
                    }
                }
            }
            row_value.push(num_ls[index]);
        }
        value.push(row_value);
        return value;
    }
    function create_input_num_repeat_no_all(num_ls, num_len){
        var value = [];
        if(num_len > 1) {
            var row_value = [];
            var repeat_count = $lottery_random_base.random(num_len) + 1;
            while (repeat_count < 2 || repeat_count >= num_len) {
                repeat_count = $lottery_random_base.random(num_len) + 1;
            }
            var repeat_site = [];
            var i;
            for (i = 0; i < repeat_count; i++) {
                var site = $lottery_random_base.random(num_len);
                while ($lottery_random_base.num_in_array(site, repeat_site)) {
                    site = $lottery_random_base.random(num_len);
                }
                repeat_site.push(site);
            }
            var len = num_ls.length;
            var repeat_index = $lottery_random_base.random(len);
            for(i=0; i<num_len; i++){
                var index;
                if ($lottery_random_base.num_in_array(i, repeat_site)){
                    index = repeat_index;
                }
                else {
                    index = $lottery_random_base.random(len);
                    if(i == (num_len-1)){
                        var flag = true;
                        for(var j=1; j<i; j++){
                            flag = row_value[0] == row_value[j];
                            if(!flag){
                                break;
                            }
                        }
                        if(flag){
                            while (index == repeat_index){
                                index = $lottery_random_base.random(len);
                            }
                        }
                    }

                }
                row_value.push(num_ls[index]);
            }
            value.push(row_value);
        }
        return value;
    }
    return {
        create_bet_num: function(wf_id, wf_dict, order_count, num_min, num_max){
            var result_ls = [];
            var num_ls = $lottery_random_base.get_int_range_num(num_min, num_max);
            var wf_calc = wf_dict['calculate'];
            var num_separator = wf_calc['num_separator'] || '';
            var row_separator = wf_calc['row_separator'] || '';
            var check_type = parseInt(wf_calc['check_type']);
            var num_len = parseInt(wf_calc['base_len']);
            for(var i=0; i<order_count; i++){
                var value = [];
                switch (check_type){
                    case 1:
                        value = create_input_num_no_repeat(num_ls, num_len);
                        break;
                    case 2:
                        value = create_input_num_repeat(num_ls, num_len);
                        break;
                    case 3:
                        value = create_input_num_no_all_repeat(num_ls, num_len);
                        break;
                    case 4:
                        value = create_input_num_repeat_no_all(num_ls, num_len);
                        break;
                    default:
                        value = create_input_num(num_ls, num_len);
                        break;
                }
                var result = {
                    count: value.length, value: value, text: value,
                    num_separator: num_separator, row_separator: row_separator
                };
                result_ls.push(result);
            }
            if('location' in wf_calc){
                var num_site = $lottery_random_base.get_rx_num_site(num_len, 5);
                $.each(result_ls, function(i, result){
                    result['num_site'] = num_site;
                });
            }
            return result_ls;
        }
    };
}();
var $lottery_random_base = function(){
    return {
        random: function(num_count){
            return parseInt(Math.random() * 1000) % num_count;
        },
        get_dict_len: function(dict){
            var len = 0;
            $.each(dict, function(){
                len ++;
            });
            return len;
        },
        get_int_range_num: function(begin, end){
            var ls = [];
            var _b = parseInt(begin), _e = parseInt(end);
            for (; _b <= _e; _b++) {
                ls.push(_b);
            }
            return ls;
        },
        num_in_array: function(num, arr){
            num = '' + num;
            for(var i=0; i<arr.length; i++){
                if(num == (''+arr[i])){
                    return true;
                }
            }
            return false;
        },
        get_rx_num_site: function(site_count, row_count){
            var num_site_ls = [];
            for(var i=0; i<site_count; i++){
                var num_site = row_count - 1 - $lottery_random_base.random(row_count);
                var flag = $lottery_random_base.num_in_array(num_site, num_site_ls);
                while (flag){
                    num_site = row_count - 1 - $lottery_random_base.random(row_count);
                    flag = $lottery_random_base.num_in_array(num_site, num_site_ls);
                }
                num_site_ls.push(num_site);
            }
            return num_site_ls;
        }
    };
}();

var PLAY_METHOD_CLASSIFY = {
    '1': {
        '1': '后三一码不定',
        '2': '后三直选复式',
        '3': '后三直选单式',
        '4': '后三组三复式',
        '5': '后三组三单式',
        '6': '后三组六复式',
        '7': '后三组六单式',
        '8': '后三直选和值',
        '9': '五星定位胆',
        '10': '五星前二复式',
        '11': '五星前二单式',
        '12': '后二直选复式',
        '13': '后二直选单式',
        '14': '后二组选复式',
        '15': '后二组选单式',
        '16': '后二大小单双',
        '17': '前三直选复式',
        '18': '前三直选单式',
        '19': '前三一码不定',
        '20': '前三组三复式',
        '21': '前三组三单式',
        '22': '前三组六复式',
        '23': '前三组六单式',
        '120001': '任2直选单式',
        '120002': '任2直选复式',
        '120003': '任2组选单式',
        '120004': '任2组选复式',
        '120038': '任2直选和值',
        '120039': '任2组选和值',
        '120203': '前二组选单式',
        '120204': '前二组选复式',
        '120205': '前二大小单双',
        '120232': '前二直选跨度',
        '120233': '前二组选包胆',
        '120238': '前二直选和值',
        '120239': '前二组选和值',
        '123532': '后二直选跨度',
        '123533': '后二组选包胆',
        '123538': '后二直选和值',
        '123539': '后二组选和值',
        '130001': '任3直选单式',
        '130002': '任3直选复式',
        '130030': '任3混合',
        '130038': '任3直选和值',
        '130039': '任3组选和值',
        '130041': '任3组三单式',
        '130042': '任3组三复式',
        '130043': '任3组六单式',
        '130044': '任3组六复式',
        '130307': '前三组选混合',
        '130308': '前三直选和值',
        '130331': '前三直选组合',
        '130332': '前三直选跨度',
        '130333': '前三组选包胆',
        '130337': '前三大小单双',
        '130339': '前三组选和值',
        '130352': '前三二码不定',
        '131401': '中三直选单式',
        '131402': '中三直选复式',
        '131403': '中三组三单式',
        '131404': '中三组三复式',
        '131405': '中三组六单式',
        '131406': '中三组六复式',
        '131408': '中三直选和值',
        '131409': '中三一码不定',
        '131431': '中三直选组合',
        '131432': '中三直选跨度',
        '131433': '中三组选包胆',
        '131437': '中三大小单双',
        '131439': '中三组选和值',
        '131452': '中三二码不定',
        '132407': '后三组选混合',
        '132531': '后三直选组合',
        '132532': '后三直选跨度',
        '132533': '后三组选包胆',
        '132537': '后三大小单双',
        '132539': '后三组选和值',
        '132552': '后三二码不定',
        '140001': '任4直选单式',
        '140002': '任4直选复式',
        '140041': '任4组选24',
        '140042': '任4组选12',
        '140043': '任4组选6',
        '140044': '任4组选4',
        '140401': '前四直选单式',
        '140402': '前四直选复式',
        '140431': '前四直选组合',
        '140441': '前四组选24',
        '140442': '前四组选12',
        '140443': '前四组选6',
        '140444': '前四组选4',
        '140451': '前四一码不定',
        '140452': '前四二码不定',
        '141501': '后四直选单式',
        '141502': '后四直选复式',
        '141531': '后四直选组合',
        '141541': '后四组选24',
        '141542': '后四组选12',
        '141543': '后四组选6',
        '141544': '后四组选4',
        '141551': '后四一码不定',
        '141552': '后四二码不定',
        '150001': '五星直选复式',
        '150030': '五星直选单式',
        '150031': '五星直选组合',
        '150041': '五星组选120',
        '150042': '五星组选60',
        '150043': '五星组选30',
        '150044': '五星组选20',
        '150045': '五星组选10',
        '150046': '五星组选5',
        '150052': '五星二码不定',
        '150053': '五星三码不定',
        '150060': '百家乐',
        '150061': '一帆风顺',
        '150062': '好事成双',
        '150063': '三星报喜',
        '150064': '四季发财',
        '150065': '中三组选混合',
        '13003001': '任3混合组三',
        '13003002': '任3混合组六',
        '13033303': '包胆组三',
        '13033306': '包胆组六',
        '13033903': '和值组三',
        '13033906': '和值组六',
        '15003101': '一星',
        '15003102': '二星',
        '15003103': '三星',
        '15003104': '四星',
        '15003105': '五星',
        '15006001': '庄闲',
        '15006002': '对子',
        '15006003': '豹子',
        '15006004': '天王'
    },
    '2': {
        '13033303': '包胆组三',
        '13033306': '包胆组六',
        '13033903': '和值组三',
        '13033906': '和值组六',
        '4': '后三组三复式',
        '6': '后三组六复式',
        '24': '三星直选复式',
        '25': '三星直选单式',
        '26': '三星组三复式',
        '27': '三星组三单式',
        '28': '三星组六复式',
        '29': '三星组六单式',
        '30': '前一直选复式',
        '31': '前二直选复式',
        '32': '前二直选单式',
        '33': '不定位复式',
        '34': '后一直选',
        '35': '后二直选复式',
        '36': '后二直选单式',
        '37': '三星直选和值',
        '220203': '前二组选复式',
        '220204': '前二组选单式',
        '220205': '前二大小单双',
        '221303': '后二组选复式',
        '221304': '后二组选单式',
        '221305': '后二大小单双',
        '230007': '三星组选混合',
        '230008': '三星组选和值',
        '230009': '三星定位胆',
        '230010': '三星二码胆',
        '230031': '三星趣味012',
        '230032': '三星趣味大小',
        '230033': '三星趣味质合',
        '230034': '三星趣味奇偶',
        '23000803': '组三和值',
        '23000806': '组六和值'
    },
    '3': {
        '38': '前一直选',
        '39': '前二直选复式',
        '40': '前二组选复式',
        '41': '前二组选胆拖',
        '42': '任选2中2复式',
        '43': '任选二胆拖',
        '44': '前三直选复式',
        '45': '前三直选单式',
        '46': '前三组选复式',
        '47': '前三组选胆拖',
        '48': '任选3中3复式',
        '49': '任选三胆拖',
        '50': '任选4中4复式',
        '51': '任选四胆拖',
        '52': '任选5中5复式',
        '53': '任选五胆拖',
        '54': '任选五单式',
        '55': '任选6中5复式',
        '56': '任选六胆拖',
        '57': '任选7中5复式',
        '58': '任选七胆拖',
        '59': '任选8中5复式',
        '60': '任选八胆拖',
        '310005': '任选1中1复式',
        '310006': '任选1中1单式',
        '320006': '任选2中2单式',
        '320201': '前二组选单式',
        '320202': '前二直选单式',
        '330006': '任选3中3单式',
        '330301': '前三组选单式',
        '330303': '前三不定胆',
        '330304': '前三定位胆',
        '340006': '任选4中4单式',
        '350006': '任选5中5单式',
        '350008': '定单双',
        '350009': '猜中数',
        '350010':'0单5双',
        '350011':'1单4双',
        '350012':'2单3双',
        '350013':'3单2双',
        '350014':'4单1双',
        '350015':'5单0双',
        '350020':'猜中数3,9',
        '350021':'猜中数4,8',
        '350022':'猜中数5,7',
        '350023':'猜中数6',
        '360006': '任选6中5单式',
        '370006': '任选7中5单式',
        '380006': '任选8中5单式'
    },
    '4': {
        '61': '首位数投',
        '62': '首位红投',
        '63': '二连直',
        '64': '二连组',
        '65': '快乐二',
        '66': '前三直',
        '67': '前三组',
        '68': '快乐三',
        '69': '快乐四',
        '70': '快乐五'
    },
    '5': {
        '71': '任选一',
        '72': '任选二',
        '73': '任选三',
        '74': '任选四',
        '75': '任选五',
        '76': '任选六',
        '77': '任选七',
        '78': '上下盘',
        '79': '奇偶盘',
        '80': '和值大小单双',
        '711': '任选一中一',
        '721': '任选二中二',
        '731': '任选三中三',
        '732': '任选三中二',
        '741': '任选四中四',
        '742': '任选四中三',
        '743': '任选四中二',
        '751': '任选五中五',
        '752': '任选五中四',
        '753': '任选五中三',
        '761': '任选六中六',
        '762': '任选六中五',
        '763': '任选六中四',
        '764': '任选六中三',
        '771': '任选七中七',
        '772': '任选七中六',
        '773': '任选七中五',
        '774': '任选七中四',
        '775': '任选七中零',
        '781': '中盘',
        '782': '上盘',
        '783': '下盘',
        '791': '和盘',
        '792': '奇盘',
        '793': '偶盘',
        '801': '大单',
        '802': '大双',
        '803': '小单',
        '804': '小双'
    },
    '6': {
        '81': '特码直选(A)',
        '82': '特码直选(B)',
        '83': '特码大小单双',
        '84': '四肖',
        '85': '平特色波',
        '86': '平特尾数',
        '87': '六肖',
        '88': '五不中',
        '89': '三全中',
        '90': '二全中',
        '91': '三中二',
        '92': '平码直选',
        '93': '平特一肖',
        '831': '特码大小单双（大）',
        '832': '特码大小单双（小）',
        '833': '特码大小单双（单）',
        '834': '特码大小单双（双）',
        '835': '特码大小单双（和）',
        '841': '四肖（中）',
        '851': '特码色波（红）',
        '852': '特码色波（蓝）',
        '853': '特码色波（绿）',
        '861': '平特尾数（0）',
        '862': '平特尾数（1-9）',
        '871': '六肖（中）',
        '872': '六肖（不中）',
        '873': '六肖（和）',
        '881': '五不中',
        '891': '三全中',
        '901': '二全中',
        '911': '三中二（中三）',
        '912': '三中二（中二）',
        '921': '平码直选',
        '931': '平特一肖（本命生肖）',
        '932': '平特一肖（其他生肖）'
    },
    '7': {
        '94': '胜负',
        '95': '总比分',
        '96': '总进球',
        '97': '半全场胜负',
        '98': '上下盘单双'
    },
    '8': {
        '99': '一星百家乐',
        '100': '二星百家乐',
        '991': '一星百家乐(庄)',
        '992': '一星百家乐(闲)',
        '993': '一星百家乐(和)',
        '1001': '二星百家乐(庄)',
        '1002': '二星百家乐(闲)',
        '1003': '二星百家乐(和)'
    },
    '9': {     //快三
        '500001': '二不同标准',
        '500002': '二不同单式',
        '500003': '二不同胆拖',
        '500004': '二同号标准',
        '500005': '二同号单式',
        '500006': '二同号复选',
        '500007': '三不同标准',
        '500008': '三不同单式',
        '500009': '三不同胆拖',
        '500010': '三不同和值',
        '500011': '三同号单选',
        '500012': '三同号通选',
        '500013': '三连号通选',
        '500014': '和值',
        '500021': '中一码',
        '500022': '杀一码',
        '500023': '杀二码',
        '500024': '任选三',
        '500025': '任选四',
        '500026': '猜奇次',
        '500027': '猜偶次',
        '500028': '红黑胆',
        '501001': '和值3,18',
        '501002': '和值4,17',
        '501003': '和值5,16',
        '501004': '和值6,15',
        '501005': '和值7,14',
        '501006': '和值8,13',
        '501007': '和值9,12',
        '501008': '和值10,11'
    },
    '10': {     //pk10
        '400001': '第一名',
        '400002': '第二名',
        '400003': '第三名',
        '400004': '第四名',
        '400005': '第五名',
        '400006': '第六名',
        '400007': '第七名',
        '400008': '第八名',
        '400009': '第九名',
        '400010': '第十名',
        '400011': '猜前一',
        '400012': '猜前二',
        '400013': '猜前三',
        '400014': '猜前四',
        '400015': '猜前五',
        '400016': '猜前六',
        '400017': '猜前七',
        '400018': '猜前八',
        '400019': '猜前九',
        '400020': '猜前十',
        '400021': '猜第一单式',
        '400022': '猜第二单式',
        '400023': '猜第三单式',
        '400024': '猜第四单式',
        '400025': '猜第五单式',
        '400026': '猜第六单式',
        '400027': '猜第七单式',
        '400028': '猜第八单式',
        '400029': '猜第九单式',
        '400030': '猜第十单式',
        '400031': '猜前一单式',
        '400032': '猜前二单式',
        '400033': '猜前三单式',
        '400034': '猜前四单式',
        '400035': '猜前五单式',
        '400036': '猜前六单式',
        '400037': '猜前七单式',
        '400038': '猜前八单式',
        '400039': '猜前九单式',
        '400040': '猜前十单式',
        '400041': '定位胆',
        '400051': '冠军大小单双',
        '400052': '亚军大小单双',
        '400053': '季军大小单双'
    },
    '13': {
        '600001': '猜数字',
        '600002': '大小单双',
        '600003': '波色',
        '600004': '特码包三',
        '600005': '特殊组合',
        '600006': '大小单双',
        '600007': '极大极小'
    },
    '14': {
        '61': '首位数投',
        '62': '首位红投',
        '63': '二连直',
        '64': '二连组',
        '65': '快乐二',
        '66': '前三直',
        '67': '前三组',
        '68': '快乐三',
        '69': '快乐四',
        '70': '快乐五'
    }
};
var $lottery_bet_random = function(){
    return {
        /**
         * 生成机选号码(奖金模式)
         * @param lottery_id 彩种编号
         * @param wf_id 玩法编号
         * @param order_count 生成几注
         * @returns {{type: string, ls: Array}}
         * {
            type: 投注方式(input: 单式(输入); select: 复式(号码选择)),
            ls: [
                {
                    count: 注数,
                    num_separator: 每个号码之间的分隔符(单式需注意),
                    row_separator: 每组/每位号码之间的分隔符(单式需注意),
                    text: 用于显示的文本数据 [
                        [号码1, 号码2, ...],
                        [号码1, 号码2, ...]
                        ...
                    ],
                    value: 用于投注的数据 [
                        [号码1, 号码2, ...],
                        [号码1, 号码2, ...]
                        ...
                    ]
                }
            ]
         }
         */
        create_bonus_bet_num: function(lottery_id, wf_id, order_count){
            var type = '', ls = [];
            order_count = parseInt(order_count);
            if(!isNaN(order_count) && order_count > 0) {
                wf_id = '' + wf_id;
                var l_cls = LOTTERY_METHOD[lottery_id] || '';
                var l_dict = LOTTERY_DETAIL['LOTTERY_' + l_cls];
                var wf_dict = {};
                for (var k in l_dict) {
                    if (/^wf_class/.test('' + k)) {
                        var _tmp_d = l_dict[''+k];
                        for(var k1 in _tmp_d){
                            var _tmp_d1 = _tmp_d[''+k1];
                            if(wf_id in _tmp_d1){
                                wf_dict = _tmp_d1[wf_id];
                                break;
                            }
                        }
                    }
                    if(!$.isEmptyObject(wf_dict)){
                        break;
                    }
                }
                if (!$.isEmptyObject(wf_dict)) {
                    type = wf_dict['type'];
                    switch (type) {
                        case 'select':
                            ls = $lottery_random_bonus_select.create_bet_num(wf_id, wf_dict, order_count);
                            break;
                        case 'input':
                            var num_min = l_dict['num_min'];
                            var num_max = l_dict['num_max'];
                            ls = $lottery_random_bonus_input.create_bet_num(wf_id, wf_dict, order_count, num_min, num_max);
                            break;
                    }
                }
            }
            return {type: type, ls: ls};
        }
    }
}();
/**
 * Created by NicoleQi on 2016/12/12.
 */
/*娱乐场地切换*/
function changeCasino(){
    $(".lottery-type .right-down").on('click',function(){
        if($(this).hasClass("on")){
            $(this).removeClass("on");
            $(".lottery-type .sel-list").css("display","none");
        }else{
            $(this).addClass("on");
            $(".lottery-type .sel-list").css("display","block");
        }
    });

}
//------------------------------------------彩票基础方法--------------------------
//彩票基础方法
var lottery_fnc = {
    sync_time: null,
    records: {
        lottery_id: "0",
        issue: "0000000",
        options: null
    },
    /**
     * 计算投注金额
     * @param count 注数
     * @param lottery_id 彩票ID
     * @param model 圆角分模式（0圆,1角，2分,3厘）
     * @param bet_money 投注金额（适配赔率型投注）
     * return  元
     */
    return_bet_money: function (count, model, bet_money) {
        var unit = 1;
        for (var i = 0; i < model; i++)
            unit = unit / 10;
        return bet_money ? bet_money : (unit * count * 2).toFixed(model < 2 ? 2 : model);

    },
    return_win_money: function () {

    },
    /**
     * 投注数统计
     * @param num_arr 投注号码（check）
     * @param method_id 玩法ID(check)
     * @param value_len 任选和值选择的位数长度
     * 备注:check是必须带参数,value_len为任选玩法需要待的参数
     * num_arr传参数形式[[],[],[],[]],例如我投重庆时时彩前三直选复式万位投0,1,2，千位3,4，百位传1,9，则num_arr为[[0,1,2],[3,4],[1,9]]
     *                                          投重庆时时彩定位但万位投0,1,2，千位""，百位传1,9，则num_arr为[[0,1,2],[],[1,9],[],[]]
     * 输入型投注num_arr传参形式['123','345'] 其中'123'，'345'为一组投注号码；
     */
    return_bet_count: function (num_arr, method_id, value_len) {
        var calculate_data = method_calculate_fnc[method_id];
        var count = 0;
        switch (calculate_data['method']) {
            case 'formula_num_multiply' :
                count = calculate.formula_num_multiply(num_arr);
                break;
            case 'formula_value_add' :
                count = calculate.formula_value_add(num_arr, NUM_VALUE[calculate_data['value']]);
                break;
            case 'formula_num_count' :
                count = calculate.formula_num_count(num_arr);
                break;
            case 'formula_zx_fs' :
                count = calculate.formula_zx_fs(num_arr, calculate_data['base_len']);
                break;
            case 'formula_num_fold' :
                count = calculate.formula_num_fold(num_arr, calculate_data['base_len']);
                break;
            case 'formula_zx_one_more' :
                count = calculate.formula_zx_one_more(num_arr, calculate_data['oneRow'], calculate_data['moreRow'], calculate_data['base_len']);
                break;
            case 'formula_count_fold' :
                count = calculate.formula_count_fold(num_arr, calculate_data['bet']);
                break;
            case 'formula_group' :
                count = calculate.formula_group(num_arr, num_arr.length);
                break;
            case 'formula_rx_zhi_fs' :
                count = calculate.formula_rx_zhi_fs(num_arr, calculate_data['base_len']);
                break;
            case 'formula_rx_value_add' :
                count = calculate.formula_rx_value_add(num_arr, NUM_VALUE[calculate_data['value']], calculate_data['base_len'], value_len);
                break;
            case 'formula_rx_zu_fs' :
                count = calculate.formula_rx_zu_fs(num_arr, calculate_data['base_len'], value_len);
                break;
            case 'formula_rx_zs_fs' :
                count = calculate.formula_num_fold(num_arr, calculate_data['num_len']);
                count *= calculate.formula_multiply_divide(value_len, calculate_data['base_len']);
                break;
            case 'formula_rx_zx' :
                count = calculate.formula_zx_one_more(num_arr, calculate_data['oneRow'], calculate_data['moreRow'], calculate_data['num_len']);
                count *= calculate.formula_multiply_divide(value_len, calculate_data['base_len']);
                break;
            case 'formula_rx_zl' :
                count = calculate.formula_zx_fs(num_arr, calculate_data['num_len']);
                count *= calculate.formula_multiply_divide(value_len, calculate_data['base_len']);
                break;
            case 'formula_count_no_repeat' :
                count = calculate.formula_count_no_repeat(num_arr);
                if (count < 0) {
                    //"温馨提示", "选择的号码数量不能超过40个！"
                    count = 0;
                }
                break;
            case 'formula_dt' :
                count = calculate.formula_dt(num_arr, calculate_data['limit_row'], calculate_data['base_len']);
                break;
            case 'fixed_one' :
                count = calculate.formula_num_count(num_arr);
                if (count > 0) count = 1;
                break;
            default:
                count = calculate.get_input_num_bet_counts(num_arr, calculate_data, value_len);
                break;
        }
        return count;
    }
};

var calculate = {
    //注数算法:各位数的数量相乘
    formula_num_multiply: function (num_arr) {
        var count = 1;
        for (var key in  num_arr) {
            count *= num_arr[key].length;
        }
        return count;
    },
    //注数算法：选中号码的数量
    formula_num_count: function (num_arr) {
        var count = 0;
        for (var key in num_arr) {
            count += num_arr[key].length;
        }
        return count;
    },
    //注数算法：选中号码的数量*倍数
    formula_count_fold: function (num_arr, fold) {
        var count = calculate.formula_num_count(num_arr);
        return count * fold;
    },
    //注数算法：选中号码的数量按倍数相加,参数为每选中一个号码增加的倍数
    formula_num_fold: function (num_arr, fold) {
        var count = 0;
        for (var key in num_arr) {
            for (var i = 0; i < num_arr[key].length; i++) {
                count += i * fold;
            }
        }
        return count;
    },
    //注数算法：选中号码的值相加
    formula_value_add: function (num_arr, val) {
        var count = 0;
        for (var key in num_arr) {
            for (var i = 0; i < num_arr[key].length; i++) {
                var text = num_arr[key][i];
                if (/[0][0-9]/.test(text) && text.length < 3) text = text.charAt(1);
                count += val[text];
            }
        }
        return count;
    },
    //组合算法
    formula_group: function (num_arr, num_count) {
        for (var key in num_arr) {
            num_count *= num_arr[key].length;
        }
        return num_count;
    },
    //组选120、24算法
    formula_zx_fs: function (num_arr, base_len) {
        var num_count = 0;
        for (var key in num_arr) {
            num_count += num_arr[key].length;
        }
        if (num_count < base_len)
            return 0;
        return calculate.formula_multiply_divide(num_count, base_len);
    },
    //组选
    formula_zx_one_more: function (num_arr, one_row, more_row, base_len) {
        if (num_arr[one_row].length < 1 || num_arr[more_row].length < base_len) {
            return 0;
        }
        var count = 0;
        var one_arr = num_arr[one_row];
        var more_arr = num_arr[more_row];
        for (var i = 0; i < one_arr.length; i++) {
            var one_val = one_arr[i];
            var more_len = more_arr.length;
            for (var j = 0; j < more_arr.length; j++) {
                if (one_val == more_arr[j]) {
                    more_len--;
                }
            }
            if (more_len < base_len) continue;
            count += calculate.formula_multiply_divide(more_len, base_len);
        }
        return count;
    },
    //任选和值
    formula_rx_value_add: function (num_arr, val, base_len, num_len) {
        if (num_len < base_len) return 0;
        var count = calculate.formula_value_add(num_arr, val);
        return count * calculate.formula_multiply_divide(num_len, base_len);
    },
    //任选-组选复式
    formula_rx_zu_fs: function (num_arr, base_len, num_len) {
        var count = calculate.formula_zx_fs(num_arr, base_len);
        return count * calculate.formula_multiply_divide(num_len, base_len);
    },
    //c num_len/base_len(c7/2,c5/2等)
    formula_multiply_divide: function (numLen, baseLen) {
        var count = 1;
        for (var i = 0; i < baseLen; i++) {
            count *= (numLen--);
        }
        for (; baseLen > 1; baseLen--) {
            count /= baseLen;
        }
        return count;
    },
    //任选-直选复式
    formula_rx_zhi_fs: function (num_arr, len) {
        var sum = 0;
        var arr = new Array();
        for (var key in num_arr) {
            if (num_arr[key].length > 0)
                arr[arr.length] = num_arr[key].length;
        }
        if (arr.length < len)
            return sum;
        var index = new Array();
        for (var i = 0; i < len; i++) {
            index[i] = i;
        }
        var m = 1;
        for (var i = 0; i < index.length; ++i) {
            m *= arr[index[i]];
        }
        sum += m;
        var _index = index;
        while (true) {
            var i;
            for (i = _index.length - 1; i >= 0; --i) {
                if (index[i] != i + arr.length - len) {
                    break;
                }
            }
            if (i < 0) {
                return sum;
            }
            index[i] += 1;
            for (var j = i + 1; j < len; ++j)
                index[j] = index[j - 1] + 1;
            var m = 1;
            for (var i = 0; i < index.length; ++i)
                m *= arr[index[i]];
            sum += m;
        }
        return sum;
    },
    //每个位数的号码之间不允许重复
    formula_count_no_repeat: function (num_arr) {
        var num = {};
        var count = 0;
        var num_count = 0;
        for (var key in num_arr) {
            for (var i = 0; i < num_arr[key].length; i++) {
                if (num[num_arr[key][i]] == null) num_count++;
                num[num_arr[key][i]] = 1;
                count++;
            }
        }
        if (num_arr.length > num_count) {
            return 0;
        }
        if (count > 40) {
            return -1;
        }
        return calculate.recursion_no_repeat(num_arr, 0, new Array(), 0);
    },
    //递归去重复数
    recursion_no_repeat: function (num_arr, index, arr, count) {
        var ns = num_arr[index];
        if (index < num_arr.length - 1) {
            for (var i = 0; i < ns.length; i++) {
                var flag = false;
                for (var j = 0; j < index; j++) {
                    flag = arr[j] == ns[i];
                    if (flag) {
                        break;
                    }
                }
                if (flag) {
                    continue;
                }
                arr[index] = ns[i];
                count = calculate.recursion_no_repeat(num_arr, index + 1, arr, count);
            }
        }
        else {
            for (var i = 0; i < ns.length; i++) {
                var flag = false;
                for (var j = 0; j < arr.length; j++) {
                    flag = ns[i] == arr[j];
                    if (flag) {
                        break;
                    }
                }
                if (!flag) {
                    count++;
                }
            }
        }
        return count;
    },
    formula_dt: function (num_arr, limit_row, base_len) {
        var count = 0;
        var limit_arr = num_arr[limit_row];
        if (limit_arr.length == 0 || limit_arr.length > base_len) return count;
        var arr = new Array();
        for (var i = 0; i < num_arr.length; i++) {
            if (i != limit_row) arr[arr.length] = num_arr[i];
        }
        if (limit_arr.length != 0 && limit_arr.length <= base_len) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].length == 0) {
                    return 0;
                }
                else {
                    count += arr[i].length;
                }
            }
        }
        return calculate.formula_multiply_divide(count, base_len - limit_arr.length + 1);
    },
    get_input_num_bet_counts: function (num_arr, calculate_data, value_len) {
        if (calculate_data['num_location'] != null && calculate_data['num_location'] == 'checkbox') {
            return num_arr.length * calculate.formula_multiply_divide(value_len, calculate_data['base_len'])
        }
        return num_arr.length;
    }
};

var method_calculate_fnc = {
    150001: {method: 'formula_num_multiply'},
    150030: {base_len: 5, check_type: 0},
    150031: {method: 'formula_group'},
    150041: {method: 'formula_zx_fs', base_len: 5},
    150042: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 3},
    150043: {method: 'formula_zx_one_more', oneRow: 1, moreRow: 0, base_len: 2},
    150044: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
    150045: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
    150046: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
    150061: {method: 'formula_num_count'},
    150062: {method: 'formula_num_count'},
    150063: {method: 'formula_num_count'},
    150064: {method: 'formula_num_count'},
    150060: {method: 'formula_num_count'},
    140401: {base_len: 4, check_type: 0},
    140402: {method: 'formula_num_multiply'},
    140431: {method: 'formula_group'},
    141502: {method: 'formula_num_multiply'},
    141501: {base_len: 4, check_type: 0},
    141531: {method: 'formula_group'},
    140441: {method: 'formula_zx_fs', base_len: 4},
    140442: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
    140443: {method: 'formula_zx_fs', base_len: 2},
    140444: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
    141541: {method: 'formula_zx_fs', base_len: 4},
    141542: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
    141543: {method: 'formula_zx_fs', base_len: 2},
    141544: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
    17: {method: 'formula_num_multiply'},
    18: {'base_len': 3, 'check_type': 0},
    130331: {'method': 'formula_group'},
    130308: {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
    130332: {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
    20: {'method': 'formula_num_fold', 'base_len': 2},
    21: {'base_len': 3, 'check_type': 4},
    22: {'method': 'formula_zx_fs', 'base_len': 3},
    23: {'base_len': 3, 'check_type': 1},
    130307: {'base_len': 3, 'check_type': 3},
    130339: {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
    130333: {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
    'qs_hz_ws': {'method': 'formula_num_multiply'},
    'qs_ts': {'method': 'formula_num_multiply'},
    131402: {'method': 'formula_num_multiply'},
    131401: {'base_len': 3, 'check_type': 0},
    132531: {'method': 'formula_group'},
    150065: {'base_len': 3, 'check_type': 3},
    131408: {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
    131404: {'method': 'formula_num_fold', 'base_len': 2},
    131403: {'base_len': 3, 'check_type': 4},
    131406: {'method': 'formula_zx_fs', 'base_len': 3},
    131405: {'base_len': 3, 'check_type': 1},
    131439: {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
    131433: {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
    131431: {'method': 'formula_group'},
    131432: {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
    2: {'method': 'formula_num_multiply'},
    3: {'base_len': 3, 'check_type': 0},
    132531: {'method': 'formula_group'},
    8: {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
    132532: {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
    4: {'method': 'formula_num_fold', 'base_len': 2},
    5: {'base_len': 3, 'check_type': 4},
    6: {'method': 'formula_zx_fs', 'base_len': 3},
    7: {'base_len': 3, 'check_type': 1},
    132407: {'base_len': 3, 'check_type': 3},
    132539: {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
    132533: {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
    'hs_hz_ws': {'method': 'formula_num_multiply'},
    'hs_ts': {'method': 'formula_num_multiply'},
    10: {'method': 'formula_num_multiply'},
    11: {'base_len': 2, 'check_type': 0},
    120238: {'method': 'formula_value_add', 'value': 'zhi_er', num_separator: '$'},
    120232: {'method': 'formula_value_add', 'value': 'kd_er', num_separator: ','},
    120204: {'method': 'formula_zx_fs', 'base_len': 2},
    120203: {'base_len': 2, 'check_type': 1},
    120239: {'method': 'formula_value_add', 'value': 'zu_er', num_separator: '$'},
    120233: {'method': 'formula_count_fold', 'bet': 9, num_separator: '$'},
    12: {'method': 'formula_num_multiply'},
    13: {'base_len': 2, 'check_type': 0},
    123538: {'method': 'formula_value_add', 'value': 'zhi_er', num_separator: '$'},
    123532: {'method': 'formula_value_add', 'value': 'kd_er', num_separator: ','},
    14: {'method': 'formula_zx_fs', 'base_len': 2},
    15: {'base_len': 2, 'check_type': 1},
    123539: {'method': 'formula_value_add', 'value': 'zu_er', num_separator: '$'},
    123533: {'method': 'formula_count_fold', 'bet': 9, num_separator: '$'},
    9: {'method': 'formula_num_count'},
    1: {'method': 'formula_num_count'},
    19: {'method': 'formula_num_count'},
    131409: {'method': 'formula_num_count'},
    132552: {'method': 'formula_zx_fs', 'base_len': 2},
    131452: {'method': 'formula_zx_fs', 'base_len': 2},
    130352: {'method': 'formula_zx_fs', 'base_len': 2},
    141551: {'method': 'formula_num_count'},
    141552: {'method': 'formula_zx_fs', 'base_len': 2},
    150052: {'method': 'formula_zx_fs', 'base_len': 2},
    150053: {'method': 'formula_zx_fs', 'base_len': 3},
    120205: {'method': 'formula_num_multiply'},
    16: {'method': 'formula_num_multiply'},
    130337: {'method': 'formula_num_multiply'},
    132537: {'method': 'formula_num_multiply'},
    120002: {'method': 'formula_rx_zhi_fs', 'base_len': 2},
    120001: {'base_len': 2, 'check_type': 0, location: 'zx', 'num_location': 'checkbox'},
    120038: {'method': 'formula_rx_value_add', 'base_len': 2, 'value': 'zhi_er', num_separator: '$', location: 'zx'},
    120004: {'method': 'formula_rx_zu_fs', 'base_len': 2, location: 'zx'},
    120003: {'base_len': 2, 'check_type': 1, location: 'zx', 'num_location': 'checkbox'},
    120039: {'method': 'formula_rx_value_add', 'value': 'zu_er', 'base_len': 2, num_separator: '$', location: 'zx'},
    130002: {'method': 'formula_rx_zhi_fs', 'base_len': 3},
    130001: {'base_len': 3, 'check_type': 0, location: 'zx', 'num_location': 'checkbox'},
    130038: {'method': 'formula_rx_value_add', 'value': 'zhi_san', 'base_len': 3, num_separator: '$', location: 'zx'},
    130042: {'method': 'formula_rx_zs_fs', 'num_len': 2, 'base_len': 3, location: 'zx'},
    130041: {'base_len': 3, 'check_type': 2, location: 'zx', 'num_location': 'checkbox'},
    130044: {'method': 'formula_rx_zu_fs', 'base_len': 3, location: 'zx'},
    130043: {'base_len': 3, 'check_type': 1, location: 'zx', 'num_location': 'checkbox'},
    130030: {'base_len': 3, 'check_type': 3, location: 'zx', 'num_location': 'checkbox'},
    130039: {'method': 'formula_rx_value_add', 'value': 'zu_san', 'base_len': 3, num_separator: '$', location: 'zx'},
    140002: {'method': 'formula_rx_zhi_fs', 'base_len': 4},
    140001: {'base_len': 4, 'check_type': 0, location: 'zx', 'num_location': 'checkbox'},
    140041: {'method': 'formula_rx_zu_fs', 'base_len': 4, location: 'zx'},
    140042: {'method': 'formula_rx_zx', 'oneRow': 0, 'moreRow': 1, 'num_len': 2, 'base_len': 4, location: 'zx'},
    140043: {'method': 'formula_rx_zl', 'num_len': 2, 'base_len': 4, location: 'zx'},
    140044: {'method': 'formula_rx_zx', 'oneRow': 0, 'moreRow': 1, 'num_len': 1, 'base_len': 4, location: 'zx'},
    24: {method: 'formula_num_multiply'},
    25: {base_len: 3, check_type: 0},
    37: {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
    26: {method: 'formula_num_fold', 'base_len': 2},
    27: {base_len: 3, check_type: 2},
    28: {'method': 'formula_zx_fs', base_len: 3},
    29: {base_len: 3, check_type: 1},
    230007: {base_len: 3, check_type: 3},
    230008: {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
    230031: {'method': 'formula_value_add', 'value': 'fc_spice_012', num_separator: '$', group: 'all_num'},
    230032: {'method': 'formula_count_fold', 'bet': 125, num_separator: '$', group: 'all_num'},
    230033: {'method': 'formula_count_fold', 'bet': 125, num_separator: '$', group: 'all_num'},
    230034: {'method': 'formula_count_fold', 'bet': 125, num_separator: '$', group: 'all_num'},
    31: {'method': 'formula_num_multiply'},
    32: {'base_len': 2, 'check_type': 0},
    35: {'method': 'formula_num_multiply'},
    36: {'base_len': 2, 'check_type': 0},
    220203: {'method': 'formula_zx_fs', 'base_len': 2},
    220204: {'base_len': 2, 'check_type': 1},
    221303: {'method': 'formula_zx_fs', 'base_len': 2},
    221304: {'base_len': 2, 'check_type': 1},
    33: {'method': 'formula_num_count'},
    220205: {'method': 'formula_num_multiply'},
    221305: {'method': 'formula_num_multiply'},
    30: {'method': 'formula_num_count'},
    34: {'method': 'formula_num_count'},
    44: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    45: {base_len: 3, check_type: 1, num_separator: ' '},
    46: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
    330301: {base_len: 3, check_type: 1, num_separator: ' '},
    47: {
        method: 'formula_dt',
        base_len: 2,
        num_separator: ',',
        row_separator: '-',
        limit_row: 0,
        limit_rule: 'no_repeat'
    },
    39: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    320202: {base_len: 2, check_type: 1, num_separator: ' '},
    40: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
    320201: {base_len: 2, check_type: 1, num_separator: ' '},
    41: {
        method: 'formula_dt',
        base_len: 1,
        num_separator: ',',
        row_separator: '-',
        limit_row: 0,
        limit_rule: 'no_repeat'
    },
    38: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    330303: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    330304: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    350008: {'method': 'formula_num_count', num_separator: ','},
    350009: {method: 'formula_num_count', num_separator: '$'},
    310005: {method: 'formula_zx_fs', base_len: 1, num_separator: ',', row_separator: '-'},
    42: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
    48: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
    50: {method: 'formula_zx_fs', base_len: 4, num_separator: ',', row_separator: '-'},
    52: {method: 'formula_zx_fs', base_len: 5, num_separator: ',', row_separator: '-'},
    55: {method: 'formula_zx_fs', base_len: 6, num_separator: ',', row_separator: '-'},
    57: {method: 'formula_zx_fs', base_len: 7, num_separator: ',', row_separator: '-'},
    59: {method: 'formula_zx_fs', base_len: 8, num_separator: ',', row_separator: '-'},
    310006: {base_len: 1, check_type: 0, num_separator: ' '},
    320006: {base_len: 2, check_type: 1, num_separator: ' '},
    330006: {base_len: 3, check_type: 1, num_separator: ' '},
    340006: {'base_len': 4, check_type: 1, num_separator: ' '},
    350006: {base_len: 5, check_type: 1, num_separator: ' '},
    360006: {base_len: 6, check_type: 1, num_separator: ' '},
    370006: {base_len: 7, check_type: 1, num_separator: ' '},
    380006: {base_len: 8, check_type: 1, num_separator: ' '},
    43: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 1,
        num_separator: ',',
        row_separator: '-'
    },
    49: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 2,
        num_separator: ',',
        row_separator: '-'
    },
    51: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 3,
        num_separator: ',',
        row_separator: '-'
    },
    53: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 4,
        num_separator: ',',
        row_separator: '-'
    },
    56: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 5,
        num_separator: ',',
        row_separator: '-'
    },
    58: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 6,
        num_separator: ',',
        row_separator: '-'
    },
    60: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 7,
        num_separator: ',',
        row_separator: '-'
    },
    61: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    62: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    63: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    64: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
    65: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
    66: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    67: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
    68: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
    69: {method: 'formula_zx_fs', base_len: 4, num_separator: ',', row_separator: '-'},
    70: {method: 'formula_zx_fs', base_len: 5, num_separator: ',', row_separator: '-'},
    81: {method: 'formula_num_count', num_separator: ','},
    82: {method: 'formula_num_count', num_separator: ','},
    83: {method: 'formula_num_count', num_separator: ','},
    84: {method: 'formula_zx_fs', base_len: 4, num_separator: ','},
    85: {method: 'formula_num_count', num_separator: ','},
    86: {method: 'formula_num_count', num_separator: ','},
    87: {method: 'formula_zx_fs', base_len: 6, num_separator: ','},
    88: {method: 'formula_zx_fs', base_len: 5, num_separator: ','},
    89: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
    90: {method: 'formula_zx_fs', base_len: 2, num_separator: ','},
    91: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
    92: {method: 'formula_num_count', num_separator: ','},
    93: {method: 'formula_num_count', num_separator: ','},
    500001: {method: 'formula_zx_fs', base_len: 2, num_separator: ','},
    500002: {base_len: 2, check_type: 1, to_value: 'insert_comma'},
    500003: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 1,
        num_separator: ',',
        row_separator: '-'
    },
    500004: {
        method: 'formula_num_multiply',
        limit_row: 0,
        limit_rule: 'no_repeat',
        num_separator: ',',
        row_separator: '-'
    },
    500005: {base_len: 3, check_type: 2, to_value: 'insert_comma', row_separator: '-'},
    500006: {method: 'formula_num_count', num_separator: ','},
    500007: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
    500008: {base_len: 3, check_type: 1, to_value: 'insert_comma'},
    500009: {
        method: 'formula_dt',
        limit_row: 0,
        limit_rule: 'no_repeat',
        base_len: 2,
        num_separator: ',',
        row_separator: '-'
    },
    500010: {method: 'formula_value_add', value: 'ks_sbt', num_separator: '$'},
    500011: {method: 'formula_num_count', num_separator: ','},
    500012: {method: 'fixed_one', limit_rule: 'for_all', value: '', num_separator: ','},
    500013: {method: 'fixed_one', limit_rule: 'for_all', value: '', num_separator: ','},
    500014: {method: 'formula_num_count', num_separator: '$'},
    400001: {method: 'formula_num_count', num_separator: ','},
    400021: {base_len: 1, check_type: 0, num_separator: '~'},
    400002: {method: 'formula_num_count', num_separator: ','},
    400022: {base_len: 1, check_type: 0, num_separator: '~'},
    400012: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400032: {base_len: 2, check_type: 0, num_separator: ' '},
    400003: {method: 'formula_num_count', num_separator: ','},
    400023: {base_len: 1, check_type: 0, num_separator: '~'},
    400013: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400033: {base_len: 3, check_type: 0, num_separator: ' '},
    400004: {method: 'formula_num_count', num_separator: ','},
    400024: {base_len: 1, check_type: 0, num_separator: '~'},
    400014: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400034: {base_len: 4, check_type: 0, num_separator: ' '},
    400005: {method: 'formula_num_count', num_separator: ','},
    400025: {base_len: 1, check_type: 0, num_separator: '~'},
    400015: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400035: {base_len: 5, check_type: 0, num_separator: ' '},
    400006: {method: 'formula_num_count', num_separator: ','},
    400026: {base_len: 1, check_type: 0, num_separator: '~'},
    400016: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400036: {base_len: 6, check_type: 0, num_separator: ' '},
    400007: {method: 'formula_num_count', num_separator: ','},
    400027: {base_len: 1, check_type: 0, num_separator: '~'},
    400017: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400037: {base_len: 7, check_type: 0, num_separator: ' '},
    400008: {method: 'formula_num_count', num_separator: ','},
    400028: {base_len: 1, check_type: 0, num_separator: '~'},
    400018: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400038: {base_len: 8, check_type: 0, num_separator: ' '},
    400009: {method: 'formula_num_count', num_separator: ','},
    400029: {base_len: 1, check_type: 0, num_separator: '~'},
    400019: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400039: {base_len: 9, check_type: 0, num_separator: ' '},
    400010: {method: 'formula_num_count', num_separator: ','},
    400030: {base_len: 1, check_type: 0, num_separator: '~'},
    400020: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
    400040: {base_len: 10, check_type: 0, num_separator: ' '},
    400041: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
    400051: {'method': 'formula_num_multiply'},
    400052: {'method': 'formula_num_multiply'},
    400053: {'method': 'formula_num_multiply'},
    400054:{'method': 'formula_num_count', num_separator: ','},
    400055:{'method': 'formula_num_count', num_separator: ','},
    400056: {'method': 'formula_num_count','value': 'pk_lhd',num_separator: ',',group: 'all_num'}
};
var NUM_VALUE = {
    zhi_san: {
        "0": 1,
        "1": 3,
        "2": 6,
        "3": 10,
        "4": 15,
        "5": 21,
        "6": 28,
        "7": 36,
        "8": 45,
        "9": 55,
        "10": 63,
        "11": 69,
        "12": 73,
        "13": 75,
        "14": 75,
        "15": 73,
        "16": 69,
        "17": 63,
        "18": 55,
        "19": 45,
        "20": 36,
        "21": 28,
        "22": 21,
        "23": 15,
        "24": 10,
        "25": 6,
        "26": 3,
        "27": 1
    },
    kd_san: {
        "0": 10,
        "1": 54,
        "2": 96,
        "3": 126,
        "4": 144,
        "5": 150,
        "6": 144,
        "7": 126,
        "8": 96,
        "9": 54
    },
    zu_san: {
        "1": 1,
        "2": 2,
        "3": 2,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 8,
        "8": 10,
        "9": 11,
        "10": 13,
        "11": 14,
        "12": 14,
        "13": 15,
        "14": 15,
        "15": 14,
        "16": 14,
        "17": 13,
        "18": 11,
        "19": 10,
        "20": 8,
        "21": 6,
        "22": 5,
        "23": 4,
        "24": 2,
        "25": 2,
        "26": 1
    },
    "zhi_er": {
        "0": 1,
        "1": 2,
        "2": 3,
        "3": 4,
        "4": 5,
        "5": 6,
        "6": 7,
        "7": 8,
        "8": 9,
        "9": 10,
        "10": 9,
        "11": 8,
        "12": 7,
        "13": 6,
        "14": 5,
        "15": 4,
        "16": 3,
        "17": 2,
        "18": 1
    },
    "kd_er": {
        "0": 10,
        "1": 18,
        "2": 16,
        "3": 14,
        "4": 12,
        "5": 10,
        "6": 8,
        "7": 6,
        "8": 4,
        "9": 2
    },
    "zu_er": {
        "1": 1,
        "2": 1,
        "3": 2,
        "4": 2,
        "5": 3,
        "6": 3,
        "7": 4,
        "8": 4,
        "9": 5,
        "10": 4,
        "11": 4,
        "12": 3,
        "13": 3,
        "14": 2,
        "15": 2,
        "16": 1,
        "17": 1
    },
    "fc_spice_012": {
        "000": 64,
        "001": 48,
        "002": 48,
        "010": 48,
        "011": 36,
        "012": 36,
        "020": 48,
        "021": 36,
        "022": 36,
        "100": 48,
        "101": 36,
        "102": 36,
        "110": 36,
        "111": 27,
        "112": 27,
        "120": 27,
        "121": 36,
        "122": 27,
        "200": 48,
        "201": 36,
        "202": 36,
        "210": 36,
        "211": 27,
        "212": 27,
        "220": 36,
        "221": 27,
        "222": 27
    },
    "ks_sbt": {
        "6": 1,
        "7": 1,
        "8": 2,
        "9": 3,
        "10": 3,
        "11": 3,
        "12": 3,
        "13": 2,
        "14": 1,
        "15": 1
    },
    pk_lhd: {
        0: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 0,
                '虎': 1
            },
            sort: ['龙', '虎']
        },
        1: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 2,
                '虎': 3
            },
            sort: ['龙', '虎']
        },
        2: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 4,
                '虎': 5
            },
            sort: ['龙', '虎']
        },
        3: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 6,
                '虎': 7
            },
            sort: ['龙', '虎']
        },
        4: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 8,
                '虎': 9
            },
            sort: ['龙', '虎']
        }
    },
    pk_lhd_num: {
        num: {
            '一VS十-龙': '0',
            '一VS十-虎': '1',
            '二VS九-龙': '2',
            '二VS九-虎': '3',
            '三VS八-龙': '4',
            '三VS八-虎': '5',
            '四VS七-龙': '6',
            '四VS七-虎': '7',
            '五VS六-龙': '8',
            '五VS六-虎': '9'
        }
    }
};
//彩种
var LOTTERY = {
    "1": "重庆时时彩",
    "2": "江西时时彩",
    "3": "天津时时彩",
    "4": "福彩3D",
    "5": "排列三",
    "6": "江西11选5",
    "7": "新疆时时彩",
    "8": "重庆11选5",
    "9": "广东11选5",
    "10": "山东11选5",
    "11": "天津快乐十分",
    "12": "广东快乐十分",
    "13": "湖南快乐十分",
    "14": "上海时时乐",
    "15": "北京快乐8",
    "16": "香港六合彩",
    "17": "排列五",
    "18": "足球竞猜",
    "19": "百家乐",
    "20": "安徽11选5",
    "21": "重庆幸运农场",
    "22": "上海11选5",
    "23": "江苏快3",
    "24": "安徽快3",
    "25": "湖北快3",
    "26": "吉林快3",
    "27": "PK拾",
    "28": "秒秒彩",
    "29": "分分彩",
    "30": "五分彩",
    "32": "幸运28",
    "46": "北京五分彩",
    "47": "韩国1.5分彩",
    "48": "加拿大1.5分彩",
    "49": "台湾5分彩"
};
//彩票类型
var LOTTERY_TYPE = {
    '1': '时时彩',
    '2': '福彩',
    '3': '11选5',
    '4': '快乐十分',
    '5': '快乐8',
    '6': '香港六合彩',
    '7': '足球竞猜',
    '8': '百家乐',
    '9': '快三',
    '10': 'pk10',
    '11': '幸运28',
    '14': '幸运农场'
};
//彩种分类
var LOTTERY_METHOD = {
    '1': '1',
    '2': '1',
    '3': '1',
    '4': '2',
    '5': '2',
    '6': '3',
    '7': '1',
    '8': '3',
    '9': '3',
    '10': '3',
    '11': '4',
    '12': '4',
    '13': '4',
    '14': '2',
    '15': '5',
    '16': '6',
    '17': '1',
    '18': '7',
    '19': '8',
    '20': '3',
    '21': '14',
    '22': '3',
    '23': '9',
    '24': '9',
    '25': '9',
    '26': '9',
    '27': '10',
    '28': '1',
    '29': '1',
    '30': '1',
    '32': '13',
    "46": "1",
    "47": "1",
    "48": "1",
    "49": "1"
};
//---------------------------------------LRU--------------------------------------
function LRUCache(limit) {
    this.size = 0;
    this.limit = limit;
    this._keymap = {};
}

LRUCache.prototype.put = function (key, value) {
    var entry = {key: key, value: value};
    this._keymap[key] = entry;
    if (this.tail) {
        this.tail.newer = entry;
        entry.older = this.tail;
    } else {
        this.head = entry;
    }
    this.tail = entry;
    if (this.size === this.limit) {
        return this.shift();
    } else {
        this.size++;
    }
};

LRUCache.prototype.shift = function () {
    var entry = this.head;
    if (entry) {
        if (this.head.newer) {
            this.head = this.head.newer;
            this.head.older = undefined;
        } else {
            this.head = undefined;
        }
        entry.newer = entry.older = undefined;
        delete this._keymap[entry.key];
    }
    return entry;
};

LRUCache.prototype.get = function (key, returnEntry) {
    var entry = this._keymap[key];
    if (entry === undefined) return;
    if (entry === this.tail) {
        return returnEntry ? entry : entry.value;
    }
    if (entry.newer) {
        if (entry === this.head)
            this.head = entry.newer;
        entry.newer.older = entry.older;
    }
    if (entry.older)
        entry.older.newer = entry.newer;
    entry.newer = undefined;
    entry.older = this.tail;
    if (this.tail)
        this.tail.newer = entry;
    this.tail = entry;
    return returnEntry ? entry : entry.value;
};

LRUCache.prototype.find = function (key) {
    return this._keymap[key];
};

LRUCache.prototype.set = function (key, value) {
    var oldvalue, entry = this.get(key, true);
    if (entry) {
        oldvalue = entry.value;
        entry.value = value;
    } else {
        oldvalue = this.put(key, value);
        if (oldvalue) oldvalue = oldvalue.value;
    }
    return oldvalue;
};

LRUCache.prototype.remove = function (key) {
    var entry = this._keymap[key];
    if (!entry) return;
    delete this._keymap[entry.key];
    if (entry.newer && entry.older) {
        entry.older.newer = entry.newer;
        entry.newer.older = entry.older;
    } else if (entry.newer) {
        entry.newer.older = undefined;
        this.head = entry.newer;
    } else if (entry.older) {
        entry.older.newer = undefined;
        this.tail = entry.older;
    } else {
        this.head = this.tail = undefined;
    }

    this.size--;
    return entry.value;
};

LRUCache.prototype.removeAll = function () {
    this.head = this.tail = undefined;
    this.size = 0;
    this._keymap = {};
};

if (typeof Object.keys === 'function') {
    LRUCache.prototype.keys = function () {
        return Object.keys(this._keymap);
    };
} else {
    LRUCache.prototype.keys = function () {
        var keys = [];
        for (var k in this._keymap) keys.push(k);
        return keys;
    };
}

LRUCache.prototype.forEach = function (fun, context, desc) {
    var entry;
    if (context === true) {
        desc = true;
        context = undefined;
    }
    else if (typeof context !== 'object') context = this;
    if (desc) {
        entry = this.tail;
        while (entry) {
            fun.call(context, entry.key, entry.value, this);
            entry = entry.older;
        }
    } else {
        entry = this.head;
        while (entry) {
            fun.call(context, entry.key, entry.value, this);
            entry = entry.newer;
        }
    }
};

LRUCache.prototype.toJSON = function () {
    var s = [], entry = this.head;
    while (entry) {
        s.push({key: entry.key.toJSON(), value: entry.value.toJSON()});
        entry = entry.newer;
    }
    return s;
};
LRUCache.prototype.toString = function () {
    var s = '', entry = this.head;
    while (entry) {
        s += String(entry.key) + ':' + entry.value;
        entry = entry.newer;
        if (entry)
            s += ' < ';
    }
    return s;
};

if (typeof this === 'object') this.LRUCache = LRUCache;
/**
 * Created by NicoleQi on 2016/12/17.
 */
/*个人中心*/
function personalCenter(){
    $(".message-btn").click(function(){
        personal.getPersonal();
        $(".basic-data").click();
    })
}

/*弹窗主导航切换*/
function changeLeftMenu(){
       $(".pop-menu .recharge-nav a").click(function(){
        $(".pop-menu .recharge-nav a").removeClass("on");
        $(this).addClass("on");
        $(".pop-area .recharge-box,.pop-area .record-box,.pop-area .personal-box").hide();
        var title = $(this).html();
        $(".pop-area .big-title span").html(title);
        $(".body").css('overflow','hidden');
        if(title=="第三方充值"){
            $("#third-party").show();
        }else if(title=="账户提款"){
            $("#account-drawing").show();
            $(".recharge-box-area").siblings().hide();
            $(".recharge-box-area").show();
            bindBankEdit()
        }else if(title=="充取转记录"){
            $("#money-record").show();
        }else if(title=="彩票游戏"){
            $("#lottery-game-record").show();
        }else if(title=="账变记录"){
            $("#account-changes-record").show();
        }else if(title=="代理记录"){
            $("#proxy-record").show();
        }else if(title=="充提转记录"){
            $("#recharge-record").show();
        }else if(title=="基础信息"){
            $("#basic-data").show();
        }else if(title=="安全中心"){
           $("#safe-center").show();
          bindBankEdits();
        }else if(title=="密码修改"){
          $("#change-password").show();
          $('.account-content').show();
        }else if(title=="银行资料"){
          $("#bank-card-info").show();
          bindBankEditss();
        }else if(title=="奖金详情"){
            $("#bonus-details").show();
        }else if(title=="我的消息"){
          $(".account-message-content").show();
          $(".account-message-send").hide();
          $("#my-message").show();
          $(".account-message-content .row .btn-send").click(function () {
              $(".account-message-content").hide();
              $(".account-message-send").show();
          })
        }else if(title=="登录记录"){
            $("#login-record").show();
        }else if(title=="团队统计"){
            $("#total-team").show();
        }else if(title=="下级管理"){
            $("#sub-manager").show();
            $(".sub-manager-cont").hide();
            $("#sub-manager-message").show();
            //添加下级
            $(".sub-manager-cont .lower-level .sub-btn").click(function(){
                $("#sub-manager-message").hide();
                $("#sub-manager-add").show();
                $("#sub-manager-add .cancel-btn").click(function(){
                  $("#sub-manager-message").show();
                  $("#sub-manager-add").hide();
              })

            });
            //调点
            $(".sub-manager-cont .data-table td ul li.transfer-point").click(function(){
                $("#sub-manager-message").hide();
                $("#transfer-point-set").show();
                $("#transfer-point-set .cancel-btn").click(function(){
                  $("#sub-manager-message").show();
                  $("#transfer-point-set").hide();
              })
            });
           }else if(title=="开户中心"){
            $("#open-account").show();
            $(".open-account").hide();
            $("#open-account-cont").show();
            $(".open-account .account-search-form .btn").click(function(){
                $(".open-account").hide();
                $("#add-link").show();
                $("#add-link .cancel-btn").click(function(){
                    $(".open-account").show();
                    $("#add-link").hide();
                })
            })
        }else if(title=="配额管理"){
            $("#quota-management").show();
        }else if(title=="调点记录"){
            $("#transfer-point-record").show();
        }else if(title=="下级充值"){
            $("#lower-level-recharge").show();
        }else if(title=="下级取款"){
            $("#lower-level-draw").show();
        }else if(title=="彩票报表"){
            $("#lottery-report").show();
        }else if(title=="个人报表"){
            $("#personal-report").show();
        }else if(title=="盈亏报表"){
            $("#profit-report").show();
        }else if(title=="平台报表"){
            $("#platform-report").show();
        }
    });
}


var personal ={
    /*充值提款*/
    getPersonal:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.6',
            content:document.getElementById("personal-center"),
            width:'1000px',
            height:'auto',
            close:function(){
                $(".body").css('overflow','visible');
            }
        });
    }
};

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







var LOTTERY_DETAIL= {
    //彩种类型1     时时彩
    LOTTERY_1: {
        num_min: 0,
        num_max: 9,
        num_len: 1,
        run_num_length: 5,
        wf_class: {
            wf_wx: {
                title: '五星',
                row: {
                    '五星直选': ['150001', '150030', '150031'],
                    '五星组选': ['150041', '150042', '150043', '150044', '150045', '150046'],
                    '五星特殊': ['150060', '150061', '150062', '150063', '150064']
                },
                150001: {     //五星直选复式
                    type: 'select',
                    param: {
                        titles: {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_num_multiply'},
                    explain: '从万位、千位、百位、十位、个位各选一个号码组成一注。',
                    example: '投注方案：12345<br>开奖号码：12345，即中五星直选。',
                    help: '从万位、千位、百位、十位、个位中选择一个5位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。'
                },
                150030: {     //五星直选单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 5, check_type: 0},
                    explain: '手动输入号码，至少输入1个五位数号码组成一注。',
                    example: '投注方案：23456<br>开奖号码：23456，即中五星直选。',
                    help: '手动输入一个5位数号码组成一注，所选号码的万位、千位、百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。(五星直选单式每注的最大投注为10000注,如果确实想投注更多的号码，请拆分成多注后进行)'
                },
                150031: {     //五星组合
                    type: 'select',
                    param: {
                        titles: {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_group'},
                    explain: '从万位、千位、百位、十位、个位各选一个号码组成五注。',
                    example: '投注方案：<br/>购买：4+5+6+7+8，该票共10元，由以下5注：45678(五星)、5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：45678，即可中五星、四星、三星、二星、一星各1注。',
                    help: '从万位、千位、百位、十位、个位中至少各选一个号码组成1-5星的组合，共五注，所选号码的个位与开奖号码相同，则中1个5等奖；所选号码的个位、十位与开奖号码相同，则中1个5等奖以及1个4等奖，依此类推，最高可中5个奖。'
                },
                150041: {     //组选120
                    type: 'select',
                    param: {titles: {zx: '组选120'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 5},
                    explain: '从0-9中选择5个号码组成一注。',
                    example: '投注方案：10568<br/>开奖号码：10568（顺序不限），即可中五星组选120。',
                    help: '从0-9中任意选择5个号码组成一注，所选号码与开奖号码的万位、千位、百位、十位、个位相同，顺序不限，即为中奖。'
                },
                150042: {     //组选60
                    type: 'select',
                    param: {titles: {er: '二重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 3},
                    explain: '从“二重号”选择一个号码，“单号”中选择三个号码组成一注。',
                    example: '投注方案：二重号：8；单号：016<br/>开奖号码：01688（顺序不限），即可中五星组选60。',
                    help: '选择1个二重号码和3个单号号码组成一注，所选的单号号码与开奖号码相同，且所选二重号码在开奖号码中出现了2次，即为中奖。'
                },
                150043: {     //组选30
                    type: 'select',
                    param: {titles: {er: '二重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 1, moreRow: 0, base_len: 2},
                    explain: '从“二重号”选择两个号码，“单号”中选择一个号码组成一注。',
                    example: '投注方案：二重号：68；单号：0<br/>开奖号码：06688（顺序不限），即可中五星组选30。',
                    help: '选择2个二重号和1个单号号码组成一注，所选的单号号码与开奖号码相同，且所选的2个二重号码分别在开奖号码中出现了2次，即为中奖。'
                },
                150044: {     //组选20
                    type: 'select',
                    param: {
                        'titles': {san: '三重号', dan: '单号'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
                    explain: '从“三重号”选择一个号码，“单号”中选择两个号码组成一注。',
                    example: '投注方案：三重号：8；单号：01<br/>开奖号码：01888（顺序不限），即可中五星组选20。',
                    help: '选择1个三重号码和2个单号号码组成一注，所选的单号号码与开奖号码相同，且所选三重号码在开奖号码中出现了3次，即为中奖。'
                },
                150045: {     //组选10
                    type: 'select',
                    param: {titles: {san: '三重号', er: '二重号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
                    explain: '从“三重号”选择一个号码，“二重号”中选择一个号码组成一注。',
                    example: '投注方案：三重号：8；二重号：1<br/>开奖号码：11888（顺序不限），即可中五星组选10。',
                    help: '选择1个三重号码和1个二重号码，所选三重号码在开奖号码中出现3次，并且所选二重号码在开奖号码中出现了2次，即为中奖。'
                },
                150046: {     //组选5
                    type: 'select',
                    param: {titles: {si: '四重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
                    explain: '从“四重号”选择一个号码，“单号”中选择一个号码组成一注。',
                    example: '投注方案：四重号：8；单号：1<br/>开奖号码：18888（顺序不限），即可中五星组选5。',
                    help: '选择1个四重号码和1个单号号码组成一注，所选的单号存在于开奖号码中，且所选四重号码在开奖号码中出现了4次，即为中奖。'
                },
                150061: {     //一帆风顺
                    type: 'select',
                    param: {titles: {yi: '一帆风顺'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_num_count'},
                    explain: '从0-9中任意选择一个以上号码。',
                    example: '投注方案：8<br/>开奖号码：至少出现1个8，即中一帆风顺。',
                    help: '从0-9中任意选择1个号码组成一注，只要开奖号码的万位、千位、百位、十位、个位中包含所选号码，即为中奖。'
                },
                150062: {     //好事成双
                    type: 'select',
                    param: {titles: {hao: '好事成双'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_num_count'},
                    explain: '从0-9中任意选择一个以上的二重号码。',
                    example: '投注方案：8<br/>开奖号码：至少出现2个8，即中好事成双。',
                    help: '从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现2次，即为中奖。'
                },
                150063: {     //三星报喜
                    type: 'select',
                    param: {titles: {san: '三星报喜'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_num_count'},
                    explain: '从0-9中任意选择一个以上的三重号码。',
                    example: '投注方案：8<br/>开奖号码：至少出现3个8，即中三星报喜。',
                    help: '从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现3次，即为中奖。'
                },
                150064: {     //四季发财
                    type: 'select',
                    param: {titles: {si: '四季发财'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_num_count'},
                    explain: '从0-9中任意选择一个以上的四重号码。',
                    example: '投注方案：8<br/>开奖号码：至少出现4个8，即中四季发财。',
                    help: '从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现4次，即为中奖。'
                },
                150060: {     //百家乐
                    type: 'select',
                    param: {titles: {banker: '庄', xian: '闲'}, cs: 'bjl', selector: 1},
                    calculate: {method: 'formula_num_count'},
                    explain: '任意选择一个号码组成一注。',
                    example: '庄闲范例：如32698【3+2=5】vs【9+8=7】 闲赢<br>对子范例：如开奖:33678 庄对子<br>豹子范例：如开奖:66689 庄豹子<br>天王范例：如35423 庄[8点]天王',
                    help: '庄闲：[庄]万位+千位 VS [闲]十位+个位<br>对子：[庄]万位=千位相同<br>豹子：[庄]万位=千位=百位<br>天王：[庄]万位+千位=8点或者9点 即为天王',
                }
            },
            wf_sx: {
                title: '四星',
                row: {
                    '四星直选': ['140402', '140401', '140431', '141502', '141501', '141531'],
                    '四星组选': ['140441', '140442', '140443', '140444', '141541', '141542', '141543', '141544']
                },
                140401: {   //前四直选单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 4, check_type: 0},
                    'explain': '手动输入号码，至少输入1个四位数号码组成一注。',
                    'example': '投注方案：3456<br/>开奖号码：3456，即中四星直选。',
                    'help': '手动输入一个4位数号码组成一注，所选号码的万位、千位、百位、十位与开奖号码相同，且顺序一致，即为中奖。'
                },
                140402: {   //前四直选复式
                    type: 'select',
                    param: {
                        titles: {ww: '万位', qw: '千位', bw: '百位', sw: '十位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_num_multiply'},
                    explain: '从万位、千位、百位、十位各选一个号码组成一注。',
                    example: '投注方案：3456<br/>开奖号码：3456，即中四星直选。',
                    help: '从万位、千位、百位、十位中选择一个4位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。'
                },
                140431: {   //前四直选组合
                    type: 'select',
                    param: {
                        titles: {ww: '万位', qw: '千位', bw: '百位', sw: '十位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_group'},
                    explain: '从万位、千位、百位、十位各选一个号码组成四注。',
                    example: '投注方案：<br/>购买：5+6+7+8，该票共8元，由以下4注：5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：5678，即可中四星、三星、二星、一星各1注。',
                    help: '从万位、千位、百位、十位中至少各选一个号码组成1-4星的组合，共四注，所选号码的个位与开奖号码相同，则中1个4等奖；所选号码的十位、百位与开奖号码相同，则中1个4等奖以及1个3等奖，依此类推，最高可中4个奖。'
                },
                141502: {     //后四直选复式
                    type: 'select',
                    param: {
                        titles: {qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_num_multiply'},
                    explain: '从千位、百位、十位、个位各选一个号码组成一注。',
                    example: '投注方案：3456<br/>开奖号码：3456，即中四星直选。',
                    help: '从千位、百位、十位、个位中选择一个4位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。'
                },
                141501: {     //后四直选单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 4, check_type: 0},
                    'explain': '手动输入号码，至少输入1个四位数号码组成一注。',
                    'example': '投注方案：3456<br/>开奖号码：3456，即中四星直选。',
                    'help': '手动输入一个4位数号码组成一注，所选号码的千位、百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。'
                },
                141531: {     //后四直选组合
                    type: 'select',
                    param: {
                        titles: {qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_group'},
                    explain: '从千位、百位、十位、个位各选一个号码组成四注。',
                    example: '投注方案：<br/>购买：5+6+7+8，该票共8元，由以下4注：5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：5678，即可中四星、三星、二星、一星各1注。',
                    help: '从千位、百位、十位、个位中至少各选一个号码组成1-4星的组合，共四注，所选号码的个位与开奖号码相同，则中1个4等奖；所选号码的个位、十位与开奖号码相同，则中1个4等奖以及1个3等奖，依此类推，最高可中4个奖。'
                },
                140441: {     //前四组选24
                    type: 'select',
                    param: {titles: {zx: '组选24'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 4},
                    explain: '从0-9中选择4个号码组成一注。',
                    example: '投注方案：0568，开奖号码的四个数字只要包含0、5、6、8，即可中四星组选24。',
                    help: '从0-9中任意选择4个号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且顺序不限，即为中奖。'
                },
                140442: {     //前四组选12
                    type: 'select',
                    param: {titles: {er: '二重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
                    explain: '从“二重号”选择一个号码，“单号”中选择两个号码组成一注。',
                    example: '投注方案：二重号：8，单号：0、6，只要开奖的四个数字从小到大排列为 0、6、8、8，即可中四星组选12。',
                    help: '选择1个二重号码和2个单号号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且所选二重号码在开奖号码万位、千位、百位、十位中出现了2次，即为中奖。'
                },
                140443: {     //前四组选6
                    type: 'select',
                    param: {titles: {er: '二重号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 2},
                    explain: '从“二重号”选择两个号码组成一注。',
                    example: '投注方案：二重号：2、8，只要开奖的四个数字从小到大排列为 0、2、2、8、8，即可中四星组选6。',
                    help: '选择2个二重号码组成一注，所选的2个二重号码在开奖号码万位、千位、百位、十位分别出现了2次，即为中奖。'
                },
                140444: {     //前四组选4
                    type: 'select',
                    param: {titles: {san: '三重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
                    explain: '从“三重号”选择一个号码，“单号”中选择一个号码组成一注。',
                    example: '投注方案：三重号：8，单号：0、2，只要开奖的四个数字从小到大排列为 0、2、8、8、8，即可中四星组选4。',
                    help: '选择1个三重号码和1个单号号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且所选三重号码在开奖号码万位、千位、百位、十位中出现了3次，即为中奖。'
                },
                141541: {     //后四组选24
                    type: 'select',
                    param: {titles: {zx: '组选24'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 4},
                    explain: '从0-9中选择4个号码组成一注。',
                    example: '投注方案：0568，开奖号码的四个数字只要包含0、5、6、8，即可中四星组选24。',
                    help: '从0-9中任意选择4个号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且顺序不限，即为中奖。'
                },
                141542: {     //后四组选12
                    type: 'select',
                    param: {titles: {er: '二重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 2},
                    explain: '从“二重号”选择一个号码，“单号”中选择两个号码组成一注。',
                    example: '投注方案：二重号：8，单号：0、6，只要开奖的四个数字从小到大排列为 0、6、8、8，即可中四星组选12。',
                    help: '选择1个二重号码和2个单号号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且所选二重号码在开奖号码千位、百位、十位、个位中出现了2次，即为中奖。'
                },
                141543: {     //后四组选6
                    type: 'select',
                    param: {titles: {er: '二重号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 2},
                    explain: '从“二重号”选择两个号码组成一注。',
                    example: '投注方案：二重号：2、8，只要开奖的四个数字从小到大排列为 0、2、2、8、8，即可中四星组选6。',
                    help: '选择2个二重号码组成一注，所选的2个二重号码在开奖号码千位、百位、十位、个位分别出现了2次，即为中奖。'
                },
                141544: {     //后四组选4
                    type: 'select',
                    param: {titles: {san: '三重号', dan: '单号'}, begin: 0, end: 9, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_one_more', oneRow: 0, moreRow: 1, base_len: 1},
                    explain: '从“三重号”选择一个号码，“单号”中选择一个号码组成一注。',
                    example: '投注方案：三重号：8，单号：0、2，只要开奖的四个数字从小到大排列为 0、2、8、8、8，即可中四星组选4。',
                    help: '选择1个三重号码和1个单号号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且所选三重号码在开奖号码千位、百位、十位、个位中出现了3次，即为中奖。'
                }
            },
            'wf_qs': {
                title: '前三',
                row: {
                    '前三直选': ['17', '18', '130331', '130308', '130332'],
                    '前三组选': ['20', '21', '22', '23', '130307', '130339', '130333']/*,
                     '前三其他' : ['hezhiweishu','teshuhao']*/
                },
                '17': {     //前三直选复式
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从万位、千位、百位各选一个号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中前三直选。',
                    'help': '从万位、千位、百位中选择一个3位数号码组成一注，所选号码与开奖号码的前3位相同，且顺序一致，即为中奖。'
                },
                '18': {     //前三直选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中前三直选。',
                    'help': '手动输入一个3位数号码组成一注，所选号码的万位、千位、百位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '130331': {     //前三组选混合
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_group'},
                    'explain': '从万位、千位、百位各选一个号码组成三注。',
                    'example': '投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。',
                    'help': '从万位、千位、百位中至少各选择一个号码组成1-3星的组合共三注，当百位号码与开奖号码相同，则中1个3等奖；如果百位与千位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。'
                },
                '130308': {     //前三直选和值
                    'type': 'select',
                    'param': {'titles': {zhi: '和值'}, 'begin': 0, 'end': 27, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
                    'explain': '从0-27中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码前三位：001,010,100,即中前三直选。',
                    'help': '所选数值等于开奖号码的万位、千位、百位三个数字相加之和，即为中奖。'
                },
                '130332': {     //前三直选跨度
                    'type': 'select',
                    'param': {'titles': {zhi: '跨度'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
                    'explain': '从0-9中选择一个或一个以上号码。',
                    'example': '投注方案：跨度8<br/>开奖号码前三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中前三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中前三直选。',
                    'help': '所选数值等于开奖号码的前3位最大与最小数字相减之差，即为中奖。'
                },
                '20': {     //前三组三复式
                    'type': 'select',
                    'param': {
                        'titles': {zs_fs: '组三'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_fold', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：5,8,8<br/>开奖号码前三位：1个5，2个8 (顺序不限)，即中前三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的万位、千位、百位相同，且顺序不限，即为中奖。'
                },
                '21': {     //前三组三单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 4},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。',
                    'example': '投注方案：5,8,8<br/>开奖号码前三位：1个5，2个8 (顺序不限)，即中前三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的万位、千位、百位相同，且顺序不限，即为中奖。'
                },
                '22': {     //前三组六复式
                    'type': 'select',
                    'param': {
                        'titles': {zl_fs: '组六'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 3},
                    'explain': '从0-9中任意选择3个或3个以上号码。',
                    'example': '投注方案：2,5,8<br/>开奖号码前三位：1个2、1个5、1个8 (顺序不限)，即中前三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的万位、千位、百位相同，顺序不限，即为中奖。'
                },
                '23': {     //前三组六单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。',
                    'example': '投注方案：2,5,8<br/>开奖号码前三位：1个2、1个5、1个8 (顺序不限)，即中前三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的万位、千位、百位相同，顺序不限，即为中奖。'
                },
                '130307': {     //前三混合组选
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 3},
                    'explain': '手动输入号码，至少输入1个三位数号码。',
                    'example': '投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码前三位包括：(1)0,0,1，顺序不限，即中得前三组三；或者(2)1,2,3，顺序不限，即中得前三组六。',
                    'help': '手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的万位、千位、百位符合后三组三或组六均为中奖。'
                },
                '130339': {     //前三组选和值
                    'type': 'select',
                    'param': {'titles': {zx: '和值'}, 'begin': 1, 'end': 26, 'row_num_count': 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
                    'explain': '从1-26中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值3<br/>开奖号码前三位：(1)开出003号码，顺序不限，即中前三组三；(2)开出012号码，顺序不限，即中前三组六。',
                    'help': '所选数值等于开奖号码万位、千位、百位三个数字相加之和(不含豹子号)，即为中奖。'
                },
                '130333': {     //前三组选包胆
                    'type': 'select',
                    'param': {'titles': {zx: '包胆'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
                    'explain': '从0-9中任意选择一个号码。',
                    'example': '投注方案：包胆3<br/>开奖号码前三位：(1)出现3xx或者33x,即中前三组三；(2)出现3xy，即中前三组六。',
                    'help': '从0-9中任意选择1个包胆号码，开奖号码的万位、千位、百位中任意1位只要和所选包胆号码相同(不含豹子号)，即为中奖。'
                },
                'qs_hz_ws': {     //前三和值尾数
                    'type': 'select',
                    'param': {
                        'titles': {hz_ws: '和值尾数'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从0-9中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值尾数8<br/>开奖号码：前三位和值尾数为8，即中得和值尾数。',
                    'help': '所选数值等于开奖号码的万位、千位、百位三个数字相加之和的尾数，即为中奖。'
                },
                'qs_ts': {       //前三特殊号
                    'type': 'select',
                    'param': {'titles': {tsh: '特殊号'}, 'cs': 'tsh', 'selector': 0},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '选择一个号码形态。',
                    'example': '投注方案：豹子<br/>开奖号码前三位：三个数字全部相同，即中得豹子。<br/>投注方案：顺子<br/>开奖号码前三位：为连续数字，例如678，即中得顺子。<br/>投注方案：对子<br/>开奖号码前三位：3个数字中有2个数字相同，即中得对子。',
                    'help': '所选的号码特殊属性和开奖号码前3位的属性一致，即为中奖。其中：1.顺子号的万、千、百位不分顺序(特别号码：019、089也是顺子号)；2.对子号指的是开奖号码的前三位当中，任意2位数字相同的三位数号码。'
                }
            },
            'wf_zs': {
                title: '中三',
                row: {
                    '中三直选': ['131402', '131401', '131431', '131408', '131432'],
                    '中三组选': ['131404', '131403', '131406', '131405', '150065', '131439', '131433']
                },
                '131402': {      //中三直选复式
                    'type': 'select',
                    'param': {
                        'titles': {qw: '千位', bw: '百位', sw: '十位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从千位、百位、十位各选一个号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中中三直选。',
                    'help': '从千位、百位、十位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。'
                },
                '131401': {      //中三直选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中中三直选。',
                    'help': '手动输入一个3位数号码组成一注，所选号码的千位、百位、十位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '132531': {     //中三组选混合
                    'type': 'select',
                    'param': {
                        'titles': {qw: '千位', bw: '百位', sw: '十位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_group'},
                    'explain': '从千位、百位、十位各选一个号码组成三注。',
                    'example': '投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。',
                    'help': '从千位、百位、十位中至少各选择一个号码组成1-3星的组合共三注，当个位号码与开奖号码相同，则中1个3等奖；如果个位与十位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。'
                },
                '150065': {     //中三组选混合
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 3},
                    'explain': '手动输入号码，至少输入1个三位数号码。',
                    'example': '投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码后三位包括：(1)0,0,1，顺序不限，即中得中三组三；或者(2)1,2,3，顺序不限，即中得中三组六。',
                    'help': '手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的千位、百位、十位符合后三组三或组六均为中奖。'
                },
                '131408': {      //中三直选和值
                    'type': 'select',
                    'param': {'titles': {zhi: '和值'}, 'begin': 0, 'end': 27, 'row_num_count': 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
                    'explain': '从0-27中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码中三位：001,010,100,即中中三直选。',
                    'help': '所选数值等于开奖号码的千位、百位、十位三个数字相加之和，即为中奖。'
                },
                '131404': {      //中三组三复式
                    'type': 'select',
                    'param': {
                        'titles': {zs_fs: '组三'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_fold', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：5,8,8<br/>开奖号码中三位：1个5，2个8 (顺序不限)，即中中三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的千位、百位、十位相同，且顺序不限，即为中奖。'
                },
                '131403': {      //中三组三单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 4},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。',
                    'example': '投注方案：5,8,8<br/>开奖号码中三位：1个5，2个8 (顺序不限)，即中中三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的千位、百位、十位相同，且顺序不限，即为中奖。'
                },
                '131406': {      //中三组六复式
                    'type': 'select',
                    'param': {
                        'titles': {zl_fs: '组六'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 3},
                    'explain': '从0-9中任意选择3个或3个以上号码。',
                    'example': '投注方案：2,5,8<br/>开奖号码中三位：1个2、1个5、1个8 (顺序不限)，即中中三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的千位、百位、十位相同，顺序不限，即为中奖。'
                },
                '131405': {      //中三组六单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。',
                    'example': '投注方案：2,5,8<br/>开奖号码中三位：1个2、1个5、1个8 (顺序不限)，即中中三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的千位、百位、十位相同，顺序不限，即为中奖。'
                },
                '131439': {     //中三组选和值
                    'type': 'select',
                    'param': {'titles': {zx: '和值'}, 'begin': 1, 'end': 26, 'row_num_count': 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
                    'explain': '从1-26中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值3<br/>开奖号码中三位：(1)开出003号码，顺序不限，即中中三组三；(2)开出012号码，顺序不限，即中中三组六。',
                    'help': '所选数值等于开奖号码千位、百位、十位三个数字相加之和(不含豹子号)，即为中奖。'
                },
                '131433': {     //中三组选包胆
                    'type': 'select',
                    'param': {'titles': {zx: '包胆'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
                    'explain': '从0-9中任意选择一个号码。',
                    'example': '投注方案：包胆3<br/>开奖号码中三位：(1)出现3xx或者33x,即中中三组三；(2)出现3xy，即中中三组六。',
                    'help': '从0-9中任意选择1个包胆号码，开奖号码的千位、百位、十位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。'
                },
                '131431': {    //中三直选混合
                    'type': 'select',
                    'param': {
                        'titles': {qw: '千位', bw: '百位', sw: '十位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_group'},
                    'explain': '从千位、百位、十位各选一个号码组成三注。',
                    'example': '投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。',
                    'help': '从千位、百位、十位中至少各选择一个号码组成1-3星的组合共三注，当百位号码与开奖号码相同，则中1个3等奖；如果百位与千位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。'
                },
                '131432': {     //中三直选跨度
                    'type': 'select',
                    'param': {'titles': {zhi: '跨度'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
                    'explain': '从0-9中选择一个以上号码。',
                    'example': '投注方案：跨度8<br/>开奖号码中间三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中中三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中中三直选。',
                    'help': '所选数值等于开奖号码的中间3位最大与最小数字相减之差，即为中奖。'
                }
            },
            'wf_hs': {
                title: '后三',
                row: {
                    '后三直选': ['2', '3', '132531', '8', '132532'],
                    '后三组选': ['4', '5', '6', '7', '132407', '132539', '132533']/*,
                     '后三其他' : ['hezhiweishu','teshuhao']*/
                },
                '2': {      //后三直选复式
                    'type': 'select',
                    'param': {
                        'titles': {bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从百位、十位、个位各选一个号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中后三直选。',
                    'help': '从百位、十位、个位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。'
                },
                '3': {      //后三直选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '投注方案：345<br/>开奖号码：345，即中后三直选。',
                    'help': '手动输入一个3位数号码组成一注，所选号码的百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '132531': {     //后三组选混合
                    'type': 'select',
                    'param': {
                        'titles': {bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_group'},
                    'explain': '从百位、十位、个位各选一个号码组成三注。',
                    'example': '投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。',
                    'help': '从百位、十位、个位中至少各选择一个号码组成1-3星的组合共三注，当个位号码与开奖号码相同，则中1个3等奖；如果个位与十位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。'
                },
                '8': {      //后三直选和值
                    'type': 'select',
                    'param': {'titles': {zhi: '和值'}, 'begin': 0, 'end': 27, 'row_num_count': 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
                    'explain': '从0-27中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码后三位：001,010,100,即中后三直选。',
                    'help': '所选数值等于开奖号码的百位、十位、个位三个数字相加之和，即为中奖。'
                },
                '132532': {     //后三直选跨度
                    'type': 'select',
                    'param': {'titles': {zhi: '跨度'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'kd_san', num_separator: ','},
                    'explain': '从0-9中选择一个以上号码。',
                    'example': '投注方案：跨度8<br/>开奖号码后三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中后三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中后三直选。',
                    'help': '所选数值等于开奖号码的后3位最大与最小数字相减之差，即为中奖。'
                },
                '4': {      //后三组三复式
                    'type': 'select',
                    'param': {
                        'titles': {zs_fs: '组三'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_fold', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：5,8,8<br/>开奖号码后三位：1个5，2个8 (顺序不限)，即中后三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的百位、十位、个位相同，且顺序不限，即为中奖。'
                },
                '5': {      //后三组三单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 4},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。',
                    'example': '投注方案：5,8,8<br/>开奖号码后三位：1个5，2个8 (顺序不限)，即中后三组三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的百位、十位、个位相同，且顺序不限，即为中奖。'
                },
                '6': {      //后三组六复式
                    'type': 'select',
                    'param': {
                        'titles': {zl_fs: '组六'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 3},
                    'explain': '从0-9中任意选择3个或3个以上号码。',
                    'example': '投注方案：2,5,8<br/>开奖号码后三位：1个2、1个5、1个8 (顺序不限)，即中后三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。'
                },
                '7': {      //后三组六单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。',
                    'example': '投注方案：2,5,8<br/>开奖号码后三位：1个2、1个5、1个8 (顺序不限)，即中后三组六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。'
                },
                '132407': {     //后三组选混合
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 3, 'check_type': 3},
                    'explain': '手动输入号码，至少输入1个三位数号码。',
                    'example': '投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码后三位包括：(1)0,0,1，顺序不限，即中得后三组三；或者(2)1,2,3，顺序不限，即中得后三组六。',
                    'help': '手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的百位、十位、个位符合后三组三或组六均为中奖。'
                },
                '132539': {     //后三组选和值
                    'type': 'select',
                    'param': {'titles': {zx: '和值'}, 'begin': 1, 'end': 26, 'row_num_count': 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
                    'explain': '从1-26中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值3<br/>开奖号码后三位：(1)开出003号码，顺序不限，即中后三组三；(2)开出012号码，顺序不限，即中后三组六。',
                    'help': '所选数值等于开奖号码百位、十位、个位三个数字相加之和(不含豹子号)，即为中奖。'
                },
                '132533': {     //后三组选包胆
                    'type': 'select',
                    'param': {'titles': {zx: '包胆'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_count_fold', 'bet': '54', num_separator: '$'},
                    'explain': '从0-9中任意选择一个号码。',
                    'example': '投注方案：包胆3<br/>开奖号码后三位：(1)出现3xx或者33x,即中后三组三；(2)出现3xy，即中后三组六。',
                    'help': '从0-9中任意选择1个包胆号码，开奖号码的百位、十位、个位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。'
                },
                'hs_hz_ws': {       //后三和值尾数
                    'type': 'select',
                    'param': {
                        'titles': {hz_ws: '和值尾数'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从0-9中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值尾数8<br/>开奖号码：后三位和值尾数为8，即中得和值尾数。',
                    'help': '所选数值等于开奖号码的百位、十位、个位三个数字相加之和的尾数，即为中奖。'
                },
                'hs_ts': {     //后三特殊号
                    'type': 'select',
                    'param': {'titles': {tsh: '特殊号'}, 'cs': 'tsh', 'selector': 0},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '选择一个号码形态。',
                    'example': '投注方案：豹子<br/>开奖号码后三位：三个数字全部相同，即中得豹子。<br/>投注方案：顺子<br/>开奖号码后三位：为连续数字，例如678，即中得顺子。<br/>投注方案：对子<br/>开奖号码后三位：3个数字中有2个数字相同，即中得对子。',
                    'help': '所选的号码特殊属性和开奖号码后3位的属性一致，即为中奖。其中：1.顺子号的个、十、百位不分顺序(特别号码：019、089也是顺子号)；2.对子号指的是开奖号码的后三位当中，任意2位数字相同的三位数号码。'
                }
            },
            'wf_qe': {
                title: '前二',
                row: {
                    '前二直选': ['10', '11', '120238', '120232'],
                    '前二组选': ['120204', '120203', '120239', '120233']
                },
                '10': {     //前二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从万位、千位各选一个号码组成一注。',
                    'example': '投注方案：58<br/>开奖号码前二位：58，即中前二直选。',
                    'help': '从万位、千位中选择一个2位数号码组成一注，所选号码与开奖号码的前2位相同，且顺序一致，即为中奖。'
                },
                '11': {     //前二直选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 2, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br/>开奖号码前二位：58，即中前二直选。',
                    'help': '手动输入一个2位数号码组成一注，所选号码的万位、千位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '120238': {     //前二直选和值
                    'type': 'select',
                    'param': {'titles': {zhi: '和值'}, 'begin': 0, 'end': 18, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_er', num_separator: '$'},
                    'explain': '从0-18中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码前二位：01,10，即中前二直选。',
                    'help': '所选数值等于开奖号码的万位、千位二个数字相加之和，即为中奖。'
                },
                '120232': {     //前二直选跨度
                    'type': 'select',
                    'param': {'titles': {zhi: '跨度'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'kd_er', num_separator: ','},
                    'explain': '从0-9中选择一个或一个以上号码。',
                    'example': '投注方案：跨度9<br/>开奖号码为9,0,-,-,-或0,9,-,-,-，即中前二直选。',
                    'help': '所选数值等于开奖号码的前2位最大与最小数字相减之差，即为中奖。'
                },
                '120204': {     //前二组选复式
                    'type': 'select',
                    'param': {'titles': {zx: '组选'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：5,8<br/>开奖号码前二位：85 或58(顺序不限，不含对子号)，即中前二组选。',
                    'help': '从0-9中选2个号码组成一注，所选号码与开奖号码的万位、千位相同，顺序不限（不含对子号），即中奖。'
                },
                '120203': {     //前二组选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 2, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个二位数号码。',
                    'example': '投注方案：5,8<br/>开奖号码前二位：85 或58(顺序不限，不含对子号)，即中前二组选。',
                    'help': '手动输入一个2位数号码组成一注，所选号码的万位、千位与开奖号码相同，顺序不限（不含对子号），即为中奖。'
                },
                '120239': {     //前二组选和值
                    'type': 'select',
                    'param': {'titles': {zx: '和值'}, 'begin': 1, 'end': 17, 'row_num_count': 9, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_er', num_separator: '$'},
                    'explain': '从1-17中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码前二位：10或01 (顺序不限，不含对子号)，即中前二组选。',
                    'help': '所选数值等于开奖号码的万位、千位二个数字相加之和（不含对子号），即为中奖。'
                },
                '120233': {     //前二组选包胆
                    'type': 'select',
                    'param': {'titles': {zx: '包胆'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_count_fold', 'bet': 9, num_separator: '$'},
                    'explain': '从0-9中任意选择一个号码。',
                    'example': '投注方案：包胆号码8<br/>开奖号码前二位：出现1个8（不包括2个8），即中前二组选。',
                    'help': '从0-9中任意选择1个包胆号码，开奖号码的万位、千位中任意1位包含所选的包胆号码相同（不含对子号），即为中奖。'
                }
            },
            'wf_he': {
                title: '后二',
                row: {
                    '后二直选': ['12', '13', '123538', '123532'],
                    '后二组选': ['14', '15', '123539', '123533']
                },
                '12': {     //后二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从十位、个位各选一个号码组成一注。',
                    'example': '投注方案：58<br/>开奖号码后二位：58，即中后二直选。',
                    'help': '从十位、个位中选择一个2位数号码组成一注，所选号码与开奖号码的十位、个位相同，且顺序一致，即为中奖。'
                },
                '13': {     //后二直选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 2, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br/>开奖号码后二位：58，即中后二直选。',
                    'help': '手动输入一个2位数号码组成一注，所选号码的十位、个位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '123538': {     //后二直选和值
                    'type': 'select',
                    'param': {'titles': {zhi: '和值'}, 'begin': 0, 'end': 18, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_er', num_separator: '$'},
                    'explain': '从0-18中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码后二位：01,10，即中后二直选。',
                    'help': '所选数值等于开奖号码的十位、个位二个数字相加之和，即为中奖。'
                },
                '123532': {     //后二直选跨度
                    'type': 'select',
                    'param': {'titles': {zhi: '跨度'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'kd_er', num_separator: ','},
                    'explain': '从0-9中选择一个或一个以上号码。',
                    'example': '投注方案：跨度9<br/>开奖号码为-,-,-,9,0或-,-,-,0,9，即中后二直选。',
                    'help': '所选数值等于开奖号码的后2位最大与最小数字相减之差，即为中奖。'
                },
                '14': {     //后二组选复式
                    'type': 'select',
                    'param': {'titles': {zx: '组选'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：5,8<br/>开奖号码后二位：85 或58 (顺序不限，不含对子号)，即中后二组选。',
                    'help': '从0-9中选2个号码组成一注，所选号码与开奖号码的十位、个位相同，顺序不限（不含对子号），即为中奖。'
                },
                '15': {     //后二组选单式
                    'type': 'input',
                    param: {},
                    calculate: {'base_len': 2, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个二位数号码。',
                    'example': '投注方案：5,8<br/>开奖号码后二位：85 或58 (顺序不限，不含对子号)，即中后二组选。',
                    'help': '手动输入一个2位数号码组成一注，所选号码的十位、个位与开奖号码相同，顺序不限（不含对子号），即为中奖。'
                },
                '123539': {     //后二组选和值
                    'type': 'select',
                    'param': {'titles': {zx: '和值'}, 'begin': 1, 'end': 17, 'row_num_count': 9, 'selector': 2},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_er', num_separator: '$'},
                    'explain': '从1-17中任意选择一个或一个以上号码。',
                    'example': '投注方案：和值1<br/>开奖号码后二位：10或01(顺序不限，不含对子号)，即中后二组选。',
                    'help': '所选数值等于开奖号码的十位、个位二个数字相加之和（不含对子号），即为中奖。'
                },
                '123533': {     //后二组选包胆
                    'type': 'select',
                    'param': {'titles': {zx: '包胆'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_count_fold', 'bet': 9, num_separator: '$'},
                    'explain': '从0-9中任意选择一个号码。',
                    'example': '投注方案：包胆号码8<br/>开奖号码后二位：出现1个8（不包括2个8），即中后二组选。',
                    'help': '从0-9中任意选择1个包胆号码，开奖号码的十位、个位中任意1位包含所选的包胆号码相同（不含对子号），即为中奖。'
                }
            },
            'wf_dwd': {
                title: '定位胆',
                row: {
                    '定位胆': ['9']
                },
                '9': {  //五星定位胆
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从万位、千位、百位、十位、个位任意位置上选择1个或一个以上号码。',
                    'example': '投注方案：万位 1<br>开奖号码：万位 1，即中定位胆万位。',
                    'help': '从万位、千位、百位、十位、个位任意位置上至少选择1个以上号码，所选号码与相同位置上的开奖号码一致，即为中奖。'
                }
            },
            'wf_bdw': {
                title: '不定位',
                row: {
                    '三星': ['19', '131409', '1', '130352', '131452', '132552'],
                    '四星': ['141551', '141552'],
                    '五星': ['150052', '150053']
                },
                '1': {      //后三不定位复式
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从0-9中任意选择1个以上号码。',
                    'example': '投注方案：1<br/>开奖号码后三位：至少出现1个1，即中后三一码不定位。',
                    'help': '从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的百位、十位、个位中包含所选号码，即为中奖。'
                },
                '19': {     //前三不定位复式
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从0-9中任意选择1个以上号码。',
                    'example': '投注方案：1<br/>开奖号码前三位：至少出现1个1，即中前三一码不定位。',
                    'help': '从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的万位、千位、百位中包含所选号码，即为中奖。'
                },
                '131409': {   //中三不定位复式
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从0-9中任意选择1个以上号码。',
                    'example': '投注方案：1<br/>开奖号码前三位：至少出现1个1，即中三一码不定位。',
                    'help': '从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的千位、百位、十位中包含所选号码，即为中奖。'
                },
                '132552': {     //后三二码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个以上号码。',
                    'example': '投注方案：1,2<br/>开奖号码后三位：至少出现1和2各1个，即中后三二码不定位。',
                    'help': '从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的百位、十位、个位中同时包含所选的2个号码，即为中奖。'
                },
                '131452': {     //中三二码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个以上号码。',
                    'example': '投注方案：1,2<br/>开奖号码中间三位：至少出现1和2各1个，即中中三二码不定位。',
                    'help': '从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的千位、百位、十位中同时包含所选的2个号码，即为中奖。'
                },
                '130352': {     //前三二码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个以上号码。',
                    'example': '投注方案：1,2<br/>开奖号码前三位：至少出现1和2各1个，即中前三二码不定位。',
                    'help': '从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的万位、千位、百位中同时包含所选的2个号码，即为中奖。'
                },
                '141551': {     //后四一码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从0-9中任意选择1个以上号码。',
                    'example': '投注方案：1<br/>开奖号码后四位：至少出现1个1，即中四星一码不定位。',
                    'help': '从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的千位、百位、十位、个位中包含所选号码，即为中奖。'
                },
                '141552': {     //后四二码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个以上号码。',
                    'example': '投注方案：1,2<br/>开奖号码后四位：至少出现1和2各1个，即中四星二码不定位。',
                    'help': '从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的千位、百位、十位、个位中同时包含所选的2个号码，即为中奖。'
                },
                '150052': {     //五星二码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个以上号码。',
                    'example': '投注方案：1,2<br/>开奖号码：至少出现1和2各1个，即中五星二码不定位。',
                    'help': '从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的万位、千位、百位、十位、个位中同时包含所选的2个号码，即为中奖。'
                },
                '150053': {     //五星三码不定位
                    'type': 'select',
                    'param': {'titles': {bdw: '不定位'}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 3},
                    'explain': '从0-9中任意选择3个以上号码。',
                    'example': '投注方案：1,2,3<br/>开奖号码：至少出现1、2、3各1个，即中五星三码不定位。',
                    'help': '从0-9中选择3个号码，每注由3个不同的号码组成，开奖号码的万位、千位、百位、十位、个位中同时包含所选的3个号码，即为中奖。'
                }
            },
            'wf_dx_ds': {
                title: '大小单双',
                row: {
                    '大小单双': ['120205', '16', '130337', '132537']
                },
                '120205': {     //前二大小单双
                    'type': 'select',
                    'param': {'titles': {ww: '万位', qw: '千位'}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从万位、千位中的“大、小、单、双”中至少各选一个组成一注。',
                    'example': '投注方案：小双<br/>开奖号码万位与千位：小双，即中前二大小单双。',
                    'help': '对万位、千位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                },
                '16': {     //后二大小单双
                    'type': 'select',
                    'param': {'titles': {sw: '十位', ge: '个位'}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从十位、个位中的“大、小、单、双”中至少各选一个组成一注。',
                    'example': '投注方案：大单<br/>开奖号码十位与个位：大单，即中后二大小单双。',
                    'help': '对十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                },
                '130337': {     //前三大小单双
                    'type': 'select',
                    'param': {'titles': {ww: '万位', qw: '千位', bw: '百位'}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从万位、千位、百位中的“大、小、单、双”中至少各选一个组成一注。',
                    'example': '投注方案：小双小<br/>开奖号码万、千、百位：小双小，即中前三大小单双。',
                    'help': '对万位、千位和百位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                },
                '132537': {     //后三大小单双
                    'type': 'select',
                    'param': {'titles': {bw: '百位', sw: '十位', ge: '个位'}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从百位、十位、个位中的“大、小、单、双”中至少各选一个组成一注。',
                    'example': '投注方案：大单大<br/>开奖号码百、十、个位：大单大，即中后三大小单双。',
                    'help': '对百位、十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                }
            },
            'wf_lhd': {
                title: '龙虎斗',
                row: {
                    '龙虎斗': ['150069']
                },
                '150069': {
                    type: 'select',
                    param: {'titles': {wz: "位置", hm: "号码"}, 'cs': 'ssc_lhd'},
                    calculate: {
                        method: 'formula_num_multiply',
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从选择位置上选择一个形态组成一注。',
                    example: '投注方案：龙；开奖号码十位大于个位：龙，即中奖。',
                    help: '根据十位、个位号码数值比大小，十位号码大于个位号码为龙，十位号码小于个位号码为虎，号码相同则为和。所选形态与开奖号码形态一致，即为中奖。'
                }
            },
            'wf_qh': {
                title: '任选玩法'
            }
        },
        'wf_class_rx': {
            'wf_rx_er': {
                title: '任选二',
                row: {
                    '任二直选': ['120002', '120001', '120038'],
                    '任二组选': ['120004', '120003', '120039']
                },
                '120002': {     //任选二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_rx_zhi_fs', 'base_len': 2},
                    'explain': '从万位、千位、百位、十位、个位中至少两位上各选一个号码组成一注。',
                    'example': '投注方案：万位1，十位2<br/>开奖号码：1**2*，即中任二直选。',
                    'help': '从万位、千位、百位、十位、个位中任意选择两个位，在这两个位上至少各选1个号码组成一注，所选2个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。'
                },
                '120001': {     //任选二直选单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 2, 'check_type': 0, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择两个位置，至少手动输入一个两位数号码组成一注。',
                    'example': '投注方案：勾选位置千位、个位，输入号码12<br/>开奖号码：*1**2，即中任二直选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选两个位置，手动输入一个两位数号码组成一注，所选2个位置和输入的号码都与开奖号码相同，且顺序一致，即为中奖。'
                },
                '120038': {     //任选二直选和值
                    'type': 'select',
                    'param': {
                        'titles': {'zhi': '和值'},
                        'begin': 0,
                        'end': 18,
                        'row_num_count': 10,
                        'selector': 0,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_value_add',
                        'base_len': 2,
                        'value': 'zhi_er',
                        num_separator: '$',
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择两个位置，至少选择一个和值号码组成一注。',
                    'example': '投注方案：勾选位置千位、个位，选择和值15<br/>开奖号码：*8**7，即中任二直选和值。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选两个位置，然后选择一个和值，所选2个位置的开奖号码相加之和与所选和值一致，且顺序一致，即为中奖。'
                },
                '120004': {     //任选二组选复式
                    'type': 'select',
                    'param': {
                        'titles': {'zx': '组选'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {'method': 'formula_rx_zu_fs', 'base_len': 2, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择两个位置，号码区至少选择两个号码组成一注。',
                    'example': '投注方案：勾选位置万位、个位，选择号码79<br/>开奖号码：9***7 或 7***9，均中任二组选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选两个位置，然后从0-9中选择两个号码组成一注，所选2个位置的开奖号码与所选号码一致，顺序不限，即为中奖。'
                },
                '120003': {     //任选二组选单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 2, 'check_type': 1, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择两个位置，至少手动输入一个两位数号码组成一注。',
                    'example': '投注方案：勾选位置万位、个位，输入号码79<br/>开奖号码：9***7 或 7***9，均中任二组选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选两个位置，然后输入两个号码组成一注，所选2个位置的开奖号码与输入号码一致，顺序不限，即为中奖。'
                },
                '120039': {     //任选二组选和值
                    'type': 'select',
                    'param': {
                        'titles': {'zx': '和值'},
                        'begin': 1,
                        'end': 17,
                        'row_num_count': 10,
                        'selector': 0,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_value_add',
                        'value': 'zu_er',
                        'base_len': 2,
                        num_separator: '$',
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择两个位置，至少选择一个和值号码组成一注。',
                    'example': '投注方案：勾选位置千位、个位，选择和值6<br/>开奖号码：*4**2 或 *2**4，均中任二组选和值',
                    'help': '从万位、千位、百位、十位、个位中任意勾选两个位置，然后选择一个和值，所选2个位置的开奖号码相加之和与所选和值一致，顺序不限，即为中奖。'
                }
            },
            'wf_rx_san': {
                title: '任选三',
                row: {
                    '任三直选': ['130002', '130001', '130038'],
                    '任三组选': ['130042', '130041', '130044', '130043', '130030', '130039']
                },
                '130002': {     //任选三直选复式
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_rx_zhi_fs', 'base_len': 3},
                    'explain': '从万位、千位、百位、十位、个位中至少三位上各选一个号码组成一注。',
                    'example': '投注方案：万位1、千位5、十位2<br/>开奖号码：15*2*，即中任三直选。',
                    'help': '从万位、千位、百位、十位、个位中任意选择三个位，在这三个位上至少各选1个号码组成一注，所选3个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。'
                },
                '130001': {     //任选三直选单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 3, 'check_type': 0, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输入一个三位数号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、个位，输入号码152<br/>开奖号码：15**2，即中任三直选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，手动输入一个三位数号码组成一注，所选三个位置上的开奖号码与输入号码完全相同，且顺序一致，即为中奖。'
                },
                '130038': {     //任选三直选和值
                    'type': 'select',
                    'param': {
                        'titles': {'zx_hz': '和值'},
                        'begin': 0,
                        'end': 27,
                        'row_num_count': 10,
                        'selector': 0,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_value_add',
                        'value': 'zhi_san',
                        'base_len': 3,
                        num_separator: '$',
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，至少选择一个和值号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、个位，选择和值8<br/>开奖号码：22**4，即中任三直选和值。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后选择一个和值，所选3个位置的开奖号码相加之和与所选和值一致，且顺序一致，即为中奖。'
                },
                '130042': {     //任选三组三复式
                    'type': 'select',
                    'param': {
                        'titles': {'zs_fs': '组三'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {'method': 'formula_rx_zs_fs', 'num_len': 2, 'base_len': 3, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，号码区至少选择两个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、个位，选择号码18<br/>开奖号码：11**8 或 18**1，均中任三组三。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后从0-9中选择两个号码组成一注，所选3个位置的开奖号码与所选号码一致，顺序不限，即为中奖。'
                },
                '130041': {     //任选三组三单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 3, 'check_type': 2, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输入两个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、个位，输入号码779<br/>开奖号码：97**7 或 79**7，均中任三组三。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入两个号相同号码和一个不同号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。'
                },
                '130044': {     //任选三组六复式
                    'type': 'select',
                    'param': {
                        'titles': {'zl_fs': '组六'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {'method': 'formula_rx_zu_fs', 'base_len': 3, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，号码区至少选择三个号码组成一注。',
                    'example': '投注方案：勾选位置万位、百位、个位，选择号码159<br/>开奖号码：1*5*9 或 9*1*5，均中任三组六。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后从0-9中选择三个号码组成一注，所选3个位置的开奖号码与所选号码一致，顺序不限，即为中奖。'
                },
                '130043': {     //任选三组六单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 3, 'check_type': 1, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输三个号码组成一注。',
                    'example': '投注方案：勾选位置万位、百位、个位，选择号码159<br/>开奖号码：1*5*9 或 9*1*5，即中任三组六。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入三个各不相同的3个号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。'
                },
                '130030': {     //任选三组选混合
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 3, 'check_type': 3, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，手动至少输入三个号码组成一注（不包含豹子号）。',
                    'example': '投注方案：勾选位置千位、百位、个位，分別投注(0,0,1),以及(1,2,3)<br/>开奖号码：*00*1，顺序不限，即中任三组三；或者(2)*21*3，顺序不限，即中任三组六。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入三个号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。'
                },
                '130039': {     //任选三组选和值
                    'type': 'select',
                    'param': {
                        'titles': {'zx_hz': '和值'},
                        'begin': 1,
                        'end': 26,
                        'row_num_count': 10,
                        'selector': 0,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_value_add',
                        'value': 'zu_san',
                        'base_len': 3,
                        num_separator: '$',
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择三个位置，至少选择一个和值号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、个位；选择和值8<br/>开奖号码：13**4 顺序不限，即中任三直选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选三个位置，然后选择一个和值，所选3个位置的开奖号码相加之和与所选和值一致，顺序不限，即为中奖。'
                }
            },
            'wf_rx_si': {
                title: '任选四',
                row: {
                    '任四直选': ['140002', '140001'],
                    '任四组选': ['140041', '140042', '140043', '140044']
                },
                '140002': {     //任选四直选复式
                    'type': 'select',
                    'param': {
                        'titles': {ww: '万位', qw: '千位', bw: '百位', sw: '十位', ge: '个位'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_rx_zhi_fs', 'base_len': 4},
                    'explain': '从万位、千位、百位、十位、个位中至少四位上各选一个号码组成一注。',
                    'example': '投注方案：万位1、千位5、百位0、十位2<br/>开奖号码：1502*，即中任四直选。',
                    'help': '从万位、千位、百位、十位、个位中任意选择四个位置，在这四个位上至少各选1个号码组成一注，所选4个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。'
                },
                '140001': {     //任选四直选单式
                    'type': 'input',
                    'param': {'num_location': 'checkbox'},
                    'calculate': {'base_len': 4, 'check_type': 0, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择四个位置，至少手动输入一个四位数号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、十位、个位，输入号码1524<br/>开奖号码：15*24，即中任四直选。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选四个位置，手动输入一个四位数号码组成一注，所选4个位置上的开奖号码与输入号码完全相同，且顺序一致，即为中奖。'
                },
                '140041': {     //任选四组选24
                    'type': 'select',
                    'param': {
                        'titles': {'zx': '组选24'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {'method': 'formula_rx_zu_fs', 'base_len': 4, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择四个位置，号码区至少选择四个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、十位、个位，选择号码1234<br/>开奖号码：12*34 或 13*24，均中任四组选24。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择四个号码组成一注，所选4个位置的开奖号码与所选号码一致，顺序不限，即为中奖。'
                },
                '140042': {     //任选四组选12
                    'type': 'select',
                    'param': {
                        'titles': {'er': '二重号', 'dan': '单号'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_zx',
                        'oneRow': 0,
                        'moreRow': 1,
                        'num_len': 2,
                        'base_len': 4,
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择四个位置，从“二重号”选择一个号码，“单号”中选择两个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、十位、个位，选择二重号：8，单号：0、6<br/>开奖号码：88*06 或 08*68，均中任四组选12。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选四个位置，然后选择1个二重号码和2个单号号码组成一注，所选4个位置的开奖号码中包含与所选号码，且所选二重号码在所选4个位置的开奖号码中出现了2次，即为中奖。'
                },
                '140043': {     //任选四组选6
                    'type': 'select',
                    'param': {
                        'titles': {'er': '二重号'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {'method': 'formula_rx_zl', 'num_len': 2, 'base_len': 4, location: 'zx'},
                    'explain': '从万位、千位、百位、十位、个位中至少选择四个位置，从“二重号”中选择两个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、十位、个位，选择二重号：6、8<br/>开奖号码：66*88 或 68*68，均中任四组选6。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择2个二重号组成一注，所选4个位置的开奖号码与所选号码一致，并且所选的2个二重号码在所选4个位置的开奖号码中分别出现了2次，顺序不限，即为中奖。'
                },
                '140044': {     //任选四组选4s
                    'type': 'select',
                    'param': {
                        'titles': {'san': '三重号', 'dan': '单号'},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2,
                        'num_location': 'checkbox'
                    },
                    'calculate': {
                        'method': 'formula_rx_zx',
                        'oneRow': 0,
                        'moreRow': 1,
                        'num_len': 1,
                        'base_len': 4,
                        location: 'zx'
                    },
                    'explain': '从万位、千位、百位、十位、个位中至少选择四个位置，从“三重号”选择一个号码，“单号”中选择一个号码组成一注。',
                    'example': '投注方案：勾选位置万位、千位、十位、个位，选择三重号：8，单号：0<br/>开奖号码：88*80 或 80*88，均中任四组选4。',
                    'help': '从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择1个三重号和1个单号组成一注，所选4个位置的开奖号码与所选号码一致，并且所选三重号码在所选4个位置的开奖号码中出现了3次，顺序不限，即为中奖。'
                }
            },
            'wf_qh': {
                title: '常规玩法'
            }
        }
    },
    //彩种类型2     福彩3D
    LOTTERY_2: {
        num_min: 0,
        num_max: 9,
        num_len: 1,
        run_num_length: 3,
        wf_class: {
            wf_sx: {
                title: '三星',
                row: {
                    '三星直选': ['24', '25', '37'],
                    '三星组选': ['26', '27', '28', '29', '230007', '230008'],
                    '三星趣味': ['230031', '230032', '230033', '230034']
                },
                '24': {//三星直选复式
                    'type': 'select',
                    'param': {
                        'titles': {bai: "百位", shi: "十位", ge: "个位"},
                        'begin': 0,
                        'end': 9,
                        row_num_count: 10,
                        'selector': 2
                    },
                    'calculate': {method: 'formula_num_multiply'},
                    'explain': '从百位、十位、个位各选一个号码组成一注。',
                    'example': '投注方案：345<br>开奖号码：345，即中后三直选。',
                    'help': '从百味、十位、个位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。'
                },
                '25': {//三星直选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 0},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '投注方案：345<br>开奖号码：345，即中后三直选。',
                    'help': '手动输入一个3位数号码组成一注，所选号码与开奖号码的百味、十位、个位相同，且顺序一致，即为中奖。'
                },
                '37': {//三星直选和值
                    'type': 'select',
                    'param': {'titles': {hz: "直选和值"}, 'begin': 0, 'end': 27, row_num_count: 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zhi_san', num_separator: '$'},
                    'explain': '从0-27中任意选择1个或1个以上号码。',
                    'example': '投注方案：和值1<br>开奖号码：后三位001,010,100，即中后三直选。',
                    'help': '所选数值等于开奖号码的百位、十位、个位三个数字相加之和，即为中奖。'
                },
                '26': {//三星组三复式
                    'type': 'select',
                    'param': {'titles': {zs_fs: "组三"}, 'begin': 0, 'end': 9, row_num_count: 10, 'selector': 2},
                    'calculate': {method: 'formula_num_fold', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：588<br>开奖号码：后三位588（顺序不限），即中后三组选三。',
                    'help': '从0-9中选择2个数字组成两注，所选号码与开奖号码的百味、十位、个位相同，且顺序不限，即为中奖。'
                },
                '27': {//三星组三单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 2},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字必须有两个数字相同）。',
                    'example': '投注方案：001<br>开奖号码：后三位010（顺序不限），即中后三组选三。',
                    'help': '手动输入一个3位数号码组成一注，三个数字中必须有两个数字相同，输入号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。'
                },
                '28': {//三星组六复式
                    'type': 'select',
                    'param': {'titles': {zu: "组六"}, 'begin': 0, 'end': 9, row_num_count: 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', base_len: 3},
                    'explain': '从0-9中任意选择3个或3个以上号码。',
                    'example': '投注方案：258<br>开奖号码：后三位852（顺序不限），即中后三组选六。',
                    'help': '从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百味、十位、个位相同，顺序不限，即为中奖。'
                },
                '29': {//三星组六单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 1},
                    'explain': '手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。',
                    'example': '投注方案：123<br>开奖号码：后三位321（顺序不限），即中后三组选六。',
                    'help': '手动输入一个3位数号码组成一注，输入号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。'
                },
                '230007': {//三星组选混合
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 3},
                    'explain': '手动输入号码，至少输入1个三位数号码。',
                    'example': '投注方案：001和123<br>开奖号码：后三位001（顺序不限）即中后三组选三，或者后三位312（顺序不限）即中后三组选六。',
                    'help': '手动输入一个3位数号码组成一注（不含豹子号），开奖号码的百位、十位、个位符合后三组三或者组六均为中奖。'
                },
                '230008': {//三星组选和值
                    'type': 'select',
                    'param': {'titles': {zx: "和值"}, 'begin': 1, 'end': 26, row_num_count: 10, 'selector': 0},
                    'calculate': {'method': 'formula_value_add', 'value': 'zu_san', num_separator: '$'},
                    'explain': '从1-26中任意选择1个或1个以上号码。',
                    'example': '投注方案：和值3<br>开奖号码：后三位003（顺序不限）即中后三组选三，或者后三位012（顺序不限）即中后三组选六。',
                    'help': '所选数值等于开奖号码的百位、十位、个位三个数字相加之和（非豹子号），即为中奖。'
                },
                '230031': {//三星趣味012
                    'type': 'select',
                    'param': {'titles': {zero: "0", one: "1", two: "2"}, 'cs': 'fc_spice_012', 'selector': 1},
                    'calculate': {
                        'method': 'formula_value_add',
                        'value': 'fc_spice_012',
                        num_separator: '$',
                        group: 'all_num'
                    },
                    'explain': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'example': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'help': '所选号码与开奖号码相同（且顺序一致）即中奖。'
                },
                '230032': {//三星趣味大小
                    'type': 'select',
                    'param': {'titles': {small: "小", big: "大"}, 'cs': 'fc_spice_dx', 'selector': 1},
                    'calculate': {
                        'method': 'formula_count_fold',
                        'bet': 125,
                        num_separator: '$',
                        group: 'all_num'
                    },
                    'explain': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'example': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'help': '所选号码与开奖号码相同（且顺序一致）即中奖。'
                },
                '230033': {//三星趣味质合
                    'type': 'select',
                    'param': {'titles': {zhi: "质", he: "合"}, 'cs': 'fc_spice_zh', 'selector': 1},
                    'calculate': {
                        'method': 'formula_count_fold',
                        'bet': 125,
                        num_separator: '$',
                        group: 'all_num'
                    },
                    'explain': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'example': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'help': '所选号码与开奖号码相同（且顺序一致）即中奖。'
                },
                '230034': {//三星趣味奇偶
                    'type': 'select',
                    'param': {'titles': {ji: "奇", ou: "偶"}, 'cs': 'fc_spice_jo', 'selector': 1},
                    'calculate': {
                        'method': 'formula_count_fold',
                        'bet': 125,
                        num_separator: '$',
                        group: 'all_num'
                    },
                    'explain': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'example': '所选号码与开奖号码相同（且顺序一致）即中奖。',
                    'help': '所选号码与开奖号码相同（且顺序一致）即中奖。'
                }
            },
            wf_ex: {
                title: '二星',
                row: {
                    '二星直选': ['31', '32', '35', '36'],
                    '二星组选': ['220203', '220204', '221303', '221304']
                },
                '31': {//前二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {bai: "百位", shi: "十位"},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从百位、十位中至少各选1个号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：前二位58，即中前二直选。',
                    'help': '从百味、十位中选择一个2位数号码组成一注，所选号码与开奖号码的前2位相同，且顺序一致，即为中奖。'
                },
                '32': {//前二直选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {'base_len': 2, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：前二位58，即中前二直选。',
                    'help': '手动输入一个2位数号码组成一注，输入号码的百味、十位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '35': {//后二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {shi: "十位", ge: "个位"},
                        'begin': 0,
                        'end': 9,
                        'row_num_count': 10,
                        'selector': 2
                    },
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从十位、个位中至少各选1个号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：后二位58，即中后二直选。',
                    'help': '从十位、个位中选择一个2位数号码组成一注，所选号码与开奖号码的后2位相同，且顺序一致，即为中奖。'
                },
                '36': {//后二直选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {'base_len': 2, 'check_type': 0},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：后二位58，即中后二直选。',
                    'help': '手动输入一个2位数号码组成一注，输入号码的十位、个位与开奖号码相同，且顺序一致，即为中奖。'
                },
                '220203': {//前二组选复式
                    'type': 'select',
                    'param': {'titles': {zx: "组选"}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：58<br>开奖号码：前二位85或者58（顺序不限，不含对子号），即中前二组选。',
                    'help': '从0-9中选择2个数字组成一注，所选号码与开奖号码的百味、十位相同，顺序不限，即为中奖。'
                },
                '220204': {//前二组选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {'base_len': 2, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：前二位85或者58（顺序不限，不含对子号），即中前二组选。',
                    'help': '手动输入一个两位数号码组成一注，输入号码的百位、十位与开奖号码相同，顺序不限，即为中奖。'
                },
                '221303': {//后二组选复式
                    'type': 'select',
                    'param': {'titles': {zx: "组选"}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_zx_fs', 'base_len': 2},
                    'explain': '从0-9中任意选择2个或2个以上号码。',
                    'example': '投注方案：58<br>开奖号码：后二位85或者58（顺序不限，不含对子号），即中后二组选。',
                    'help': '从0-9中选择2个数字组成一注，所选号码与开奖号码的十味、个位相同（不含对子号），顺序不限，即为中奖。'
                },
                '221304': {//后二组选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {'base_len': 2, 'check_type': 1},
                    'explain': '手动输入号码，至少输入1个二位数号码组成一注。',
                    'example': '投注方案：58<br>开奖号码：后二位85或者58（顺序不限，不含对子号），即中后二组选。',
                    'help': '手动输入一个两位数号码组成一注，输入号码的十位、个位与开奖号码相同（不含对子号），顺序不限，即为中奖。'
                }
            },
            wf_bdw: {
                title: '不定位',
                row: {
                    '不定位': ['33']
                },
                '33': {//不定位复式
                    'type': 'select',
                    'param': {'titles': {bdw: "不定位"}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '从01-11中共11个号码中选择1个号码，每注由1个号码组成',
                    'example': '只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。',
                    'help': '从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。'
                }
            },
            wf_dx_ds: {
                title: '大小单双',
                row: {
                    '大小单双': ['220205', '221305']
                },
                '220205': {//前二大小单双
                    'type': 'select',
                    'param': {'titles': {bai: "百位", shi: "十位"}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从百位、十位中的“大、小、单、双”中至少各选一个组成。',
                    'example': '投注方案：小双<br>开奖号码：百位与十位“小双”，即中前二大小单双。',
                    'help': '对百位、十位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                },
                '221305': {//后二大小单双
                    'type': 'select',
                    'param': {'titles': {shi: "十位", ge: "个位"}, 'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    'explain': '从十位、个位中的“大、小、单、双”中至少各选一个组成。',
                    'example': '投注方案：大单<br>开奖号码：十位与个位“大单”，即中后二大小单双。',
                    'help': '对十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。'
                }
            },
            wf_qy: {
                title: '前一直选',
                row: {
                    '前一直选': ['30']
                },
                '30': {//前一直选复式
                    'type': 'select',
                    'param': {'titles': {bai: "百位"}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '前一直选',
                    'example': '前一直选',
                    'help': '前一直选'
                }
            },
            wf_hy: {
                title: '后一直选',
                row: {
                    '后一直选': ['34']
                },
                '34': {//后一直选
                    'type': 'select',
                    'param': {'titles': {ge: "个位"}, 'begin': 0, 'end': 9, 'row_num_count': 10, 'selector': 2},
                    'calculate': {'method': 'formula_num_count'},
                    'explain': '后一直选',
                    'example': '后一直选',
                    'help': '后一直选'
                }
            }
        }
    },
    //彩种类型3     十一选五
    LOTTERY_3: {
        num_min: 1,
        num_max: 11,
        num_len: 2,
        run_num_length: 5,
        wf_class: {
            wf_sm: {
                title: '三码',
                row: {
                    '三码': ['44', '45', '46', '330301', '47']
                },
                '44': {     //前三直选复式
                    'type': 'select',
                    'param': {
                        'titles': {yi: "第一位", er: '第二位', san: '第三位'},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        'selector': 2
                    },
                    'calculate': {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    'explain': '从第一位、第二位、第三位中至少各选择1个号码。',
                    'example': '如：选择01，02，03，开奖号码顺序为01，02，03 * *，即为中奖。',
                    'help': '从01-11共11个号码中选择3个不重复的号码组成一注，所选号码与当期顺序摇出的5个号码中的前3个号码相同，且顺序一致，即为中奖。'
                },
                '45': {     //前三直选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 1, num_separator: ' '},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '如：手动输入01 02 03，开奖号码为是01 02 03 * *，即为中奖。',
                    'help': '手动输入3个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前3个号码相同，且顺序一致，即为中奖。'
                },
                '46': {     //前三组选复式
                    'type': 'select',
                    'param': {'titles': {zu: "组选"}, begin: 1, end: 11, row_num_count: 11, 'selector': 2},
                    'calculate': {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
                    'explain': '从01-11中任意选择3个或3个以上号码。',
                    'example': '如：选择01 02 03（展开为01 02 03 * *，01 03 02 * *，02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为03 01 02  如：，即为中奖。',
                    'help': '从01-11中共11个号码中选择3个号码，所选号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。'
                },
                '330301': {     //前三组选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 3, check_type: 1, num_separator: ' '},
                    'explain': '手动输入号码，至少输入1个三位数号码组成一注。',
                    'example': '如：手动输入01 02 03（展开为01 02 03 * *，01 03 02 * * , 02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为01 03 02 * *，即为中奖。',
                    'help': '手动输入3个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。'
                },
                '47': {     //前三组选胆拖
                    'type': 'select',
                    'param': {
                        'titles': {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    'calculate': {
                        method: 'formula_dt',
                        base_len: 2,
                        num_separator: ',',
                        row_separator: '-',
                        limit_row: 0,
                        limit_rule: 'no_repeat'
                    },
                    'explain': '从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。',
                    'example': '如：选择胆码 01，选择拖码 02 06，开奖号码为 02 01 06 * *，即为中奖。',
                    'help': '分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注。当期顺序摇出的5个号码中的前3个号码中同时包含所选的1个胆码和2个拖码，顺序不限，即为中奖。'
                }
            },
            wf_em: {
                title: '二码',
                row: {
                    '二码': ['39', '320202', '40', '320201', '41']
                },
                '39': {     //前二直选复式
                    'type': 'select',
                    'param': {
                        'titles': {yi: "第一位", er: '第二位'},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2
                    },
                    'calculate': {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    'explain': '从第一位、第二位中至少各选择1个号码。',
                    'example': ' 如：选择01 02，开奖号码 01 02 * * *，即为中奖。',
                    'help': '从01-11共11个号码中选择2个不重复的号码组成一注，所选号码与当期顺序摇出的5个号码中的前2个号码相同，且顺序一致，即中奖。'
                },
                '320202': {     //前二直选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 2, check_type: 1, num_separator: ' '},
                    'explain': '手动输入号码，至少输入1个两位数号码组成一注。',
                    'example': '如：手动输入01 02，开奖号码为是01 02 * * *，即为中奖。',
                    'help': '手动输入2个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前2个号码相同，且顺序一致，即为中奖。'
                },
                '40': {     //前二组选复式
                    'type': 'select',
                    'param': {'titles': {zu: "组选"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    'calculate': {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
                    'explain': '从01-11中任意选择3个或3个以上号码。',
                    'example': '如：选择01 02 03（展开为01 02 03 * *，01 03 02 * *，02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为03 01 02  如：，即为中奖。',
                    'help': '从01-11中共11个号码中选择3个号码，所选号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。'
                },
                '320201': {     //前二组选单式
                    'type': 'input',
                    'param': {},
                    'calculate': {base_len: 2, check_type: 1, num_separator: ' '},
                    'explain': '手动输入号码，至少输入1个两位数号码组成一注。',
                    'example': '如：手动输入01 02（展开为01 02 * * *, 02 01 * * *），开奖号码为01 02 * * *或02 01 * * *，即为中奖。',
                    'help': '手动输入2个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前2个号码相同，顺序不限，即为中奖。'
                },
                '41': {     //前二组选胆拖
                    type: 'select',
                    param: {
                        'titles': {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        base_len: 1,
                        num_separator: ',',
                        row_separator: '-',
                        limit_row: 0,
                        limit_rule: 'no_repeat'
                    },
                    explain: '从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。',
                    example: '如：选择胆码 01，选择拖码 02 06，开奖号码为 02 01 06 * *，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注。当期顺序摇出的5个号码中的前3个号码中同时包含所选的1个胆码和2个拖码，顺序不限，即为中奖。'
                }
            },
            wf_ym: {
                title: '一码',
                row: {
                    '一码': ['38']
                },
                '38': {
                    type: 'select',
                    param: {'titles': {yi: "第一位"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择1个或1个以上号码。',
                    example: '如：选择01，开奖号码为01 * * * *,即为中奖。',
                    help: '从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位开奖号码包含所选号码，即为中奖。'
                }
            },
            wf_bdw: {
                title: '不定位',
                row: {
                    '不定位': ['330303']
                },
                '330303': {
                    type: 'select',
                    param: {'titles': {san: "前三位"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择1个或1个以上号码。',
                    example: '如：选择01，开奖号码为01 * * * *，* 01 * * *，* * 01 * *,即为中奖。',
                    help: '从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。'
                }
            },
            wf_dwd: {
                title: '定位胆',
                row: {
                    '定位胆': ['330304']
                },
                '330304': {     //定位胆
                    type: 'select',
                    param: {
                        'titles': {yi: "第一位", er: '第二位', san: '第三位'},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2
                    },
                    calculate: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
                    explain: '从第一位，第二位，第三位任意位置上任意选择1个或1个以上号码。',
                    example: '如：万位上选择01，开奖号码为01 * * * *，即为中奖。<br/>如：千位上选择01，开奖号码为 * 01* * *，即为中奖。<br/>如：百位上选择01，开奖号码为 * * 01 * *，即为中奖。',
                    help: '从第一位，第二位，第三位任意1个位置或多个位置上选择1个号码，所选号码与相同位置上的开奖号码一致，即为中奖。'
                }
            },
            wf_qwx: {
                title: '趣味型',
                row: {
                    '趣味型': ['350008', '350009']
                },
                '350008': {     //定单双
                    type: 'select',
                    param: {'titles': {ding: "定单双"}, cs: 'eleven_five_dds', selector: 0},
                    calculate: {'method': 'formula_num_count', num_separator: ','},
                    explain: '从不同的单双组合中任意选择1个或1个以上的组合。',
                    example: '如：选择5单0双，开奖号码01，03，05，07，09五个单数，即为中奖。',
                    help: '从5种单双个数组合中选择1种组合，当期开奖号码的单双个数与所选单双组合一致，即为中奖。'
                },
                '350009': {     //猜中数
                    type: 'select',
                    param: {
                        'titles': {yi: "猜中位"},
                        begin: 3,
                        end: 9,
                        row_num_count: 7,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: '$'},
                    explain: '从3-9中任意选择1个或1个以上数字。',
                    example: '如：选择8，开奖号码为11，04，09，05，08，按开奖号码的数字大小排列为04，05，08，09，11，中间数08，即为中奖。',
                    help: '从3-9中选择1个号码进行购买，所选号码与5个开奖号码按照大小顺序排列后的第3个号码相同，即为中奖。'
                }
            },
            wf_rx_fs: {
                title: '任选复式',
                row: {
                    '任选复式': ['310005', '42', '48', '50', '52', '55', '57', '59']
                },
                '310005': {     //任选一中一复式
                    type: 'select',
                    param: {'titles': {yi: "选一中一"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 1, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择1个或1个以上号码。',
                    example: '如：选择05，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择1个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '42': {     //任选二中二复式
                    type: 'select',
                    param: {'titles': {er: "选二中二"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择2个或2个以上号码。',
                    example: '如：选择05 04，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择2个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '48': {     //任选三中三复式
                    type: 'select',
                    param: {'titles': {san: "选三中三"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择3个或3个以上号码。',
                    example: '如：选择05 04 11，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择3个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '50': {     //任选四中四复式
                    type: 'select',
                    param: {'titles': {si: "选四中四"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 4, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择4个或4个以上号码。',
                    example: '如：选择05 04 08 03，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择4个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '52': {     //任选五中五复式
                    type: 'select',
                    param: {'titles': {wu: "选五中五"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 5, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择5个或5个以上号码。',
                    example: '如：选择05 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择5个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '55': {     //任选六中五复式
                    type: 'select',
                    param: {'titles': {liu: "选六中五"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 6, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择6个或6个以上号码。',
                    example: '如：选择05 10 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择6个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '57': {     //任选七中五复式
                    type: 'select',
                    param: {'titles': {qi: "选七中五"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 7, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择7个或7个以上号码。',
                    example: '如：选择05 04 10 11 03 08 09，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择7个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                },
                '59': {     //任选八中五复式
                    type: 'select',
                    param: {'titles': {ba: "选八中五"}, begin: 1, end: 11, row_num_count: 11, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 8, num_separator: ',', row_separator: '-'},
                    explain: '从01-11中任意选择8个或8个以上号码。',
                    example: '如：选择05 04 11 03 08 10 09 01，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11共11个号码中选择8个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。'
                }
            },
            wf_rx_ds: {
                title: '任选单式',
                row: {
                    '任选单式': ['310006', '320006', '330006', '340006', '350006', '360006', '370006', '380006']
                },
                '310006': {     //任选一中一单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入1个号码组成一注。',
                    example: '如：输入05，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入1个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '320006': {     //任选二中二单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 2, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入2个号码组成一注。',
                    example: '如：输入05 04，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入2个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '330006': {     //任选三中三单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 3, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入3个号码组成一注。',
                    example: '如：输入05 04 11，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入3个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '340006': {     //任选四中四单式
                    type: 'input',
                    param: {},
                    calculate: {'base_len': 4, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入4个号码组成一注。',
                    example: '如：输入05 04 08 03，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入4个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '350006': {     //任选五中五单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 5, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入5个号码组成一注。',
                    example: '如：输入05 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入5个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '360006': {     //任选六中五单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 6, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入6个号码组成一注。',
                    example: '如：输入05 10 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入6个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '370006': {     //任选七中五单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 7, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入7个号码组成一注。',
                    example: '如：输入05 04 10 11 03 08 09，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入7个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                },
                '380006': {     //任选八中五单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 8, check_type: 1, num_separator: ' '},
                    explain: '手动输入号码，从01-11中任意输入8个号码组成一注。',
                    example: '如：输入05 04 11 03 08 10 09 01，开奖号码为08 04 11 05 03，即为中奖。',
                    help: '从01-11输入8个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。'
                }
            },
            wf_rx_dt: {
                title: '任选胆拖',
                row: {
                    '任选胆拖': ['43', '49', '51', '53', '56', '58', '60']
                },
                '43': {     //任选二胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 1,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取2个及以上的号码进行投注，每注需至少包括1个胆码及1个拖码。',
                    example: '如：选择胆码 08，选择拖码 06，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和1个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和1个拖码，所选胆码必须全中，即为中奖。'
                },
                '49': {     //任选三胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 2,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。',
                    example: '如：选择胆码 08，选择拖码 06 11，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和2个拖码，所选胆码必须全中，即为中奖。'
                },
                '51': {     //任选四胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 3,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取4个及以上的号码进行投注，每注需至少包括1个胆码及3个拖码。',
                    example: '如：选择胆码 08，选择拖码 06 09 11，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和3个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和3个拖码，所选胆码必须全中，即为中奖。'
                },
                '53': {     //任选五胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 4,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取5个及以上的号码进行投注，每注需至少包括1个胆码及4个拖码。',
                    example: '如：选择胆码 08，选择拖码 02 06 09 11，开奖号码为  06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和4个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和4个拖码，所选胆码必须全中，即为中奖。'
                },
                '56': {     //任选六胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 5,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取6个及以上的号码进行投注，每注需至少包括1个胆码及5个拖码。',
                    example: '如：选择胆码 08，选择拖码 01 02 05 06 09 11，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和5个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。'
                },
                '58': {     //任选七胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 6,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取7个及以上的号码进行投注，每注需至少包括1个胆码及6个拖码。',
                    example: '如：选择胆码 08，选择拖码 01 02 05 06 07 09 11，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和6个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。'
                },
                '60': {     //任选八胆拖
                    type: 'select',
                    param: {
                        titles: {dan: "胆码", tuo: "拖码"},
                        begin: 1,
                        end: 11,
                        row_num_count: 11,
                        selector: 2,
                        selector_index: {1: 1}
                    },
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 7,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从01-11中，选取8个及以上的号码进行投注，每注需至少包括1个胆码及7个拖码。',
                    example: '如：选择胆码 08，选择拖码 01 02 03 05 06 07 09 11，开奖号码为 06 08 11 09 02，即为中奖。',
                    help: '分别从胆码和拖码的01-11中，至少选择1个胆码和7个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。'
                }
            }
        }
    },
    //彩种类型4     快乐十分
    LOTTERY_4: {
        num_min: 1,
        num_max: 20,
        num_len: 2,
        run_num_css: "gr_s1",
        run_num_length: 8,
        wf_class: {
            kl_sf: {
                title: '快乐十分',
                row: {
                    '快乐十分': ['61', '62', '63', '64', '66', '67', '65', '68', '69', '70']
                },
                '61': {//首位数投
                    type: 'select',
                    param: {titles: {yi: "首位"}, begin: 1, end: 18, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
                    explain: '从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。',
                    example: '从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。',
                    help: '从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。'
                },
                '62': {//首位红投
                    type: 'select',
                    param: {'titles': {yi: "首位"}, begin: 19, end: 20, row_num_count: 10, selector: 0},
                    calculate: {method: 'formula_num_count', num_separator: ',', row_separator: '-'},
                    explain: '19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。',
                    example: '19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。',
                    help: '19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。'
                },
                '63': {//二连直
                    type: 'select',
                    param: {'titles': {qw: "前位", hou: '后位'}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。',
                    example: '从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。',
                    help: '从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。'
                },
                '64': {//二连组
                    type: 'select',
                    param: {'titles': {er: "二连组"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。',
                    example: '从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。',
                    help: '从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。'
                },
                '65': {//快乐二
                    type: 'select',
                    param: {'titles': {er: "快乐二"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 2, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。',
                    example: '从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。',
                    help: '从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。'
                },
                '66': {//前三直
                    type: 'select',
                    param: {
                        'titles': {yi: "第一位", er: "第二位", san: "第三位"},
                        begin: 1,
                        end: 20,
                        row_num_count: 10,
                        selector: 2
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。',
                    example: '从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。',
                    help: '从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。'
                },
                '67': {//前三组
                    type: 'select',
                    param: {'titles': {san: "前三组"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。',
                    example: '从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。',
                    help: '从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。'
                },
                '68': {//快乐三
                    type: 'select',
                    param: {'titles': {san: "快乐三"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。',
                    example: '从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。',
                    help: '从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。'
                },
                '69': {//快乐四
                    type: 'select',
                    param: {'titles': {si: "快乐四"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 4, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。',
                    example: '从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。',
                    help: '从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。'
                },
                '70': {//快乐五
                    type: 'select',
                    param: {'titles': {wu: "快乐五"}, begin: 1, end: 20, row_num_count: 10, selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 5, num_separator: ',', row_separator: '-'},
                    explain: '从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。',
                    example: '从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。',
                    help: '从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。'
                }
            }
        }
    },
    //彩种类型6 六合彩
    LOTTERY_6: {
        num_min: 1,
        num_max: 49,
        num_len: 2,
        bet_money: 5,
        run_num_css: "gr_s1",
        run_num_length: 7,
        wf_class: {
            lhc: {
                title: '六合彩',
                row: {
                    '号码': ['81', '82', '92', '86', '88', '89', '90', '91'],
                    '生肖': ['93', '84', '87'],
                    '趣味': ['83', '85']
                },
                '81': {     //特码直选(A)
                    type: 'select',
                    param: {
                        titles: {lhc: "特码"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        show_title: 'get_lhc_odds',
                        value_type: 1,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '特码指的是六合彩开奖序列号的最后一个号。',
                    example: '特码直选(A)。',
                    help: '特码直选(A)。'
                },
                '82': {     //特码直选(B)
                    type: 'select',
                    param: {
                        titles: {lhc: "特码"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        show_title: 'get_lhc_odds',
                        value_type: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    'explain': '特码指的是六合彩开奖序列号的最后一个号。',
                    'example': '特码直选(B)。',
                    'help': '特码直选(B)。'
                },
                '83': {     //特码大小单双
                    type: 'select',
                    param: {'titles': {lhc: "大小单双"}, cs: 'lhc_dx_ds', selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '特小:开出之特码为(01~24).特大:开出之特码为(25~48).和局:特码为49时.特单:特码为[单数].特双:特码为[双数].和局:特码为49时。',
                    example: '特码大小单双。',
                    help: '特码大小单双。'
                },
                '84': {     //四肖
                    type: 'select',
                    param: {'titles': {lhc: "生肖"}, cs: 'lhc_sx', selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 4, num_separator: ','},
                    explain: '四肖。',
                    example: '四肖。',
                    help: '四肖。'
                },
                '85': {     //平特色波
                    type: 'select',
                    param: {titles: {lhc: "色波"}, cs: 'lhc_sb', selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '特码色波:香港六合彩49个号码球分别有红,蓝,绿三种颜色,以特码开出的颜色和投注的颜色相同视为中奖.',
                    example: '平特色波。',
                    help: '颜色代表如下：<br>红波:1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46.<br>蓝波:3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48.<br>绿波:5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49.'
                },
                '86': {     //平特尾数
                    type: 'select',
                    param: {
                        'titles': {lhc: "尾数"},
                        begin: 0,
                        end: 9,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number',
                        num_len: 1
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '平特尾数。',
                    example: '平特尾数。',
                    help: '平特尾数。'
                },
                '87': {     //六肖
                    type: 'select',
                    param: {titles: {lhc: "六肖"}, cs: 'lhc_sx', selector: 2},
                    calculate: {method: 'formula_zx_fs', base_len: 6, num_separator: ','},
                    explain: '挑选6个生肖(排列如同生肖)为一个组合，并选择开奖号码的特码是否在此组合内.',
                    example: '若选择【中】且开奖号码的特码亦在此组合内，则视为中奖，若选择【不中】且开奖号码的特码亦不在此组合内，即视为中奖，若当期特码开出 49 号，则视为和局；其余情形视为不中奖.',
                    help: '若选择【中】且开奖号码的特码亦在此组合内，则视为中奖，若选择【不中】且开奖号码的特码亦不在此组合内，即视为中奖，若当期特码开出 49 号，则视为和局；其余情形视为不中奖.'
                },
                '88': {     //五不中
                    type: 'select',
                    param: {
                        'titles': {lhc: "五不中"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_zx_fs', base_len: 5, num_separator: ','},
                    explain: '挑选5个号码为一投注组合进行下注。当期开出的7个开奖号码都没有在该下注组合中，即视为中奖。',
                    example: '如下注组合为1-2-3-4-5，开奖号码为6，7，8，9，10，11，12，即为中奖，如果开奖号码为5，6，7，8，9，10，11，那么为不中奖。',
                    help: '每个号码都有自己的赔率，下注组合的总赔率，取该组合号码的最低赔率为总赔率。'
                },
                '89': {     //三全中
                    type: 'select',
                    param: {
                        'titles': {lhc: "三全中"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
                    explain: '选择投注号码每三个号码为一组(号码需三个号以上，少于三个号码不成立)',
                    example: '对奖号是以正码对奖〈1～6号不含特码〉，如三个号码都是在开奖号码的正码里，视为中奖，其他情形视为不中奖。',
                    help: '对奖号是以正码对奖〈1～6号不含特码〉，如三个号码都是在开奖号码的正码里，视为中奖，其他情形视为不中奖。'
                },
                '90': {     //二全中
                    type: 'select',
                    param: {
                        'titles': {lhc: "二全中"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_zx_fs', base_len: 2, num_separator: ','},
                    explain: '选择投注号码每二个号码为一组(号码需二个号以上，少于二个号码不成立).',
                    example: '如二个号码都是在开奖号码的正码，视为中奖，其他情形视为不中奖。',
                    help: '例：11， 17 二个号码都是开在正码里，视为中奖，如果二个号码一个中在正码一个中特码，此情形视为不中奖。'
                },
                '91': {     //三中二
                    type: 'select',
                    param: {
                        'titles': {lhc: "三中二"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
                    explain: '中二：选择投注号码每三个号码为一组(号码需三个号以上，少于三个号码不成立)。',
                    example: '如中的二个号码都是在开奖号码的正码里，为三中二视为中奖。中三：选择投注号码每三个号码为一组〈号码需三个号以上，少于三个号码不成立〉，如中的三个号码都是在开奖号码的正码里，为三中二之中三视为中奖。 除中二、中三外其他情形视为不中奖。',
                    help: '例：11，17，18 为一组投注号码，开奖号码中有11，17 两个正码〈没有18号码〉，为三中二中奖，赔率为三中二的赔率，如果11， 17 ，18三个号码都是开奖之正码，视为三中二之中三，赔率为三中二之中三的赔率，如只中一个号或是没中任何号码，此情形视为不中奖。'
                },
                '92': {     //平码直选
                    type: 'select',
                    param: {
                        'titles': {lhc: "平码直选"},
                        begin: 1,
                        end: 49,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '所选号码与开奖号码前6位相同，即为中奖。',
                    example: '所选号码与开奖号码前6位相同，即为中奖。',
                    help: '所选号码与开奖号码前6位相同，即为中奖。'
                },
                '93': {     //平特一肖
                    type: 'select',
                    param: {'titles': {lhc: "平特一肖"}, cs: 'lhc_sx', selector: 2},
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '指开奖7个号码中含有所属生肖的一个或多个号码，但派彩只派一次，即不论同生肖号码出现一个或多个号码都只派彩一次。',
                    example: '指开奖 7 个号码中含有所属生肖的一个或多个号码，但派彩只派一次，即不论同生肖号码出现一个或多个号码都只派彩一次。',
                    help: '指开奖 7 个号码中含有所属生肖的一个或多个号码，但派彩只派一次，即不论同生肖号码出现一个或多个号码都只派彩一次。'
                }
            }
        }
    },
    //彩种类型9 快三
    LOTTERY_9: {
        num_min: 1,
        num_max: 6,
        num_len: 1,
        run_num_length: 3,
        run_num_css: 'gr_d',
        wf_class: {
            wf_ebt: {
                title: '二不同号',
                row: {
                    '二不同号': ['500001', '500002']
                },
                '500001': {//二不同标准
                    type: 'select',
                    param: {'titles': {hao: "号码"}, begin: 1, end: 6, row_num_count: 6, css: 'dice'},
                    calculate: {method: 'formula_zx_fs', base_len: 2, num_separator: ','},
                    explain: '从1-6中任意选择2个或2个以上号码。',
                    example: '投注方案：2,5<br>开奖号码中出现：1个2、1个5(顺序不限)，即为中奖。',
                    help: '从1-6中任意选择2个号码组成一注，顺序不限。开奖号码中出现所选的两个号码即为中奖。'
                },
                '500002': {//二不同单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 2, check_type: 1, to_value: 'insert_comma'},
                    explain: '手动输入号码，至少输入一个由1-6中两个不同的数字组成一注的号码。',
                    example: '投注方案：5,6<br>开奖号码：536，即中奖。',
                    help: '开奖号码中至少包含所输入的两个数字即为中奖。'
                },
                '500003': {//二不同胆拖
                    type: 'select',
                    param: {'titles': {dan: "胆码", tuo: '拖码'}, begin: 1, end: 6, row_num_count: 6, css: 'dice'},
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 1,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从1-6中任意选择1个胆码以及1个以上的号码作为拖码。',
                    example: '二不同胆拖',
                    help: '从1-6中选择一个胆码和至少一个拖码，如果开奖号码中不重复数字至少包含胆码所选号码即为中奖。'
                }
            },
            wf_et: {
                title: '二同号',
                row: {
                    '单选': ['500004', '500005'],
                    '复选': ['500006']
                },
                '500004': {//二同号标准
                    type: 'select',
                    param: {'titles': {et: "二同号", bt: "不同号"}, 'cs': 'ks_et_bz', css: 'dice'},
                    calculate: {
                        method: 'formula_num_multiply',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '选择1个对子（11,22,33,44,55,66）和1个不同号码(1,2,3,4,5,6)投注。',
                    example: '投注方案：112<br>开奖号码为112,121,211中任意一个，即为中奖。',
                    help: '选择一个对子(11,22,33,44,55,66)和一个不同号码(1,2,3,4,5,6)投注，选号与开奖号码一致即为中奖。'
                },
                '500005': {//二同号单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 3, check_type: 2, to_value: 'insert_comma', row_separator: '-'},
                    explain: '手动输入号码，至少输入一个由1-6中2个数字组成一注的号码。',
                    example: '投注方案：112<br>开奖号码为112,121,211中任意一个，即中奖。',
                    help: '手动输入号码，至少输入一个三位数号码，选号与开奖号码一致即中奖。'
                },
                '500006': {//二同号复选
                    type: 'select',
                    param: {'titles': {tong: "复选"}, 'cs': 'ks_et_fs', css: 'dice'},
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '选择对子(11*,22*,33*,44*,55*,66*)进行投注。',
                    example: '投注方案：11*<br>开奖号码：112,211,121，即中奖。',
                    help: '选择对子(11*,22*,33*,44*,55*,66*)投注，开奖号码中包含选择的对子即中奖。'
                }
            },
            wf_sbt: {
                title: '三不同号',
                row: {
                    '三不同号': ['500007', '500008', '500010']
                },
                '500007': {//三不同标准
                    type: 'select',
                    param: {'titles': {hao: "号码"}, begin: 1, end: 6, row_num_count: 6, css: 'dice'},
                    calculate: {method: 'formula_zx_fs', base_len: 3, num_separator: ','},
                    explain: '选择任意三个或以上的号码进行投注。',
                    example: '投注方案：2,5,6<br>开奖号码中出现：256,562,625(顺序不限)即中奖。',
                    help: '从1-6中任意选择3个(或以上)不相同号码组成一注，顺序不限，若其中三位与开奖号码相同即为中奖。'
                },
                '500008': {//三不同单式
                    type: 'input',
                    param: {},
                    calculate: {base_len: 3, check_type: 1, to_value: 'insert_comma'},
                    explain: '对三个各不相同的号码进行投注。',
                    example: '投注方案：256<br>开奖号码中出现：1个2、1个5、1个6(顺序不限)，即中奖。',
                    help: '从1-6中任意选择3个或3个以上各不相同号码组成一注，顺序不限，若开奖号码与所选号码相同，即为中奖。'
                },
                '500009': {//三不同胆拖
                    type: 'select',
                    param: {'titles': {dan: "胆码", tuo: '拖码'}, begin: 1, end: 6, row_num_count: 6, css: 'dice'},
                    calculate: {
                        method: 'formula_dt',
                        limit_row: 0,
                        limit_rule: 'no_repeat',
                        base_len: 2,
                        num_separator: ',',
                        row_separator: '-'
                    },
                    explain: '从1-6中任意选择1~2个胆码以及1个以上的号码作为拖码。',
                    example: '三不同胆拖',
                    help: '从1-6中选择1~2个胆码和至少一个拖码，如果开奖号码中至少包含胆码所选号码，即为中奖。'
                },
                '500010': {//三不同和值
                    type: 'select',
                    param: {
                        'titles': {he: "和值"},
                        begin: 6,
                        end: 15,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_value_add', value: 'ks_sbt', num_separator: '$'},
                    explain: '从6-15中任意选择1个或1个以上号码。',
                    example: '投注方案：和值9<br>开奖号码：234,423,342即为中奖',
                    help: '所选数值等于开奖号码相加之和，即为中奖。'
                }
            },
            wf_sth: {
                title: '三同号',
                row: {
                    '三同号': ['500011', '500012', '500013']
                },
                '500011': {//三同号单选
                    type: 'select',
                    param: {'titles': {dan: "单选"}, 'cs': 'ks_sth', css: 'dice'},
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '选择任意一组以上三位相同的号码。',
                    example: '投注方案：222<br>开奖号码为222，即为中奖。',
                    help: '从111,222,333,444,555,666中选择任意一组或一组以上号码进行投注，选号与开奖号码一致即为中奖。'
                },
                '500012': {//三同号通选
                    type: 'select',
                    param: {'titles': {tong: "通选"}, 'cs': 'ks_sth', css: 'dice'},
                    calculate: {method: 'fixed_one', limit_rule: 'for_all', value: '', num_separator: ','},
                    explain: '对所有三同号（111,222,333,444,555,666）进行投注。',
                    example: '投注方案：通选<br>开奖号码中出现：222或3个其他数字，即中奖。',
                    help: '投注后，开奖号码为任意数字的三重号，即为中奖。'
                },
                '500013': {//三连号通选
                    type: 'select',
                    param: {'titles': {tong: "通选"}, 'cs': 'ks_slh', css: 'dice'},
                    calculate: {method: 'fixed_one', limit_rule: 'for_all', value: '', num_separator: ','},
                    explain: '对所有三个相连的号码进行投注。',
                    example: '投注方案：三连号通选<br>开奖号码：123或324或345或456即中奖。',
                    help: '开奖号码为三连号(123,234,345,456)即为中奖。'
                }
            },
            wf_hz: {
                title: '和值',
                row: {
                    '和值': ['500014']
                },
                '500014': {//和值
                    type: 'select',
                    param: {
                        'titles': {value: "和值"},
                        begin: 3,
                        end: 18,
                        row_num_count: 8,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: '$'},
                    explain: '从3-18中任意选择1个或1个以上号码。',
                    example: '投注方案：和值4<br>开奖号码：112，即为中奖。',
                    help: '所选数值等于开奖号码三个数字相加之和，即为中奖。'
                }
            }
        }
    },
    //彩种类型10    PK10
    LOTTERY_10: {
        num_min: 1,
        num_max: 10,
        num_len: 2,
        wf_class: {
            wf_one: {
                title: '猜第一',
                row: {
                    '猜第一': ['400001', '400021']
                },
                '400001': {     //猜冠军
                    type: 'select',
                    param: {
                        titles: {pk: "冠军"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜冠军',
                    example: '猜冠军',
                    help: '猜冠军'
                },
                '400021': {     //猜冠军
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '猜冠军,输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                }
            },
            wf_two: {
                title: '猜前二',
                row: {
                    '猜前二名': ['400002', '400022', '400012', '400032']
                },
                '400002': {     //猜亚军
                    type: 'select',
                    param: {
                        titles: {pk: "亚军"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜亚军',
                    example: '猜亚军',
                    help: '猜亚军'
                },
                '400022': {     //猜亚军
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400012': {        //猜前二名
                    type: 'select',
                    param: {
                        'titles': {yi: "冠军", er: "亚军"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前二名',
                    example: '猜前二名',
                    help: '猜前二名'
                },
                '400032': {     //猜前二名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 2, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_three: {
                title: '猜前三',
                row: {
                    '猜前三名': ['400003', '400023', '400013', '400033']
                },
                '400003': {     //猜季军
                    type: 'select',
                    param: {
                        titles: {pk: "季军"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜季军',
                    example: '猜季军',
                    help: '猜季军'
                },
                '400023': {     //猜季军
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400013': {        //猜前三名
                    type: 'select',
                    param: {
                        'titles': {yi: "冠军", er: "亚军", san: "季军"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前三名',
                    example: '猜前三名',
                    help: '猜前三名'
                },
                '400033': {     //猜前三名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 3, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_four: {
                title: '猜前四',
                row: {
                    '猜前四名': ['400004', '400024', '400014', '400034']
                },
                '400004': {     //猜第四名
                    type: 'select',
                    param: {
                        titles: {pk: "第四名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第四名',
                    example: '猜第四名',
                    help: '猜第四名'
                },
                '400024': {     //猜第四名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400014': {        //猜前四名
                    type: 'select',
                    param: {
                        'titles': {yi: "冠军", er: "亚军", san: "季军", si: "第四名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前四名',
                    example: '猜前四名',
                    help: '猜前四名'
                },
                '400034': {     //猜前四名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 4, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_five: {
                title: '猜前五',
                row: {
                    '猜前五名': ['400005', '400025', '400015', '400035']
                },
                '400005': {     //猜第五名
                    type: 'select',
                    param: {
                        titles: {pk: "第五名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第五名',
                    example: '猜第五名',
                    help: '猜第五名'
                },
                '400025': {     //猜第五名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400015': {        //猜前五名
                    type: 'select',
                    param: {
                        'titles': {yi: "冠军", er: "亚军", san: "季军", si: "第四", wu: "第五名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前五名',
                    example: '猜前五名',
                    help: '猜前五名'
                },
                '400035': {     //猜前五名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 5, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_six: {
                title: '猜前六',
                row: {
                    '猜前六名': ['400006', '400026', '400016', '400036']
                },
                '400006': {     //猜第六名
                    type: 'select',
                    param: {
                        titles: {pk: "第六名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第六名',
                    example: '猜第六名',
                    help: '猜第六名'
                },
                '400026': {     //猜第六名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400016': {        //猜前六名
                    type: 'select',
                    param: {
                        'titles': {yi: "冠军", er: "亚军", san: "季军", si: "第四", wu: "第五名", liu: "第六名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前六名',
                    example: '猜前六名',
                    help: '猜前六名'
                },
                '400036': {     //猜前六名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 6, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_seven: {
                title: '猜前七',
                row: {
                    '猜前七名': ['400007', '400027', '400017', '400037']
                },
                '400007': {     //猜第七名
                    type: 'select',
                    param: {
                        titles: {pk: "第七名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第七名',
                    example: '猜第七名',
                    help: '猜第七名'
                },
                '400027': {     //猜第七名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400017': {        //猜前七名
                    type: 'select',
                    param: {
                        'titles': {
                            yi: "冠军",
                            er: "亚军",
                            san: "季军",
                            si: "第四",
                            wu: "第五名",
                            liu: "第六名",
                            qi: "第七名"
                        }, begin: 1, end: 10, row_num_count: 10, selector: 2, value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前七名',
                    example: '猜前七名',
                    help: '猜前七名'
                },
                '400037': {     //猜前七名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 7, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_eight: {
                title: '猜前八',
                row: {
                    '猜前八名': ['400008', '400028', '400018', '400038']
                },
                '400008': {     //猜第八名
                    type: 'select',
                    param: {
                        titles: {pk: "第八名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第八名',
                    example: '猜第八名',
                    help: '猜第八名'
                },
                '400028': {     //猜第八名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400018': {        //猜前八名
                    type: 'select',
                    param: {
                        'titles': {
                            yi: "冠军",
                            er: "亚军",
                            san: "季军",
                            si: "第四",
                            wu: "第五名",
                            liu: "第六名",
                            qi: "第七名",
                            ba: "第八名"
                        }, begin: 1, end: 10, row_num_count: 10, selector: 2, value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前八名',
                    example: '猜前八名',
                    help: '猜前八名'
                },
                '400038': {     //猜前八名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 8, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_nine: {
                title: '猜前九',
                row: {
                    '猜前九名': ['400009', '400029', '400019', '400039']
                },
                '400009': {     //猜第九名
                    type: 'select',
                    param: {
                        titles: {pk: "第九名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第九名',
                    example: '猜第九名',
                    help: '猜第九名'
                },
                '400029': {     //猜第九名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400019': {        //猜前九名
                    type: 'select',
                    param: {
                        'titles': {
                            yi: "冠军",
                            er: "亚军",
                            san: "季军",
                            si: "第四",
                            wu: "第五名",
                            liu: "第六名",
                            qi: "第七名",
                            ba: "第八名",
                            jiu: "第九名"
                        }, begin: 1, end: 10, row_num_count: 10, selector: 2, value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前九名',
                    example: '猜前九名',
                    help: '猜前九名'
                },
                '400039': {     //猜前九名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 9, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_ten: {
                title: '猜前十',
                row: {
                    '猜前十名': ['400010', '400030', '400020', '400040']
                },
                '400010': {     //猜第十名
                    type: 'select',
                    param: {
                        titles: {pk: "第十名"},
                        begin: 1,
                        end: 10,
                        row_num_count: 10,
                        selector: 2,
                        value: 'number'
                    },
                    calculate: {method: 'formula_num_count', num_separator: ','},
                    explain: '猜第十名',
                    example: '猜第十名',
                    help: '猜第十名'
                },
                '400030': {     //猜第十名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 1, check_type: 0, num_separator: '~'},
                    explain: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    example: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)',
                    help: '输入选择的号码,每个号码之间用逗号隔开(1,2,3)'
                },
                '400020': {        //猜前十名
                    type: 'select',
                    param: {
                        'titles': {
                            yi: "冠军",
                            er: "亚军",
                            san: "季军",
                            si: "第四",
                            wu: "第五名",
                            liu: "第六名",
                            qi: "第七名",
                            ba: "第八名",
                            jiu: "第九名",
                            shi: "第十名"
                        }, begin: 1, end: 10, row_num_count: 10, selector: 2, value: 'number'
                    },
                    calculate: {method: 'formula_count_no_repeat', num_separator: ',', row_separator: '-'},
                    explain: '猜前十名',
                    example: '猜前十名',
                    help: '猜前十名'
                },
                '400040': {     //猜前九名
                    type: 'input',
                    param: {},
                    calculate: {base_len: 10, check_type:0, num_separator: ' '},
                    explain: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    example: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)',
                    help: '输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)'
                }
            },
            wf_dwd: {
                title: '定位胆',
                row: {
                    '定位胆': ['400041']
                },
                '400041': {     //猜第十名
                    type: 'select',
                    param: {
                        titles: {yi:"第一",er:'第二',san:'第三',si:'第四',wu:'第五',liu:'第六',qi:'第七',ba:'第八',jiu:'第九',shi:'第十'},
                        begin:1,end:10,row_num_count:10,selector:2
                    },
                    calculate: {method:'formula_num_count',num_separator:',',row_separator:'-'},
                    explain: '定位胆',
                    example: '定位胆',
                    help: '定位胆'
                }
            },
            wf_qwwf: {
                title: '趣味玩法',
                row: {
                    '大小单双': ['400051', '400052', '400053'],
                    '猜和值': ['400054', '400055'],
                    '龙虎斗': ['400056']
                },
                '400051': {     //冠军大小单双
                    'type': 'select',
                    'param': {'titles': {yi:'冠军'},'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    explain: '冠军大小单双',
                    example: '冠军大小单双',
                    help: '冠军大小单双'
                },
                '400052': {     //亚军大小单双
                    'type': 'select',
                    'param': {'titles': {yi:'亚军'},'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    explain: '亚军大小单双',
                    example: '亚军大小单双',
                    help: '亚军大小单双'
                },
                '400053': {     //季军大小单双
                    'type': 'select',
                    'param': {'titles': {yi:'季军'},'cs': 'dx_ds', 'selector': 1},
                    'calculate': {'method': 'formula_num_multiply'},
                    explain: '季军大小单双',
                    example: '季军大小单双',
                    help: '季军大小单双'
                },
                '400054': {   // 冠亚和值
                    'type': 'select',
                    'param': {'titles': {hz: "和值"}, 'begin': 3, 'end': 19, row_num_count: 11, 'selector': 1, num_len:1},
                    'calculate': {'method': 'formula_num_count', num_separator: ','},
                    'explain': '从3-19中任意选择1个或1个以上号码。',
                    'example': '投注号码为14，比赛结果的冠军车号为8，亚军车号为6，冠、亚军车号相加的和值为14，与投注的号码相符合时视为中奖',
                    'help': '投注号码为14，比赛结果的冠军车号为8，亚军车号为6，冠、亚军车号相加的和值为14，与投注的号码相符合时视为中奖'
                },
                '400055': {  // 冠亚季和值
                    'type': 'select',
                    'param': {'titles': {hz: "和值"}, 'begin': 6, 'end': 27, row_num_count: 11, 'selector': 1, num_len:1},
                    'calculate': {'method': 'formula_num_count', num_separator: ','},
                    'explain': '从6-27中任意选择1个或1个以上号码。',
                    'example': '投注号码为8，比赛结果的冠军车号为1，亚军车号为2，季军车号为5，冠、亚、季军车号相加的和值为8，与投注的号码相符合时视为中奖',
                    'help': '投注号码为8，比赛结果的冠军车号为1，亚军车号为2，季军车号为5，冠、亚、季军车号相加的和值为8，与投注的号码相符合时视为中奖'
                },
                '400056': {   // 龙虎斗
                    type: 'select',
                    'param': {
                        'titles': {
                            0: "一 VS 十",
                            1: "二 VS 九",
                            2: "三 VS 八",
                            3: "四 VS 七",
                            4: "五 VS 六"
                        },
                        'cs': 'pk_lhd', 'selector': 1
                    },
                    'calculate': {
                        'method': 'formula_num_count',
                        'value': 'pk_lhd',
                        num_separator: ',',
                        group: 'all_num'
                    },
                    explain: '任意选择一个号码组成一注。',
                    example: '龙虎是由两两名次进行号码PK，第一名VS第十名、第二名VS第九名、第三名VS第八名、第四名VS第七名、第五名VS第六名',
                    help: '第一名、第二名、第三名、第四名、第五名为龙，第六名、第七名、第八名、第九名、第十名为虎。 假设:投注第二名:[龙]，比赛结果第二名为5，第九名为4，即为中奖。 假设:投注第五名:[龙]，比赛结果第五名为1，第六名为9，则为不中奖'
                }
            }
        }
    }
};
var NUM_VALUE= {
    zhi_san: {
        '0': 1,
        '1': 3,
        '2': 6,
        '3': 10,
        '4': 15,
        '5': 21,
        '6': 28,
        '7': 36,
        '8': 45,
        '9': 55,
        '10': 63,
        '11': 69,
        '12': 73,
        '13': 75,
        '14': 75,
        '15': 73,
        '16': 69,
        '17': 63,
        '18': 55,
        '19': 45,
        '20': 36,
        '21': 28,
        '22': 21,
        '23': 15,
        '24': 10,
        '25': 6,
        '26': 3,
        '27': 1
    },
    kd_san: {
        '0': 10,
        '1': 54,
        '2': 96,
        '3': 126,
        '4': 144,
        '5': 150,
        '6': 144,
        '7': 126,
        '8': 96,
        '9': 54
    },
    zu_san: {
        '1': 1,
        '2': 2,
        '3': 2,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 8,
        '8': 10,
        '9': 11,
        '10': 13,
        '11': 14,
        '12': 14,
        '13': 15,
        '14': 15,
        '15': 14,
        '16': 14,
        '17': 13,
        '18': 11,
        '19': 10,
        '20': 8,
        '21': 6,
        '22': 5,
        '23': 4,
        '24': 2,
        '25': 2,
        '26': 1
    },
    'zhi_er': {
        '0': 1,
        '1': 2,
        '2': 3,
        '3': 4,
        '4': 5,
        '5': 6,
        '6': 7,
        '7': 8,
        '8': 9,
        '9': 10,
        '10': 9,
        '11': 8,
        '12': 7,
        '13': 6,
        '14': 5,
        '15': 4,
        '16': 3,
        '17': 2,
        '18': 1
    },
    'kd_er': {
        '0': 10,
        '1': 18,
        '2': 16,
        '3': 14,
        '4': 12,
        '5': 10,
        '6': 8,
        '7': 6,
        '8': 4,
        '9': 2
    },
    'zu_er': {
        '1': 1,
        '2': 1,
        '3': 2,
        '4': 2,
        '5': 3,
        '6': 3,
        '7': 4,
        '8': 4,
        '9': 5,
        '10': 4,
        '11': 4,
        '12': 3,
        '13': 3,
        '14': 2,
        '15': 2,
        '16': 1,
        '17': 1
    },
    'fc_spice_012': {
        '000': 64,
        '001': 48,
        '002': 48,
        '010': 48,
        '011': 36,
        '012': 36,
        '020': 48,
        '021': 36,
        '022': 36,
        '100': 48,
        '101': 36,
        '102': 36,
        '110': 36,
        '111': 27,
        '112': 27,
        '120': 27,
        '121': 36,
        '122': 27,
        '200': 48,
        '201': 36,
        '202': 36,
        '210': 36,
        '211': 27,
        '212': 27,
        '220': 36,
        '221': 27,
        '222': 27
    },
    'ks_sbt': {
        '6': 1,
        '7': 1,
        '8': 2,
        '9': 3,
        '10': 3,
        '11': 3,
        '12': 3,
        '13': 2,
        '14': 1,
        '15': 1
    }
};
var NUM_CAPTION_VALUE= {
    bjl: {
        num_cls: 'nbt',
        row_num_count: 4,
        num: {
            '庄闲': 1,
            '对子': 2,
            '豹子': 3,
            '天王': 4
        },
        sort: ['庄闲', '对子', '豹子', '天王']
    },
    tsh: {
        num_cls: 'nbt',
        row_num_count: 3,
        num: {
            '豹子': 1,
            '顺子': 2,
            '对子': 3
        },
        sort: ['豹子', '顺子', '对子']
    },
    dx_ds: {
        num_cls: 'nb',
        row_num_count: 4,
        num: {
            '大': 9,
            '小': 1,
            '单': 3,
            '双': 2
        },
        sort: ['大', '小', '单', '双']
    },
    fc_spice_012: {
        zero: {
            num_cls: 'nbt',
            row_num_count: 9,
            num: {
                '000': '000',
                '001': '001',
                '002': '002',
                '010': '010',
                '011': '011',
                '012': '012',
                '020': '020',
                '021': '021',
                '022': '022'
            },
            sort: ['000', '001', '002', '010', '011', '012', '020', '021', '022']
        },
        one: {
            num_cls: 'nbt',
            row_num_count: 9,
            num: {
                '100': '100',
                '101': '101',
                '102': '102',
                '110': '110',
                '111': '111',
                '112': '112',
                '120': '120',
                '121': '121',
                '122': '122'
            },
            sort: ['100', '101', '102', '110', '111', '112', '120', '121', '122']
        },
        two: {
            num_cls: 'nbt',
            row_num_count: 9,
            num: {
                '200': '200',
                '201': '201',
                '202': '202',
                '210': '210',
                '211': '211',
                '212': '212',
                '220': '220',
                '221': '221',
                '222': '222'
            },
            sort: ['200', '201', '202', '210', '211', '212', '220', '221', '222']
        }
    },
    fc_spice_dx: {
        small: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '小小小': '000',
                '小小大': '001',
                '小大小': '010',
                '小大大': '011'
            },
            sort: ['小小小', '小小大', '小大小', '小大大']
        },
        big: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '大小小': '100',
                '大小大': '101',
                '大大小': '110',
                '大大大': '111'
            },
            sort: ['大小小', '大小大', '大大小', '大大大']
        }
    },
    fc_spice_zh: {
        zhi: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '质质质': '000',
                '质质合': '001',
                '质合质': '010',
                '质合合': '011'
            },
            sort: ['质质质', '质质合', '质合质', '质合合']
        },
        he: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '合质质': '100',
                '合质合': '101',
                '合合质': '110',
                '合合合': '111'
            },
            sort: ['合质质', '合质合', '合合质', '合合合']
        }
    },
    fc_spice_jo: {
        ji: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '奇奇奇': '111',
                '奇奇偶': '110',
                '奇偶奇': '101',
                '奇偶偶': '100'
            },
            sort: ['奇奇奇', '奇奇偶', '奇偶奇', '奇偶偶']
        },
        ou: {
            num_cls: 'nbt',
            row_num_count: 4,
            num: {
                '偶奇奇': '011',
                '偶奇偶': '010',
                '偶偶奇': '001',
                '偶偶偶': '000'
            },
            sort: ['偶奇奇', '偶奇偶', '偶偶奇', '偶偶偶']
        }
    },
    'fc_spice_dx_num': {
        num: {
            '小': '0',
            '大': '1'
        }
    },
    'fc_spice_zh_num': {
        num: {
            '质': '0',
            '合': '1'
        }
    },
    'fc_spice_jo_num': {
        num: {
            '偶': '0',
            '奇': '1'
        }
    },
    eleven_five_dds: {
        num_cls: 'nbt',
        row_num_count: 6,
        num: {
            '5单0双': '0',
            '4单1双': '1',
            '3单2双': '2',
            '2单3双': '3',
            '1单4双': '4',
            '0单5双': '5'
        },
        sort: ['5单0双', '4单1双', '3单2双', '2单3双', '1单4双', '0单5双']
    },
    lhc_dx_ds: {
        num_cls: 'nbt',
        row_num_count: 5,
        num: {
            '特大': '01',
            '特小': '02',
            '特单': '03',
            '特双': '04',
            '特和': '05'
        },
        sort: ['特大', '特小', '特单', '特双', '特和']
    },
    lhc_sx: {
        num_cls: 'nb',
        row_num_count: 12,
        num: {
            '鼠': '01',
            '牛': '02',
            '虎': '03',
            '兔': '04',
            '龙': '05',
            '蛇': '06',
            '马': '07',
            '羊': '08',
            '猴': '09',
            '鸡': '10',
            '狗': '11',
            '猪': '12'
        },
        sort: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    },
    lhc_sb: {
        num_cls: 'nbt',
        row_num_count: 3,
        num: {
            '红波': '01',
            '蓝波': '02',
            '绿波': '03'
        },
        sort: ['红波', '蓝波', '绿波']
    },
    ks_et_fs: {
        nbs_cls: 'nbs_dice_2',
        num_cls: 'dices',
        num: {
            '11*': {num: ['top_dice dice_0', 'dice_1', 'dice_1'], value: 1},
            '22*': {num: ['top_dice dice_0', 'dice_2', 'dice_2'], value: 2},
            '33*': {num: ['top_dice dice_0', 'dice_3', 'dice_3'], value: 3},
            '44*': {num: ['top_dice dice_0', 'dice_4', 'dice_4'], value: 4},
            '55*': {num: ['top_dice dice_0', 'dice_5', 'dice_5'], value: 5},
            '66*': {num: ['top_dice dice_0', 'dice_6', 'dice_6'], value: 6}
        },
        sort: ['11*', '22*', '33*', '44*', '55*', '66*']
    },
    ks_et_bz: {
        et: {
            nbs_cls: 'nbs_dice_1',
            num_cls: 'dices',
            num: {
                '11': {num: ['dice_1', 'dice_1'], value: 1},
                '22': {num: ['dice_2', 'dice_2'], value: 2},
                '33': {num: ['dice_3', 'dice_3'], value: 3},
                '44': {num: ['dice_4', 'dice_4'], value: 4},
                '55': {num: ['dice_5', 'dice_5'], value: 5},
                '66': {num: ['dice_6', 'dice_6'], value: 6}
            },
            sort: ['11', '22', '33', '44', '55', '66']
        },
        bt: {
            nbs_cls: 'nbs_dice_0',
            num: {
                '1': '1',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5',
                '6': '6'
            },
            sort: ['1', '2', '3', '4', '5', '6']
        }
    },
    ks_sth: {
        nbs_cls: 'nbs_dice_2',
        num_cls: 'dices',
        num: {
            '111': {num: ['top_dice dice_1', 'dice_1', 'dice_1'], value: 1},
            '222': {num: ['top_dice dice_2', 'dice_2', 'dice_2'], value: 2},
            '333': {num: ['top_dice dice_3', 'dice_3', 'dice_3'], value: 3},
            '444': {num: ['top_dice dice_4', 'dice_4', 'dice_4'], value: 4},
            '555': {num: ['top_dice dice_5', 'dice_5', 'dice_5'], value: 5},
            '666': {num: ['top_dice dice_6', 'dice_6', 'dice_6'], value: 6}
        },
        sort: ['111', '222', '333', '444', '555', '666']
    },
    ks_slh: {
        nbs_cls: 'nbs_dice_2',
        num_cls: 'dices',
        num: {
            '123': {num: ['top_dice dice_1', 'dice_2', 'dice_3'], value: 123},
            '234': {num: ['top_dice dice_2', 'dice_3', 'dice_4'], value: 234},
            '345': {num: ['top_dice dice_3', 'dice_4', 'dice_5'], value: 345},
            '456': {num: ['top_dice dice_4', 'dice_5', 'dice_6'], value: 456}
        },
        sort: ['123', '234', '345', '456']
    },
    rx_wz: {
        num: {
            '0': '万',
            '1': '千',
            '2': '百',
            '3': '十',
            '4': '个'
        }
    },
    lucky_dxds: {
        num: {
            '大': '0',
            '小': '1',
            '单': '2',
            '双': '3'
        }
    },
    lucky_bs: {
        num: {
            '红': '0',
            '绿': '1',
            '蓝': '2'
        }
    },
    lucky_tmbs: {
        num: {'特码包三': '0'}
    },
    lucky_tszh: {
        num: {'豹子': '0'}
    },
    lucky_zh: {
        num: {
            '大单': '0',
            '小单': '1',
            '大双': '2',
            '小双': '3'
        }
    },
    lucky_jdjx: {
        num: {
            '极大': '0',
            '极小': '1'
        }
    },
    pk_lhd: {
        0: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 0,
                '虎': 1
            },
            sort: ['龙', '虎']
        },
        1: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 2,
                '虎': 3
            },
            sort: ['龙', '虎']
        },
        2: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 4,
                '虎': 5
            },
            sort: ['龙', '虎']
        },
        3: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 6,
                '虎': 7
            },
            sort: ['龙', '虎']
        },
        4: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 8,
                '虎': 9
            },
            sort: ['龙', '虎']
        }
    },
    pk_lhd_num: {
        num: {
            '一VS十-龙': '0',
            '一VS十-虎': '1',
            '二VS九-龙': '2',
            '二VS九-虎': '3',
            '三VS八-龙': '4',
            '三VS八-虎': '5',
            '四VS七-龙': '6',
            '四VS七-虎': '7',
            '五VS六-龙': '8',
            '五VS六-虎': '9'
        }
    },
    ssc_lhd: {
        wz: {
            nbs_cls: 'nbs',
            num_cls: 'nbt',
            num: {
                '十个': '0',
                '百个': '1',
                '百十': '2',
                '千个': '3',
                '千十': '4',
                '千百': '5',
                '万个': '6',
                '万十': '7',
                '万百': '8',
                '万千': '9'
            },
            sort: ['十个', '百个', '百十', '千个', '千十', '千百', '万个', '万十', '万百', '万千']
        },
        hm: {
            nbs_cls: 'nbs',
            num_cls: 'nb',
            num: {
                '龙': '1',
                '虎': '2',
                '合': '3'
            },
            sort: ['龙', '虎', '合']
        }
    }
    /*ssc_lhd_num: {
        num: {
            '1': '龙',
            '2': '虎',
            '3': '合'
        }
    },
    ssc_lhd_num: {
        num: {
            '龙': '1',
            '虎': '2',
            '合': '3'
        }
    }*/
};
var CAPTION_VALUE_WF= {
    '120205': 'dx_ds',
    '16': 'dx_ds',
    '130337': 'dx_ds',
    '132537': 'dx_ds',
    '150060': 'bjl',
    '220205': 'dx_ds',
    '221305': 'dx_ds',
    '230032': 'fc_spice_dx_num',
    '230033': 'fc_spice_zh_num',
    '230034': 'fc_spice_jo_num',
    '350008': 'eleven_five_dds',
    '120001': 'rx_wz',
    '120038': 'rx_wz',
    '120004': 'rx_wz',
    '120003': 'rx_wz',
    '120039': 'rx_wz',
    '130001': 'rx_wz',
    '130038': 'rx_wz',
    '130042': 'rx_wz',
    '130041': 'rx_wz',
    '130044': 'rx_wz',
    '130043': 'rx_wz',
    '130030': 'rx_wz',
    '130039': 'rx_wz',
    '140001': 'rx_wz',
    '140041': 'rx_wz',
    '140042': 'rx_wz',
    '140043': 'rx_wz',
    '140044': 'rx_wz',
    '400051': 'dx_ds',
    '400052': 'dx_ds',
    '400053': 'dx_ds',
    '400056': 'pk_lhd_num',
    '600002': 'lucky_dxds',
    '600003': 'lucky_bs',
    '600005': 'lucky_tszh',
    '600006': 'lucky_zh',
    '600007': 'lucky_jdjx'
};

/**
 * Created by NicoleQi on 2016/12/13.
 */
/*充值中心*/
function rechargeCenter(){
    $(".recharge-btn").click(function(){
        recharge.getRecharge();
        $(".pop-area .recharge-box").hide();
        $(".third-party").click();
    })
}


var recharge ={
    /*充值提款*/
    getRecharge:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.6',
            content:document.getElementById("recharge-set"),
            width:'1000px',
            height:'auto',
            close:function(){
                $(".body").css('overflow','visible');
            }
        });
    }
};
/*点击未锁定编辑银行卡信息*/
function bindBankEdit(){
    $(" .item").click(function(){
        if($(this).html().indexOf("未锁定")!=-1){
            $(".lock-bind-bank-area").siblings().hide();
            $(".lock-bind-bank-area").show();
            $("#is-show input").addClass("is-show");
            return false;
        }else if($(this).html().indexOf("绑定新的银行卡")!=-1){
            $(".lock-bind-bank-area").siblings().hide();
            $(".lock-bind-bank-area").show();
            $("#is-show input").addClass("is-show");
        }else{
            return false;
        }
    });


}


function bindBankEdits() {
  $(" .sub-btn").click(function () {
     if ($(this).html().indexOf("修改登录密码") != -1) {
       $("#safe-center").hide();
       $("#change-password").show();
       $('.account-content').show();
       return false;
    } else if ($(this).html().indexOf("修改资金密码") != -1) {
       $("#safe-center").hide();
       $("#change-password").show();
       $('.account-content').show();
       return false;
    } else if ($(this).html().indexOf("绑定六号卡") != -1) {
       $("#safe-center").hide();
       $("#bank-card-info").show();
       $(".edit-bank-content").siblings().hide();
       $(".edit-bank-content").show();
       return false;
    }else  if ($(this).html().indexOf('绑定QQ') != -1) {
      $(".qq").siblings().hide();
      $(".qq").show();
      return false;
    }else if ($(this).html().indexOf("绑定邮箱") != -1) {
      $(".email").siblings().hide();
      $(".email").show();
       return false;
    }else if ($(this).html().indexOf("绑定电话") != -1) {
       $(".tels").siblings().hide();
       $(".tels").show();
       return false;
     }else {
      return false;
    }
  });
}

function bindBankEditss(){
  $(" .personal-box .bank-account-content .account-bank-form ul li").click(function(){
    if($(this).html().indexOf("尾号2323")!=-1){
      $(".edit-bank-content").siblings().hide();
      $(".edit-bank-content").show();
      return false;
    }else{
      return false;
    }
  });


}

/**
 * Created by NicoleQi on 2016/12/15.
 */
/*记录中心*/
function recordCenter(){
    $(".record-btn").click(function(){
      record.getRecord();
        $(".lottery-game-record").click();
    })
}

/*点击显示订单详情*/
function orderOperation(){
    $('.record-bottom-area table td i').click(function() {
        var _this = $(this);
        _this.parent().click();
        var html =
        '<div class="order-content">'+
            '<div class="order-content-message">'+
                '<table>'+
                    '<tbody>'+
                        '<tr>'+
                            '<td>订单号:</td>'+
                            '<td>B01164741XGF91S9</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>彩票名称：</td>'+
                            '<td>重庆时时彩</td>'+
                            '<td>玩法名称：</td>'+
                            '<td>定位胆五星定位胆</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>投注期号：</td>'+
                            '<td>20161101065</td>'+
                            '<td>下单时间：</td>'+
                            '<td>2016-11-01 16:47:41</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>彩票状态：</td>'+
                            '<td>未中奖</td>'+
                            '<td>投注金额：</td>'+
                            '<td>10.000</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>投注数量：</td>'+
                            '<td>5</td>'+
                            '<td>返点金额：</td>'+
                            '<td>10.040</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>投注倍数：</td>'+
                            '<td>1</td>'+
                            '<td>中奖注数：</td>'+
                            '<td>0.000</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>元角模式：</td>'+
                            '<td>元</td>'+
                            '<td>单注奖金：</td>'+
                            '<td></td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>派彩返点：</td>'+
                            '<td>0.4%</td>'+
                            '<td>中奖金额：</td>'+
                            '<td>0.000</td>'+
                        '</tr>'+
                        '<tr>'+
                            '<td>开奖号码：</td>'+
                            '<td>5,4,7,2,7</td>'+
                            '<td>盈亏金额：</td>'+
                            '<td>-9.960</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
            '<div class="user-bet-number">'+
                '<table>'+
                    '<tbody>'+
                        '<tr>'+
                            '<td valign="top">投注号码：</td>'+
                            '<td>'+
                                '<p>3,4,9</p>'+
                            '</td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</div>'+
        '</div>';
        _this.justToolsTip({
            animation: "flipIn",
            events: 'onclick',
            gravity: 'left',
            contents: html
        });
    });
}

var record ={
    /*充值提款*/
    getRecord:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.6',
            content:document.getElementById("record-set"),
            width:'1000px',
            height:'auto',
            close:function(){
                $(".body").css('overflow','visible');
            }
        });
    }
};




/**
 * Created by NicoleQi on 2016/12/17.
 */
/*报表中心*/
function reportCenter(){
    $(".report-btn").click(function(){
        report.getReport();
        $(".report-nav").click();
    })
}


var report ={
    /*充值提款*/
    getReport:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.6',
            content:document.getElementById("report-center"),
            width:'1000px',
            height:'auto',
            close:function(){
                $(".body").css('overflow','visible');
            }
        });


    }
};








/**
 * Created by NicoleQi on 2016/12/17.
 */
/*个人中心*/
function teamCenter(){
    $(".team-btn").click(function(){
        team.getTeam();
        $(".total-team").click();
    })
}

/*返点详情*/
function lowerRebateMessage(){
    $('.sub-manager-cont .data-table .td-green .fa.fa-search-plus').hover(function() {
        initHint1('.sub-manager-cont .data-table .td-green .fa.fa-search-plus','<p class="fd-w">高频彩返点：3.500<br>低频彩返点：3.500<br>PT电子：1.500</p>');
    });
}

var team ={
    /*充值提款*/
    getTeam:function(){
        art.dialog({
            padding:0,
            title:'',
            resize: false,
            time: false,
            lock:true,
            fixed:true,
            background:'#000',
            opacity:'0.6',
            content:document.getElementById("team-center"),
            width:'1000px',
            height:'auto',
            close:function(){
                $(".body").css('overflow','visible');
            }
        });
    }
};

function initHint1(id, content){
    $(id).miniTip({
        content: content,
        anchor: 'n',
        event: 'hover',
        fadeIn: 500,
        fadeOut: 500,
        aHide: true,
        maxW: '500px',
        offset: 1,
        stemOff: 0,
        position: 'bottom'
    });
}
var wf_list = {
    '1': {
        '五星直选': ['150001', '150030', '150031'],
        '五星组选': ['150041', '150043', '150044', '150045', '150042', '150046'],
        '五星特殊': ['150061', '150062', '150063', '150064'],

        '四星直选': ['140402', '140401', '140431', '141502', '141501', '141531'],
        '四星组选': ['140441', '140442', '140443', '140444', '141541', '141542', '141543', '141544'],

        '前三直选': ['17', '18', '130331', '130308', '130332'],
        '前三组选': ['20', '21', '22', '23', '130307', '130339', '130333'],

        '中三直选': ['131402', '131401', '131431', '131408', '131432'],
        '中三组选': ['131404', '131403', '131406', '131405', '150065', '131439', '131433'],

        '后三直选': ['2', '3', '132531', '8', '132532'],
        '后三组选': ['4', '5', '6', '7', '132407', '132539', '132533'],

        '前二直选': ['10', '11', '120238', '120232'],
        '前二组选': ['120204', '120203', '120239', '120233'],

        '后二直选': ['12', '13', '123538', '123532'],
        '后二组选': ['14', '15', '123539', '123533'],

        '定位胆': ['9'],

        '三星不定位': ['19', '131409', '1', '130352', '131452', '132552'],
        '四星不定位': ['141551', '141552'],
        '五星不定位': ['150052', '150053'],
        '大小单双': ['120205', '16', '130337', '132537'],
        '任二直选': ['120002', '120001', '120038'],
        '任二组选': ['120004', '120003', '120039'],

        '任三直选': ['130002', '130001', '130038'],
        '任三组选': ['130042', '130041', '130044', '130043', '130030', '130039'],
        '任四直选': ['140002', '140001'],
        '任四组选': ['140041', '140042', '140043', '140044']
    },
    '2': {
        '三星直选': ['24', '25', '37'],
        '三星组选': ['26', '27', '28', '29', '230007', '230008'],
        '三星趣味': ['230031', '230032', '230033', '230034'],
        '二星直选': ['31', '32', '35', '36'],
        '二星组选': ['220203', '220204', '221303', '221304'],
        '不定位': ['33'],
        '大小单双': ['220205', '221305'],
        '前一直选': ['30'],
        '后一直选': ['34']
    },
    '3': {
        '三码': ['44', '45', '46', '330301', '47'],
        '二码': ['39', '320202', '40', '320201', '41'],
        '一码': ['38'],
        '不定位': ['330303'],
        '定位胆': ['330304'],
        '趣味型': ['350008', '350009'],
        '任选复式': ['310005', '42', '48', '50', '52', '55', '57', '59'],
        '任选单式': ['310006', '320006', '330006', '340006', '350006', '360006', '370006', '380006'],
        '任选胆拖': ['43', '49', '51', '53', '56', '58'] //, '60'
    },
    '4': {
        '快乐十分': ['61', '62', '63', '64', '66', '67', '65', '68', '69', '70']
    },
    '6': {
        '号码': ['81']//, '82', '92', '86', '88', '89', '90', '91'],
        //'生肖': ['93', '84', '87'],
        //'趣味': ['83', '85']
    },
    '9': {
        '二不同号': ['500001', '500002', '500003'],
        //'单选': ['500004', '500005'],
        //'复选': ['500006'],
        '三不同号': ['500007', '500008', '500009', '500010'],
        '三同号': ['500011', '500012', '500013'],
        '和值': ['500014']
    },
    '10': {
        '猜第一': ['400001', '400021'],
        '猜前二名': ['400002', '400022', '400012', '400032'],
        '猜前三名': ['400003', '400023', '400013', '400033'],
        '猜前四名': ['400004', '400024', '400014', '400034'],
        '猜前五名': ['400005', '400025', '400015', '400035'],
        '猜前六名': ['400006', '400026', '400016', '400036'],
        '猜前七名': ['400007', '400027', '400017', '400037'],
        '猜前八名': ['400008', '400028', '400018', '400038'],
        '猜前九名': ['400009', '400029', '400019', '400039'],
        '猜前十名': ['400010', '400030', '400020', '400040'],
        '定位胆': ['400041', '400051', '400052', '400053'],
        '和值': ['400054', '400055'],//, 龙虎斗, '400056'
        '龙虎斗':['400056']
    },
    '13':{
        '猜数字':['600001'],
        '大小单双':['600002'],
        '波色':['600003'],
        '特码包三':['600004'],
        '特殊组合':['600005'],
        '大单小单大双小双':['600006'],
        '极大极小':['600007']
    }
};

var renderList = {
    '1': [
        {
            "150001": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位、百位、十位、个位各选一个号码组成一注。",
                "example": "投注方案：12345<br>开奖号码：12345，即中五星直选。",
                "help": "从万位、千位、百位、十位、个位中选择一个5位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。"
            },
            "150030": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 5, "check_type": 0},
                "explain": "手动输入号码，至少输入1个五位数号码组成一注。",
                "example": "投注方案：23456<br>开奖号码：23456，即中五星直选。",
                "help": "手动输入一个5位数号码组成一注，所选号码的万位、千位、百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。(五星直选单式每注的最大投注为10000注,如果确实想投注更多的号码，请拆分成多注后进行)"
            },
            "150031": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万位", "qw": "千位", "bw": "百位", "sw": "十位", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从万位、千位、百位、十位、个位各选一个号码组成五注。",
                "example": "投注方案：<br/>购买：4+5+6+7+8，该票共10元，由以下5注：45678(五星)、5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：45678，即可中五星、四星、三星、二星、一星各1注。",
                "help": "从万位、千位、百位、十位、个位中至少各选一个号码组成1-5星的组合，共五注，所选号码的个位与开奖号码相同，则中1个5等奖；所选号码的个位、十位与开奖号码相同，则中1个5等奖以及1个4等奖，依此类推，最高可中5个奖。"
            },
            "150041": {
                "type": "select",
                "param": {"titles": {"zx": "组选120"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 5},
                "explain": "从0-9中选择5个号码组成一注。",
                "example": "投注方案：10568<br/>开奖号码：10568（顺序不限），即可中五星组选120。",
                "help": "从0-9中任意选择5个号码组成一注，所选号码与开奖号码的万位、千位、百位、十位、个位相同，顺序不限，即为中奖。"
            },
            "150042": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 3},
                "explain": "从“二重号”选择一个号码，“单号”中选择三个号码组成一注。",
                "example": "投注方案：二重号：8；单号：016<br/>开奖号码：01688（顺序不限），即可中五星组选60。",
                "help": "选择1个二重号码和3个单号号码组成一注，所选的单号号码与开奖号码相同，且所选二重号码在开奖号码中出现了2次，即为中奖。"
            },
            "150043": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 1, "moreRow": 0, "base_len": 2},
                "explain": "从“二重号”选择两个号码，“单号”中选择一个号码组成一注。",
                "example": "投注方案：二重号：68；单号：0<br/>开奖号码：06688（顺序不限），即可中五星组选30。",
                "help": "选择2个二重号和1个单号号码组成一注，所选的单号号码与开奖号码相同，且所选的2个二重号码分别在开奖号码中出现了2次，即为中奖。"
            },
            "150044": {
                "type": "select",
                "param": {
                    "titles": {"san": "三重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 2},
                "explain": "从“三重号”选择一个号码，“单号”中选择两个号码组成一注。",
                "example": "投注方案：三重号：8；单号：01<br/>开奖号码：01888（顺序不限），即可中五星组选20。",
                "help": "选择1个三重号码和2个单号号码组成一注，所选的单号号码与开奖号码相同，且所选三重号码在开奖号码中出现了3次，即为中奖。"
            },
            "150045": {
                "type": "select",
                "param": {
                    "titles": {"san": "三重号", "er": "二重号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
                "explain": "从“三重号”选择一个号码，“二重号”中选择一个号码组成一注。",
                "example": "投注方案：三重号：8；二重号：1<br/>开奖号码：11888（顺序不限），即可中五星组选10。",
                "help": "选择1个三重号码和1个二重号码，所选三重号码在开奖号码中出现3次，并且所选二重号码在开奖号码中出现了2次，即为中奖。"
            },
            "150046": {
                "type": "select",
                "param": {
                    "titles": {"si": "四重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
                "explain": "从“四重号”选择一个号码，“单号”中选择一个号码组成一注。",
                "example": "投注方案：四重号：8；单号：1<br/>开奖号码：18888（顺序不限），即可中五星组选5。",
                "help": "选择1个四重号码和1个单号号码组成一注，所选的单号存在于开奖号码中，且所选四重号码在开奖号码中出现了4次，即为中奖。"
            },
            "150061": {
                "type": "select",
                "param": {"titles": {"yi": "一帆风顺"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择一个以上号码。",
                "example": "投注方案：8<br/>开奖号码：至少出现1个8，即中一帆风顺。",
                "help": "从0-9中任意选择1个号码组成一注，只要开奖号码的万位、千位、百位、十位、个位中包含所选号码，即为中奖。"
            },
            "150062": {
                "type": "select",
                "param": {"titles": {"hao": "好事成双"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择一个以上的二重号码。",
                "example": "投注方案：8<br/>开奖号码：至少出现2个8，即中好事成双。",
                "help": "从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现2次，即为中奖。"
            },
            "150063": {
                "type": "select",
                "param": {"titles": {"san": "三星报喜"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择一个以上的三重号码。",
                "example": "投注方案：8<br/>开奖号码：至少出现3个8，即中三星报喜。",
                "help": "从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现3次，即为中奖。"
            },
            "150064": {
                "type": "select",
                "param": {"titles": {"si": "四季发财"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择一个以上的四重号码。",
                "example": "投注方案：8<br/>开奖号码：至少出现4个8，即中四季发财。",
                "help": "从0-9中任意选择1个号码组成一注，只要所选号码在开奖号码的万位、千位、百位、十位、个位中出现4次，即为中奖。"
            },
            "title": "五星",
            "row": {
                "五星直选": ["150001", "150030", "150031"],
                "五星组选": ["150041", "150042", "150043", "150044", "150045", "150046"],
                "五星特殊": ["150061", "150062", "150063", "150064"]
            }
        }, {
            "140401": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 4, "check_type": 0},
                "explain": "手动输入号码，至少输入1个四位数号码组成一注。",
                "example": "投注方案：3456<br/>开奖号码：3456，即中四星直选。",
                "help": "手动输入一个4位数号码组成一注，所选号码的万位、千位、百位、十位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "140402": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位、百位、十位各选一个号码组成一注。",
                "example": "投注方案：3456<br/>开奖号码：3456，即中四星直选。",
                "help": "从万位、千位、百位、十位中选择一个4位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。"
            },
            "140431": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从万位、千位、百位、十位各选一个号码组成四注。",
                "example": "投注方案：<br/>购买：5+6+7+8，该票共8元，由以下4注：5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：5678，即可中四星、三星、二星、一星各1注。",
                "help": "从万位、千位、百位、十位中至少各选一个号码组成1-4星的组合，共四注，所选号码的个位与开奖号码相同，则中1个4等奖；所选号码的十位、百位与开奖号码相同，则中1个4等奖以及1个3等奖，依此类推，最高可中4个奖。"
            },
            "140441": {
                "type": "select",
                "param": {"titles": {"zx": "组选24"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 4},
                "explain": "从0-9中选择4个号码组成一注。",
                "example": "投注方案：0568，开奖号码的四个数字只要包含0、5、6、8，即可中四星组选24。",
                "help": "从0-9中任意选择4个号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且顺序不限，即为中奖。"
            },
            "140442": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 2},
                "explain": "从“二重号”选择一个号码，“单号”中选择两个号码组成一注。",
                "example": "投注方案：二重号：8，单号：0、6，只要开奖的四个数字从小到大排列为 0、6、8、8，即可中四星组选12。",
                "help": "选择1个二重号码和2个单号号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且所选二重号码在开奖号码万位、千位、百位、十位中出现了2次，即为中奖。"
            },
            "140443": {
                "type": "select",
                "param": {"titles": {"er": "二重号"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从“二重号”选择两个号码组成一注。",
                "example": "投注方案：二重号：2、8，只要开奖的四个数字从小到大排列为 0、2、2、8、8，即可中四星组选6。",
                "help": "选择2个二重号码组成一注，所选的2个二重号码在开奖号码万位、千位、百位、十位分别出现了2次，即为中奖。"
            },
            "140444": {
                "type": "select",
                "param": {
                    "titles": {"san": "三重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
                "explain": "从“三重号”选择一个号码，“单号”中选择一个号码组成一注。",
                "example": "投注方案：三重号：8，单号：0、2，只要开奖的四个数字从小到大排列为 0、2、8、8、8，即可中四星组选4。",
                "help": "选择1个三重号码和1个单号号码组成一注，所选号码与开奖号码的万位、千位、百位、十位相同，且所选三重号码在开奖号码万位、千位、百位、十位中出现了3次，即为中奖。"
            },
            "141501": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 4, "check_type": 0},
                "explain": "手动输入号码，至少输入1个四位数号码组成一注。",
                "example": "投注方案：3456<br/>开奖号码：3456，即中四星直选。",
                "help": "手动输入一个4位数号码组成一注，所选号码的千位、百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "141502": {
                "type": "select",
                "param": {
                    "titles": {"qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从千位、百位、十位、个位各选一个号码组成一注。",
                "example": "投注方案：3456<br/>开奖号码：3456，即中四星直选。",
                "help": "从千位、百位、十位、个位中选择一个4位数号码组成一注，所选号码与开奖号码相同，且顺序一致，即为中奖。"
            },
            "141531": {
                "type": "select",
                "param": {
                    "titles": {"qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从千位、百位、十位、个位各选一个号码组成四注。",
                "example": "投注方案：<br/>购买：5+6+7+8，该票共8元，由以下4注：5678(四星)、678(三星)、78(二星)、8(一星)构成。<br/>开奖号码：5678，即可中四星、三星、二星、一星各1注。",
                "help": "从千位、百位、十位、个位中至少各选一个号码组成1-4星的组合，共四注，所选号码的个位与开奖号码相同，则中1个4等奖；所选号码的个位、十位与开奖号码相同，则中1个4等奖以及1个3等奖，依此类推，最高可中4个奖。"
            },
            "141541": {
                "type": "select",
                "param": {"titles": {"zx": "组选24"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 4},
                "explain": "从0-9中选择4个号码组成一注。",
                "example": "投注方案：0568，开奖号码的四个数字只要包含0、5、6、8，即可中四星组选24。",
                "help": "从0-9中任意选择4个号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且顺序不限，即为中奖。"
            },
            "141542": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 2},
                "explain": "从“二重号”选择一个号码，“单号”中选择两个号码组成一注。",
                "example": "投注方案：二重号：8，单号：0、6，只要开奖的四个数字从小到大排列为 0、6、8、8，即可中四星组选12。",
                "help": "选择1个二重号码和2个单号号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且所选二重号码在开奖号码千位、百位、十位、个位中出现了2次，即为中奖。"
            },
            "141543": {
                "type": "select",
                "param": {"titles": {"er": "二重号"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从“二重号”选择两个号码组成一注。",
                "example": "投注方案：二重号：2、8，只要开奖的四个数字从小到大排列为 0、2、2、8、8，即可中四星组选6。",
                "help": "选择2个二重号码组成一注，所选的2个二重号码在开奖号码千位、百位、十位、个位分别出现了2次，即为中奖。"
            },
            "141544": {
                "type": "select",
                "param": {
                    "titles": {"san": "三重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
                "explain": "从“三重号”选择一个号码，“单号”中选择一个号码组成一注。",
                "example": "投注方案：三重号：8，单号：0、2，只要开奖的四个数字从小到大排列为 0、2、8、8、8，即可中四星组选4。",
                "help": "选择1个三重号码和1个单号号码组成一注，所选号码与开奖号码的千位、百位、十位、个位相同，且所选三重号码在开奖号码千位、百位、十位、个位中出现了3次，即为中奖。"
            },
            "title": "四星",
            "row": {
                "四星直选": ["140402", "140401", "140431", "141502", "141501", "141531"],
                "四星组选": ["140441", "140442", "140443", "140444", "141541", "141542", "141543", "141544"]
            }
        }, {
            "17": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位、百位各选一个号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中前三直选。",
                "help": "从万位、千位、百位中选择一个3位数号码组成一注，所选号码与开奖号码的前3位相同，且顺序一致，即为中奖。"
            },
            "18": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 0},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中前三直选。",
                "help": "手动输入一个3位数号码组成一注，所选号码的万位、千位、百位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "20": {
                "type": "select",
                "param": {"titles": {"zs_fs": "组三"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_fold", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：5,8,8<br/>开奖号码前三位：1个5，2个8 (顺序不限)，即中前三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的万位、千位、百位相同，且顺序不限，即为中奖。"
            },
            "21": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 4},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。",
                "example": "投注方案：5,8,8<br/>开奖号码前三位：1个5，2个8 (顺序不限)，即中前三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的万位、千位、百位相同，且顺序不限，即为中奖。"
            },
            "22": {
                "type": "select",
                "param": {"titles": {"zl_fs": "组六"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3},
                "explain": "从0-9中任意选择3个或3个以上号码。",
                "example": "投注方案：2,5,8<br/>开奖号码前三位：1个2、1个5、1个8 (顺序不限)，即中前三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的万位、千位、百位相同，顺序不限，即为中奖。"
            },
            "23": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。",
                "example": "投注方案：2,5,8<br/>开奖号码前三位：1个2、1个5、1个8 (顺序不限)，即中前三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的万位、千位、百位相同，顺序不限，即为中奖。"
            },
            "130307": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 3},
                "explain": "手动输入号码，至少输入1个三位数号码。",
                "example": "投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码前三位包括：(1)0,0,1，顺序不限，即中得前三组三；或者(2)1,2,3，顺序不限，即中得前三组六。",
                "help": "手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的万位、千位、百位符合后三组三或组六均为中奖。"
            },
            "130308": {
                "type": "select",
                "param": {"titles": {"zhi": "和值"}, "begin": 0, "end": 27, "row_num_count": 14, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zhi_san", "num_separator": "$"},
                "explain": "从0-27中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码前三位：001,010,100,即中前三直选。",
                "help": "所选数值等于开奖号码的万位、千位、百位三个数字相加之和，即为中奖。"
            },
            "130331": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从万位、千位、百位各选一个号码组成三注。",
                "example": "投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。",
                "help": "从万位、千位、百位中至少各选择一个号码组成1-3星的组合共三注，当百位号码与开奖号码相同，则中1个3等奖；如果百位与千位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。"
            },
            "130332": {
                "type": "select",
                "param": {"titles": {"zhi": "跨度"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "kd_san", "num_separator": ","},
                "explain": "从0-9中选择一个或一个以上号码。",
                "example": "投注方案：跨度8<br/>开奖号码前三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中前三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中前三直选。",
                "help": "所选数值等于开奖号码的前3位最大与最小数字相减之差，即为中奖。"
            },
            "130333": {
                "type": "select",
                "param": {"titles": {"zx": "包胆"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_count_fold", "bet": "54", "num_separator": "$"},
                "explain": "从0-9中任意选择一个号码。",
                "example": "投注方案：包胆3<br/>开奖号码前三位：(1)出现3xx或者33x,即中前三组三；(2)出现3xy，即中前三组六。",
                "help": "从0-9中任意选择1个包胆号码，开奖号码的万位、千位、百位中任意1位只要和所选包胆号码相同(不含豹子号)，即为中奖。"
            },
            "130339": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 26, "row_num_count": 13, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zu_san", "num_separator": "$"},
                "explain": "从1-26中任意选择一个或一个以上号码。",
                "example": "投注方案：和值3<br/>开奖号码前三位：(1)开出003号码，顺序不限，即中前三组三；(2)开出012号码，顺序不限，即中前三组六。",
                "help": "所选数值等于开奖号码万位、千位、百位三个数字相加之和(不含豹子号)，即为中奖。"
            },
            "title": "前三",
            "row": {
                "前三直选": ["17", "18", "130331", "130308", "130332"],
                "前三组选": ["20", "21", "22", "23", "130307", "130339", "130333"]
            },
            "qs_hz_ws": {
                "type": "select",
                "param": {"titles": {"hz_ws": "和值尾数"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从0-9中任意选择一个或一个以上号码。",
                "example": "投注方案：和值尾数8<br/>开奖号码：前三位和值尾数为8，即中得和值尾数。",
                "help": "所选数值等于开奖号码的万位、千位、百位三个数字相加之和的尾数，即为中奖。"
            },
            "qs_ts": {
                "type": "select",
                "param": {"titles": {"tsh": "特殊号"}, "cs": "tsh", "selector": 0},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "选择一个号码形态。",
                "example": "投注方案：豹子<br/>开奖号码前三位：三个数字全部相同，即中得豹子。<br/>投注方案：顺子<br/>开奖号码前三位：为连续数字，例如678，即中得顺子。<br/>投注方案：对子<br/>开奖号码前三位：3个数字中有2个数字相同，即中得对子。",
                "help": "所选的号码特殊属性和开奖号码前3位的属性一致，即为中奖。其中：1.顺子号的万、千、百位不分顺序(特别号码：019、089也是顺子号)；2.对子号指的是开奖号码的前三位当中，任意2位数字相同的三位数号码。"
            }
        }, {
            "131401": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 0},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中中三直选。",
                "help": "手动输入一个3位数号码组成一注，所选号码的千位、百位、十位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "131402": {
                "type": "select",
                "param": {
                    "titles": {"qw": "千", "bw": "百", "sw": "十"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从千位、百位、十位各选一个号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中中三直选。",
                "help": "从千位、百位、十位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。"
            },
            "131403": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 4},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。",
                "example": "投注方案：5,8,8<br/>开奖号码中三位：1个5，2个8 (顺序不限)，即中中三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的千位、百位、十位相同，且顺序不限，即为中奖。"
            },
            "131404": {
                "type": "select",
                "param": {"titles": {"zs_fs": "组三"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_fold", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：5,8,8<br/>开奖号码中三位：1个5，2个8 (顺序不限)，即中中三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的千位、百位、十位相同，且顺序不限，即为中奖。"
            },
            "131405": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。",
                "example": "投注方案：2,5,8<br/>开奖号码中三位：1个2、1个5、1个8 (顺序不限)，即中中三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的千位、百位、十位相同，顺序不限，即为中奖。"
            },
            "131406": {
                "type": "select",
                "param": {"titles": {"zl_fs": "组六"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3},
                "explain": "从0-9中任意选择3个或3个以上号码。",
                "example": "投注方案：2,5,8<br/>开奖号码中三位：1个2、1个5、1个8 (顺序不限)，即中中三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的千位、百位、十位相同，顺序不限，即为中奖。"
            },
            "131408": {
                "type": "select",
                "param": {"titles": {"zhi": "和值"}, "begin": 0, "end": 27, "row_num_count": 14, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zhi_san", "num_separator": "$"},
                "explain": "从0-27中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码中三位：001,010,100,即中中三直选。",
                "help": "所选数值等于开奖号码的千位、百位、十位三个数字相加之和，即为中奖。"
            },
            "131431": {
                "type": "select",
                "param": {
                    "titles": {"qw": "千", "bw": "百", "sw": "十"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从千位、百位、十位各选一个号码组成三注。",
                "example": "投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。",
                "help": "从千位、百位、十位中至少各选择一个号码组成1-3星的组合共三注，当百位号码与开奖号码相同，则中1个3等奖；如果百位与千位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。"
            },
            "131432": {
                "type": "select",
                "param": {"titles": {"zhi": "跨度"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "kd_san", "num_separator": ","},
                "explain": "从0-9中选择一个以上号码。",
                "example": "投注方案：跨度8<br/>开奖号码中间三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中中三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中中三直选。",
                "help": "所选数值等于开奖号码的中间3位最大与最小数字相减之差，即为中奖。"
            },
            "131433": {
                "type": "select",
                "param": {"titles": {"zx": "包胆"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_count_fold", "bet": "54", "num_separator": "$"},
                "explain": "从0-9中任意选择一个号码。",
                "example": "投注方案：包胆3<br/>开奖号码中三位：(1)出现3xx或者33x,即中中三组三；(2)出现3xy，即中中三组六。",
                "help": "从0-9中任意选择1个包胆号码，开奖号码的千位、百位、十位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。"
            },
            "131439": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 26, "row_num_count": 13, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zu_san", "num_separator": "$"},
                "explain": "从1-26中任意选择一个或一个以上号码。",
                "example": "投注方案：和值3<br/>开奖号码中三位：(1)开出003号码，顺序不限，即中中三组三；(2)开出012号码，顺序不限，即中中三组六。",
                "help": "所选数值等于开奖号码千位、百位、十位三个数字相加之和(不含豹子号)，即为中奖。"
            },
            "132531": {
                "type": "select",
                "param": {
                    "titles": {"bw": "百", "sw": "十", "gw": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从千位、百位、十位各选一个号码组成三注。",
                "example": "投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。",
                "help": "从千位、百位、十位中至少各选择一个号码组成1-3星的组合共三注，当个位号码与开奖号码相同，则中1个3等奖；如果个位与十位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。"
            },
            "150065": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 3},
                "explain": "手动输入号码，至少输入1个三位数号码。",
                "example": "投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码后三位包括：(1)0,0,1，顺序不限，即中得中三组三；或者(2)1,2,3，顺序不限，即中得中三组六。",
                "help": "手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的千位、百位、十位符合后三组三或组六均为中奖。"
            },
            "title": "中三",
            "row": {
                "中三直选": ["131402", "131401", "131431", "131408", "131432"],
                "中三组选": ["131404", "131403", "131406", "131405", "150065", "131439", "131433"]
            }
        }, {
            "2": {
                "type": "select",
                "param": {
                    "titles": {"bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从百位、十位、个位各选一个号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中后三直选。",
                "help": "从百位、十位、个位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。"
            },
            "3": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 0},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "投注方案：345<br/>开奖号码：345，即中后三直选。",
                "help": "手动输入一个3位数号码组成一注，所选号码的百位、十位、个位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "4": {
                "type": "select",
                "param": {"titles": {"zs_fs": "组三"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_fold", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：5,8,8<br/>开奖号码后三位：1个5，2个8 (顺序不限)，即中后三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的百位、十位、个位相同，且顺序不限，即为中奖。"
            },
            "5": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 4},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字中必须有二个数字相同）。",
                "example": "投注方案：5,8,8<br/>开奖号码后三位：1个5，2个8 (顺序不限)，即中后三组三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的百位、十位、个位相同，且顺序不限，即为中奖。"
            },
            "6": {
                "type": "select",
                "param": {"titles": {"zl_fs": "组六"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3},
                "explain": "从0-9中任意选择3个或3个以上号码。",
                "example": "投注方案：2,5,8<br/>开奖号码后三位：1个2、1个5、1个8 (顺序不限)，即中后三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。"
            },
            "7": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。",
                "example": "投注方案：2,5,8<br/>开奖号码后三位：1个2、1个5、1个8 (顺序不限)，即中后三组六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。"
            },
            "8": {
                "type": "select",
                "param": {"titles": {"zhi": "和值"}, "begin": 0, "end": 27, "row_num_count": 14, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zhi_san", "num_separator": "$"},
                "explain": "从0-27中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码后三位：001,010,100,即中后三直选。",
                "help": "所选数值等于开奖号码的百位、十位、个位三个数字相加之和，即为中奖。"
            },
            "132407": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 3},
                "explain": "手动输入号码，至少输入1个三位数号码。",
                "example": "投注方案：分別投注(0,0,1),以及(1,2,3)<br/>开奖号码后三位包括：(1)0,0,1，顺序不限，即中得后三组三；或者(2)1,2,3，顺序不限，即中得后三组六。",
                "help": "手动输入一个3位数号码组成一注(不含豹子号)，开奖号码的百位、十位、个位符合后三组三或组六均为中奖。"
            },
            "132531": {
                "type": "select",
                "param": {
                    "titles": {"bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_group"},
                "explain": "从百位、十位、个位各选一个号码组成三注。",
                "example": "投注方案：<br/>购买：6+7+8，该票共6元，由以下3注：678(三星)、78(二星)、8(一星)构成<br/>开奖号码：678，即可中三星、二星、一星各1注。",
                "help": "从百位、十位、个位中至少各选择一个号码组成1-3星的组合共三注，当个位号码与开奖号码相同，则中1个3等奖；如果个位与十位号码与开奖号码相同，则中1个3等奖以及1个2等奖，依此类推，最高可中3个奖。"
            },
            "132532": {
                "type": "select",
                "param": {"titles": {"zhi": "跨度"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "kd_san", "num_separator": ","},
                "explain": "从0-9中选择一个以上号码。",
                "example": "投注方案：跨度8<br/>开奖号码后三位：(1)开出的三个数字包括0,8,x，其中x≠9，即可中后三直选;(2)开出的三个数字包括1,9,x，其中x≠0，即可中后三直选。",
                "help": "所选数值等于开奖号码的后3位最大与最小数字相减之差，即为中奖。"
            },
            "132533": {
                "type": "select",
                "param": {"titles": {"zx": "包胆"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_count_fold", "bet": "54", "num_separator": "$"},
                "explain": "从0-9中任意选择一个号码。",
                "example": "投注方案：包胆3<br/>开奖号码后三位：(1)出现3xx或者33x,即中后三组三；(2)出现3xy，即中后三组六。",
                "help": "从0-9中任意选择1个包胆号码，开奖号码的百位、十位、个位中任意1位与所选包胆号码相同(不含豹子号)，即为中奖。"
            },
            "132539": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 26, "row_num_count": 13, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zu_san", "num_separator": "$"},
                "explain": "从1-26中任意选择一个或一个以上号码。",
                "example": "投注方案：和值3<br/>开奖号码后三位：(1)开出003号码，顺序不限，即中后三组三；(2)开出012号码，顺序不限，即中后三组六。",
                "help": "所选数值等于开奖号码百位、十位、个位三个数字相加之和(不含豹子号)，即为中奖。"
            },
            "title": "后三",
            "row": {
                "后三直选": ["2", "3", "132531", "8", "132532"],
                "后三组选": ["4", "5", "6", "7", "132407", "132539", "132533"]
            },
            "hs_hz_ws": {
                "type": "select",
                "param": {"titles": {"hz_ws": "和值尾数"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从0-9中任意选择一个或一个以上号码。",
                "example": "投注方案：和值尾数8<br/>开奖号码：后三位和值尾数为8，即中得和值尾数。",
                "help": "所选数值等于开奖号码的百位、十位、个位三个数字相加之和的尾数，即为中奖。"
            },
            "hs_ts": {
                "type": "select",
                "param": {"titles": {"tsh": "特殊号"}, "cs": "tsh", "selector": 0},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "选择一个号码形态。",
                "example": "投注方案：豹子<br/>开奖号码后三位：三个数字全部相同，即中得豹子。<br/>投注方案：顺子<br/>开奖号码后三位：为连续数字，例如678，即中得顺子。<br/>投注方案：对子<br/>开奖号码后三位：3个数字中有2个数字相同，即中得对子。",
                "help": "所选的号码特殊属性和开奖号码后3位的属性一致，即为中奖。其中：1.顺子号的个、十、百位不分顺序(特别号码：019、089也是顺子号)；2.对子号指的是开奖号码的后三位当中，任意2位数字相同的三位数号码。"
            }
        }, {
            "10": {
                "type": "select",
                "param": {"titles": {"ww": "万", "qw": "千"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位各选一个号码组成一注。",
                "example": "投注方案：58<br/>开奖号码前二位：58，即中前二直选。",
                "help": "从万位、千位中选择一个2位数号码组成一注，所选号码与开奖号码的前2位相同，且顺序一致，即为中奖。"
            },
            "11": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 0},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br/>开奖号码前二位：58，即中前二直选。",
                "help": "手动输入一个2位数号码组成一注，所选号码的万位、千位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "120203": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1},
                "explain": "手动输入号码，至少输入1个二位数号码。",
                "example": "投注方案：5,8<br/>开奖号码前二位：85 或58(顺序不限，不含对子号)，即中前二组选。",
                "help": "手动输入一个2位数号码组成一注，所选号码的万位、千位与开奖号码相同，顺序不限（不含对子号），即为中奖。"
            },
            "120204": {
                "type": "select",
                "param": {"titles": {"zx": "组选"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：5,8<br/>开奖号码前二位：85 或58(顺序不限，不含对子号)，即中前二组选。",
                "help": "从0-9中选2个号码组成一注，所选号码与开奖号码的万位、千位相同，顺序不限（不含对子号），即中奖。"
            },
            "120232": {
                "type": "select",
                "param": {"titles": {"zhi": "跨度"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "kd_er", "num_separator": ","},
                "explain": "从0-9中选择一个或一个以上号码。",
                "example": "投注方案：跨度9<br/>开奖号码为9,0,-,-,-或0,9,-,-,-，即中前二直选。",
                "help": "所选数值等于开奖号码的前2位最大与最小数字相减之差，即为中奖。"
            },
            "120233": {
                "type": "select",
                "param": {"titles": {"zx": "包胆"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_count_fold", "bet": 9, "num_separator": "$"},
                "explain": "从0-9中任意选择一个号码。",
                "example": "投注方案：包胆号码8<br/>开奖号码前二位：出现1个8（不包括2个8），即中前二组选。",
                "help": "从0-9中任意选择1个包胆号码，开奖号码的万位、千位中任意1位包含所选的包胆号码相同（不含对子号），即为中奖。"
            },
            "120238": {
                "type": "select",
                "param": {"titles": {"zhi": "和值"}, "begin": 0, "end": 18, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "zhi_er", "num_separator": "$"},
                "explain": "从0-18中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码前二位：01,10，即中前二直选。",
                "help": "所选数值等于开奖号码的万位、千位二个数字相加之和，即为中奖。"
            },
            "120239": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 17, "row_num_count": 9, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "zu_er", "num_separator": "$"},
                "explain": "从1-17中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码前二位：10或01 (顺序不限，不含对子号)，即中前二组选。",
                "help": "所选数值等于开奖号码的万位、千位二个数字相加之和（不含对子号），即为中奖。"
            },
            "title": "前二",
            "row": {"前二直选": ["10", "11", "120238", "120232"], "前二组选": ["120204", "120203", "120239", "120233"]}
        }, {
            "12": {
                "type": "select",
                "param": {"titles": {"sw": "十", "ge": "个位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从十位、个位各选一个号码组成一注。",
                "example": "投注方案：58<br/>开奖号码后二位：58，即中后二直选。",
                "help": "从十位、个位中选择一个2位数号码组成一注，所选号码与开奖号码的十位、个位相同，且顺序一致，即为中奖。"
            },
            "13": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 0},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br/>开奖号码后二位：58，即中后二直选。",
                "help": "手动输入一个2位数号码组成一注，所选号码的十位、个位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "14": {
                "type": "select",
                "param": {"titles": {"zx": "组选"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：5,8<br/>开奖号码后二位：85 或58 (顺序不限，不含对子号)，即中后二组选。",
                "help": "从0-9中选2个号码组成一注，所选号码与开奖号码的十位、个位相同，顺序不限（不含对子号），即为中奖。"
            },
            "15": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1},
                "explain": "手动输入号码，至少输入1个二位数号码。",
                "example": "投注方案：5,8<br/>开奖号码后二位：85 或58 (顺序不限，不含对子号)，即中后二组选。",
                "help": "手动输入一个2位数号码组成一注，所选号码的十位、个位与开奖号码相同，顺序不限（不含对子号），即为中奖。"
            },
            "123532": {
                "type": "select",
                "param": {"titles": {"zhi": "跨度"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "kd_er", "num_separator": ","},
                "explain": "从0-9中选择一个或一个以上号码。",
                "example": "投注方案：跨度9<br/>开奖号码为-,-,-,9,0或-,-,-,0,9，即中后二直选。",
                "help": "所选数值等于开奖号码的后2位最大与最小数字相减之差，即为中奖。"
            },
            "123533": {
                "type": "select",
                "param": {"titles": {"zx": "包胆"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_count_fold", "bet": 9, "num_separator": "$"},
                "explain": "从0-9中任意选择一个号码。",
                "example": "投注方案：包胆号码8<br/>开奖号码后二位：出现1个8（不包括2个8），即中后二组选。",
                "help": "从0-9中任意选择1个包胆号码，开奖号码的十位、个位中任意1位包含所选的包胆号码相同（不含对子号），即为中奖。"
            },
            "123538": {
                "type": "select",
                "param": {"titles": {"zhi": "和值"}, "begin": 0, "end": 18, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "zhi_er", "num_separator": "$"},
                "explain": "从0-18中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码后二位：01,10，即中后二直选。",
                "help": "所选数值等于开奖号码的十位、个位二个数字相加之和，即为中奖。"
            },
            "123539": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 17, "row_num_count": 9, "selector": 2},
                "calculate": {"method": "formula_value_add", "value": "zu_er", "num_separator": "$"},
                "explain": "从1-17中任意选择一个或一个以上号码。",
                "example": "投注方案：和值1<br/>开奖号码后二位：10或01(顺序不限，不含对子号)，即中后二组选。",
                "help": "所选数值等于开奖号码的十位、个位二个数字相加之和（不含对子号），即为中奖。"
            },
            "title": "后二",
            "row": {"后二直选": ["12", "13", "123538", "123532"], "后二组选": ["14", "15", "123539", "123533"]}
        }, {
            "9": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_count"},
                "explain": "从万位、千位、百位、十位、个位任意位置上选择1个或一个以上号码。",
                "example": "投注方案：万位 1<br>开奖号码：万位 1，即中定位胆万位。",
                "help": "从万位、千位、百位、十位、个位任意位置上至少选择1个以上号码，所选号码与相同位置上的开奖号码一致，即为中奖。"
            }, "title": "定位胆", "row": {"定位胆": ["9"]}
        }, {
            "1": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择1个以上号码。",
                "example": "投注方案：1<br/>开奖号码后三位：至少出现1个1，即中后三一码不定位。",
                "help": "从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的百位、十位、个位中包含所选号码，即为中奖。"
            },
            "19": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择1个以上号码。",
                "example": "投注方案：1<br/>开奖号码前三位：至少出现1个1，即中前三一码不定位。",
                "help": "从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的万位、千位、百位中包含所选号码，即为中奖。"
            },
            "130352": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个以上号码。",
                "example": "投注方案：1,2<br/>开奖号码前三位：至少出现1和2各1个，即中前三二码不定位。",
                "help": "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的万位、千位、百位中同时包含所选的2个号码，即为中奖。"
            },
            "131409": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择1个以上号码。",
                "example": "投注方案：1<br/>开奖号码前三位：至少出现1个1，即中三一码不定位。",
                "help": "从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的千位、百位、十位中包含所选号码，即为中奖。"
            },
            "131452": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个以上号码。",
                "example": "投注方案：1,2<br/>开奖号码中间三位：至少出现1和2各1个，即中中三二码不定位。",
                "help": "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的千位、百位、十位中同时包含所选的2个号码，即为中奖。"
            },
            "132552": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个以上号码。",
                "example": "投注方案：1,2<br/>开奖号码后三位：至少出现1和2各1个，即中后三二码不定位。",
                "help": "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的百位、十位、个位中同时包含所选的2个号码，即为中奖。"
            },
            "141551": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从0-9中任意选择1个以上号码。",
                "example": "投注方案：1<br/>开奖号码后四位：至少出现1个1，即中四星一码不定位。",
                "help": "从0-9中选择1个号码，每注由1个号码组成，只要开奖号码的千位、百位、十位、个位中包含所选号码，即为中奖。"
            },
            "141552": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个以上号码。",
                "example": "投注方案：1,2<br/>开奖号码后四位：至少出现1和2各1个，即中四星二码不定位。",
                "help": "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的千位、百位、十位、个位中同时包含所选的2个号码，即为中奖。"
            },
            "150052": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个以上号码。",
                "example": "投注方案：1,2<br/>开奖号码：至少出现1和2各1个，即中五星二码不定位。",
                "help": "从0-9中选择2个号码，每注由2个不同的号码组成，开奖号码的万位、千位、百位、十位、个位中同时包含所选的2个号码，即为中奖。"
            },
            "150053": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3},
                "explain": "从0-9中任意选择3个以上号码。",
                "example": "投注方案：1,2,3<br/>开奖号码：至少出现1、2、3各1个，即中五星三码不定位。",
                "help": "从0-9中选择3个号码，每注由3个不同的号码组成，开奖号码的万位、千位、百位、十位、个位中同时包含所选的3个号码，即为中奖。"
            },
            "title": "不定位",
            "row": {
                "三星": ["19", "131409", "1", "130352", "131452", "132552"],
                "四星": ["141551", "141552"],
                "五星": ["150052", "150053"]
            }
        }, {
            "16": {
                "type": "select",
                "param": {"titles": {"sw": "十", "ge": "个"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从十位、个位中的“大、小、单、双”中至少各选一个组成一注。",
                "example": "投注方案：大单<br/>开奖号码十位与个位：大单，即中后二大小单双。",
                "help": "对十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "120205": {
                "type": "select",
                "param": {"titles": {"ww": "万", "qw": "千"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位中的“大、小、单、双”中至少各选一个组成一注。",
                "example": "投注方案：小双<br/>开奖号码万位与千位：小双，即中前二大小单双。",
                "help": "对万位、千位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "130337": {
                "type": "select",
                "param": {"titles": {"ww": "万", "qw": "千", "bw": "百"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从万位、千位、百位中的“大、小、单、双”中至少各选一个组成一注。",
                "example": "投注方案：小双小<br/>开奖号码万、千、百位：小双小，即中前三大小单双。",
                "help": "对万位、千位和百位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "132537": {
                "type": "select",
                "param": {"titles": {"bw": "百", "sw": "十", "ge": "个"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从百位、十位、个位中的“大、小、单、双”中至少各选一个组成一注。",
                "example": "投注方案：大单大<br/>开奖号码百、十、个位：大单大，即中后三大小单双。",
                "help": "对百位、十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "title": "大小单双",
            "row": {"大小单双": ["120205", "16", "130337", "132537"]}
        }, {
            "120001": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 2, "check_type": 0, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择两个位置，至少手动输入一个两位数号码组成一注。",
                "example": "投注方案：勾选位置千位、个位，输入号码12<br/>开奖号码：*1**2，即中任二直选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选两个位置，手动输入一个两位数号码组成一注，所选2个位置和输入的号码都与开奖号码相同，且顺序一致，即为中奖。"
            },
            "120002": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_rx_zhi_fs", "base_len": 2},
                "explain": "从万位、千位、百位、十位、个位中至少两位上各选一个号码组成一注。",
                "example": "投注方案：万位1，十位2<br/>开奖号码：1**2*，即中任二直选。",
                "help": "从万位、千位、百位、十位、个位中任意选择两个位，在这两个位上至少各选1个号码组成一注，所选2个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。"
            },
            "120003": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 2, "check_type": 1, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择两个位置，至少手动输入一个两位数号码组成一注。",
                "example": "投注方案：勾选位置万位、个位，输入号码79<br/>开奖号码：9***7 或 7***9，均中任二组选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选两个位置，然后输入两个号码组成一注，所选2个位置的开奖号码与输入号码一致，顺序不限，即为中奖。"
            },
            "120004": {
                "type": "select",
                "param": {
                    "titles": {"zx": "组选"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {"method": "formula_rx_zu_fs", "base_len": 2, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择两个位置，号码区至少选择两个号码组成一注。",
                "example": "投注方案：勾选位置万位、个位，选择号码79<br/>开奖号码：9***7 或 7***9，均中任二组选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选两个位置，然后从0-9中选择两个号码组成一注，所选2个位置的开奖号码与所选号码一致，顺序不限，即为中奖。"
            },
            "120038": {
                "type": "select",
                "param": {
                    "titles": {"zhi": "和值"},
                    "begin": 0,
                    "end": 18,
                    "row_num_count": 10,
                    "selector": 0,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_value_add",
                    "base_len": 2,
                    "value": "zhi_er",
                    "num_separator": "$",
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择两个位置，至少选择一个和值号码组成一注。",
                "example": "投注方案：勾选位置千位、个位，选择和值15<br/>开奖号码：*8**7，即中任二直选和值。",
                "help": "从万位、千位、百位、十位、个位中任意勾选两个位置，然后选择一个和值，所选2个位置的开奖号码相加之和与所选和值一致，且顺序一致，即为中奖。"
            },
            "120039": {
                "type": "select",
                "param": {
                    "titles": {"zx": "和值"},
                    "begin": 1,
                    "end": 17,
                    "row_num_count": 10,
                    "selector": 0,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_value_add",
                    "value": "zu_er",
                    "base_len": 2,
                    "num_separator": "$",
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择两个位置，至少选择一个和值号码组成一注。",
                "example": "投注方案：勾选位置千位、个位，选择和值6<br/>开奖号码：*4**2 或 *2**4，均中任二组选和值",
                "help": "从万位、千位、百位、十位、个位中任意勾选两个位置，然后选择一个和值，所选2个位置的开奖号码相加之和与所选和值一致，顺序不限，即为中奖。"
            },
            "title": "任选二",
            "row": {"任二直选": ["120002", "120001", "120038"], "任二组选": ["120004", "120003", "120039"]}
        }, {
            "130001": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 3, "check_type": 0, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输入一个三位数号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、个位，输入号码152<br/>开奖号码：15**2，即中任三直选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，手动输入一个三位数号码组成一注，所选三个位置上的开奖号码与输入号码完全相同，且顺序一致，即为中奖。"
            },
            "130002": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_rx_zhi_fs", "base_len": 3},
                "explain": "从万位、千位、百位、十位、个位中至少三位上各选一个号码组成一注。",
                "example": "投注方案：万位1、千位5、十位2<br/>开奖号码：15*2*，即中任三直选。",
                "help": "从万位、千位、百位、十位、个位中任意选择三个位，在这三个位上至少各选1个号码组成一注，所选3个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。"
            },
            "130030": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 3, "check_type": 3, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，手动至少输入三个号码组成一注（不包含豹子号）。",
                "example": "投注方案：勾选位置千位、百位、个位，分別投注(0,0,1),以及(1,2,3)<br/>开奖号码：*00*1，顺序不限，即中任三组三；或者(2)*21*3，顺序不限，即中任三组六。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入三个号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。"
            },
            "130038": {
                "type": "select",
                "param": {
                    "titles": {"zx_hz": "和值"},
                    "begin": 0,
                    "end": 27,
                    "row_num_count": 14,
                    "selector": 0,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_value_add",
                    "value": "zhi_san",
                    "base_len": 3,
                    "num_separator": "$",
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，至少选择一个和值号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、个位，选择和值8<br/>开奖号码：22**4，即中任三直选和值。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后选择一个和值，所选3个位置的开奖号码相加之和与所选和值一致，且顺序一致，即为中奖。"
            },
            "130039": {
                "type": "select",
                "param": {
                    "titles": {"zx_hz": "和值"},
                    "begin": 1,
                    "end": 26,
                    "row_num_count": 13,
                    "selector": 0,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_value_add",
                    "value": "zu_san",
                    "base_len": 3,
                    "num_separator": "$",
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，至少选择一个和值号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、个位；选择和值8<br/>开奖号码：13**4 顺序不限，即中任三直选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后选择一个和值，所选3个位置的开奖号码相加之和与所选和值一致，顺序不限，即为中奖。"
            },
            "130041": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 3, "check_type": 2, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输入两个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、个位，输入号码779<br/>开奖号码：97**7 或 79**7，均中任三组三。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入两个号相同号码和一个不同号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。"
            },
            "130042": {
                "type": "select",
                "param": {
                    "titles": {"zs_fs": "组三"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {"method": "formula_rx_zs_fs", "num_len": 2, "base_len": 3, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，号码区至少选择两个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、个位，选择号码18<br/>开奖号码：11**8 或 18**1，均中任三组三。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后从0-9中选择两个号码组成一注，所选3个位置的开奖号码与所选号码一致，顺序不限，即为中奖。"
            },
            "130043": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 3, "check_type": 1, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，至少手动输三个号码组成一注。",
                "example": "投注方案：勾选位置万位、百位、个位，选择号码159<br/>开奖号码：1*5*9 或 9*1*5，即中任三组六。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后输入三个各不相同的3个号码组成一注，所选3个位置的开奖号码与输入号码一致，顺序不限，即为中奖。"
            },
            "130044": {
                "type": "select",
                "param": {
                    "titles": {"zl_fs": "组六"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {"method": "formula_rx_zu_fs", "base_len": 3, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择三个位置，号码区至少选择三个号码组成一注。",
                "example": "投注方案：勾选位置万位、百位、个位，选择号码159<br/>开奖号码：1*5*9 或 9*1*5，均中任三组六。",
                "help": "从万位、千位、百位、十位、个位中任意勾选三个位置，然后从0-9中选择三个号码组成一注，所选3个位置的开奖号码与所选号码一致，顺序不限，即为中奖。"
            },
            "title": "任选三",
            "row": {
                "任三直选": ["130002", "130001", "130038"],
                "任三组选": ["130042", "130041", "130044", "130043", "130030", "130039"]
            }
        }, {
            "140001": {
                "type": "input",
                "param": {"num_location": "checkbox"},
                "calculate": {"base_len": 4, "check_type": 0, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择四个位置，至少手动输入一个四位数号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、十位、个位，输入号码1524<br/>开奖号码：15*24，即中任四直选。",
                "help": "从万位、千位、百位、十位、个位中任意勾选四个位置，手动输入一个四位数号码组成一注，所选4个位置上的开奖号码与输入号码完全相同，且顺序一致，即为中奖。"
            },
            "140002": {
                "type": "select",
                "param": {
                    "titles": {"ww": "万", "qw": "千", "bw": "百", "sw": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_rx_zhi_fs", "base_len": 4},
                "explain": "从万位、千位、百位、十位、个位中至少四位上各选一个号码组成一注。",
                "example": "投注方案：万位1、千位5、百位0、十位2<br/>开奖号码：1502*，即中任四直选。",
                "help": "从万位、千位、百位、十位、个位中任意选择四个位置，在这四个位上至少各选1个号码组成一注，所选4个位置上的开奖号码与所选号码完全相同，且顺序一致，即为中奖。"
            },
            "140041": {
                "type": "select",
                "param": {
                    "titles": {"zx": "组选24"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {"method": "formula_rx_zu_fs", "base_len": 4, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择四个位置，号码区至少选择四个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、十位、个位，选择号码1234<br/>开奖号码：12*34 或 13*24，均中任四组选24。",
                "help": "从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择四个号码组成一注，所选4个位置的开奖号码与所选号码一致，顺序不限，即为中奖。"
            },
            "140042": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_zx",
                    "oneRow": 0,
                    "moreRow": 1,
                    "num_len": 2,
                    "base_len": 4,
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择四个位置，从“二重号”选择一个号码，“单号”中选择两个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、十位、个位，选择二重号：8，单号：0、6<br/>开奖号码：88*06 或 08*68，均中任四组选12。",
                "help": "从万位、千位、百位、十位、个位中任意勾选四个位置，然后选择1个二重号码和2个单号号码组成一注，所选4个位置的开奖号码中包含与所选号码，且所选二重号码在所选4个位置的开奖号码中出现了2次，即为中奖。"
            },
            "140043": {
                "type": "select",
                "param": {
                    "titles": {"er": "二重号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {"method": "formula_rx_zl", "num_len": 2, "base_len": 4, "location": "zx"},
                "explain": "从万位、千位、百位、十位、个位中至少选择四个位置，从“二重号”中选择两个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、十位、个位，选择二重号：6、8<br/>开奖号码：66*88 或 68*68，均中任四组选6。",
                "help": "从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择2个二重号组成一注，所选4个位置的开奖号码与所选号码一致，并且所选的2个二重号码在所选4个位置的开奖号码中分别出现了2次，顺序不限，即为中奖。"
            },
            "140044": {
                "type": "select",
                "param": {
                    "titles": {"san": "三重号", "dan": "单号"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2,
                    "num_location": "checkbox"
                },
                "calculate": {
                    "method": "formula_rx_zx",
                    "oneRow": 0,
                    "moreRow": 1,
                    "num_len": 1,
                    "base_len": 4,
                    "location": "zx"
                },
                "explain": "从万位、千位、百位、十位、个位中至少选择四个位置，从“三重号”选择一个号码，“单号”中选择一个号码组成一注。",
                "example": "投注方案：勾选位置万位、千位、十位、个位，选择三重号：8，单号：0<br/>开奖号码：88*80 或 80*88，均中任四组选4。",
                "help": "从万位、千位、百位、十位、个位中任意勾选四个位置，然后从0-9中选择1个三重号和1个单号组成一注，所选4个位置的开奖号码与所选号码一致，并且所选三重号码在所选4个位置的开奖号码中出现了3次，顺序不限，即为中奖。"
            },
            "title": "任选四",
            "row": {"任四直选": ["140002", "140001"], "任四组选": ["140041", "140042", "140043", "140044"]}
        }, {"title": ""}],
    '2': [
        {
            "24": {
                "type": "select",
                "param": {
                    "titles": {"bai": "百", "shi": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从百位、十位、个位各选一个号码组成一注。",
                "example": "投注方案：345<br>开奖号码：345，即中后三直选。",
                "help": "从百味、十位、个位中选择一个3位数号码组成一注，所选号码与开奖号码后3位相同，且顺序一致，即为中奖。"
            },
            "25": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 0},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "投注方案：345<br>开奖号码：345，即中后三直选。",
                "help": "手动输入一个3位数号码组成一注，所选号码与开奖号码的百味、十位、个位相同，且顺序一致，即为中奖。"
            },
            "26": {
                "type": "select",
                "param": {"titles": {"zs_fs": "组三"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_fold", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：588<br>开奖号码：后三位588（顺序不限），即中后三组选三。",
                "help": "从0-9中选择2个数字组成两注，所选号码与开奖号码的百味、十位、个位相同，且顺序不限，即为中奖。"
            },
            "27": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 2},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字必须有两个数字相同）。",
                "example": "投注方案：001<br>开奖号码：后三位010（顺序不限），即中后三组选三。",
                "help": "手动输入一个3位数号码组成一注，三个数字中必须有两个数字相同，输入号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。"
            },
            "28": {
                "type": "select",
                "param": {"titles": {"zu": "组六"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3},
                "explain": "从0-9中任意选择3个或3个以上号码。",
                "example": "投注方案：258<br>开奖号码：后三位852（顺序不限），即中后三组选六。",
                "help": "从0-9中任意选择3个号码组成一注，所选号码与开奖号码的百味、十位、个位相同，顺序不限，即为中奖。"
            },
            "29": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1},
                "explain": "手动输入号码，至少输入1个三位数号码（三个数字完全不相同）。",
                "example": "投注方案：123<br>开奖号码：后三位321（顺序不限），即中后三组选六。",
                "help": "手动输入一个3位数号码组成一注，输入号码与开奖号码的百位、十位、个位相同，顺序不限，即为中奖。"
            },
            "37": {
                "type": "select",
                "param": {"titles": {"hz": "直选和值"}, "begin": 0, "end": 27, "row_num_count": 14, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zhi_san", "num_separator": "$"},
                "explain": "从0-27中任意选择1个或1个以上号码。",
                "example": "投注方案：和值1<br>开奖号码：后三位001,010,100，即中后三直选。",
                "help": "所选数值等于开奖号码的百位、十位、个位三个数字相加之和，即为中奖。"
            },
            "230007": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 3},
                "explain": "手动输入号码，至少输入1个三位数号码。",
                "example": "投注方案：001和123<br>开奖号码：后三位001（顺序不限）即中后三组选三，或者后三位312（顺序不限）即中后三组选六。",
                "help": "手动输入一个3位数号码组成一注（不含豹子号），开奖号码的百位、十位、个位符合后三组三或者组六均为中奖。"
            },
            "230008": {
                "type": "select",
                "param": {"titles": {"zx": "和值"}, "begin": 1, "end": 26, "row_num_count": 13, "selector": 0},
                "calculate": {"method": "formula_value_add", "value": "zu_san", "num_separator": "$"},
                "explain": "从1-26中任意选择1个或1个以上号码。",
                "example": "投注方案：和值3<br>开奖号码：后三位003（顺序不限）即中后三组选三，或者后三位012（顺序不限）即中后三组选六。",
                "help": "所选数值等于开奖号码的百位、十位、个位三个数字相加之和（非豹子号），即为中奖。"
            },
            "230031": {
                "type": "select",
                "param": {"titles": {"zero": "0", "one": "1", "two": "2"}, "cs": "fc_spice_012", "selector": 1},
                "calculate": {
                    "method": "formula_value_add",
                    "value": "fc_spice_012",
                    "num_separator": "$",
                    "group": "all_num"
                },
                "explain": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "example": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "help": "所选号码与开奖号码相同（且顺序一致）即中奖。"
            },
            "230032": {
                "type": "select",
                "param": {"titles": {"small": "小", "big": "大"}, "cs": "fc_spice_dx", "selector": 1},
                "calculate": {"method": "formula_count_fold", "bet": 125, "num_separator": "$", "group": "all_num"},
                "explain": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "example": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "help": "所选号码与开奖号码相同（且顺序一致）即中奖。"
            },
            "230033": {
                "type": "select",
                "param": {"titles": {"zhi": "质", "he": "合"}, "cs": "fc_spice_zh", "selector": 1},
                "calculate": {"method": "formula_count_fold", "bet": 125, "num_separator": "$", "group": "all_num"},
                "explain": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "example": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "help": "所选号码与开奖号码相同（且顺序一致）即中奖。"
            },
            "230034": {
                "type": "select",
                "param": {"titles": {"ji": "奇", "ou": "偶"}, "cs": "fc_spice_jo", "selector": 1},
                "calculate": {"method": "formula_count_fold", "bet": 125, "num_separator": "$", "group": "all_num"},
                "explain": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "example": "所选号码与开奖号码相同（且顺序一致）即中奖。",
                "help": "所选号码与开奖号码相同（且顺序一致）即中奖。"
            },
            "title": "三星",
            "row": {
                "三星直选": ["24", "25", "37"],
                "三星组选": ["26", "27", "28", "29", "230007", "230008"],
                "三星趣味": ["230031", "230032", "230033", "230034"]
            }
        }, {
            "31": {
                "type": "select",
                "param": {
                    "titles": {"bai": "百", "shi": "十位"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从百位、十位中至少各选1个号码组成一注。",
                "example": "投注方案：58<br>开奖号码：前二位58，即中前二直选。",
                "help": "从百味、十位中选择一个2位数号码组成一注，所选号码与开奖号码的前2位相同，且顺序一致，即为中奖。"
            },
            "32": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 0},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br>开奖号码：前二位58，即中前二直选。",
                "help": "手动输入一个2位数号码组成一注，输入号码的百味、十位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "35": {
                "type": "select",
                "param": {
                    "titles": {"shi": "十", "ge": "个"},
                    "begin": 0,
                    "end": 9,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从十位、个位中至少各选1个号码组成一注。",
                "example": "投注方案：58<br>开奖号码：后二位58，即中后二直选。",
                "help": "从十位、个位中选择一个2位数号码组成一注，所选号码与开奖号码的后2位相同，且顺序一致，即为中奖。"
            },
            "36": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 0},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br>开奖号码：后二位58，即中后二直选。",
                "help": "手动输入一个2位数号码组成一注，输入号码的十位、个位与开奖号码相同，且顺序一致，即为中奖。"
            },
            "220203": {
                "type": "select",
                "param": {"titles": {"zx": "组选"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：58<br>开奖号码：前二位85或者58（顺序不限，不含对子号），即中前二组选。",
                "help": "从0-9中选择2个数字组成一注，所选号码与开奖号码的百味、十位相同，顺序不限，即为中奖。"
            },
            "220204": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br>开奖号码：前二位85或者58（顺序不限，不含对子号），即中前二组选。",
                "help": "手动输入一个两位数号码组成一注，输入号码的百位、十位与开奖号码相同，顺序不限，即为中奖。"
            },
            "221303": {
                "type": "select",
                "param": {"titles": {"zx": "组选"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2},
                "explain": "从0-9中任意选择2个或2个以上号码。",
                "example": "投注方案：58<br>开奖号码：后二位85或者58（顺序不限，不含对子号），即中后二组选。",
                "help": "从0-9中选择2个数字组成一注，所选号码与开奖号码的十味、个位相同（不含对子号），顺序不限，即为中奖。"
            },
            "221304": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1},
                "explain": "手动输入号码，至少输入1个二位数号码组成一注。",
                "example": "投注方案：58<br>开奖号码：后二位85或者58（顺序不限，不含对子号），即中后二组选。",
                "help": "手动输入一个两位数号码组成一注，输入号码的十位、个位与开奖号码相同（不含对子号），顺序不限，即为中奖。"
            },
            "title": "二星",
            "row": {"二星直选": ["31", "32", "35", "36"], "二星组选": ["220203", "220204", "221303", "221304"]}
        }, {
            "33": {
                "type": "select",
                "param": {"titles": {"bdw": "不定位"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "从01-11中共11个号码中选择1个号码，每注由1个号码组成",
                "example": "只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。",
                "help": "从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。"
            }, "title": "不定位", "row": {"不定位": ["33"]}
        }, {
            "220205": {
                "type": "select",
                "param": {"titles": {"bai": "百", "shi": "十位"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从百位、十位中的“大、小、单、双”中至少各选一个组成。",
                "example": "投注方案：小双<br>开奖号码：百位与十位“小双”，即中前二大小单双。",
                "help": "对百位、十位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "221305": {
                "type": "select",
                "param": {"titles": {"shi": "十", "ge": "个"}, "cs": "dx_ds", "selector": 1},
                "calculate": {"method": "formula_num_multiply"},
                "explain": "从十位、个位中的“大、小、单、双”中至少各选一个组成。",
                "example": "投注方案：大单<br>开奖号码：十位与个位“大单”，即中后二大小单双。",
                "help": "对十位和个位的“大（56789）小（01234）、单（13579）双（02468）”形态进行购买，所选号码的位置、形态与开奖号码的位置、形态相同，即为中奖。"
            },
            "title": "大小单双",
            "row": {"大小单双": ["220205", "221305"]}
        }, {
            "30": {
                "type": "select",
                "param": {"titles": {"bai": "百"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "前一直选",
                "example": "前一直选",
                "help": "前一直选"
            }, "title": "前一直选", "row": {"前一直选": ["30"]}
        }, {
            "34": {
                "type": "select",
                "param": {"titles": {"ge": "个"}, "begin": 0, "end": 9, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count"},
                "explain": "后一直选",
                "example": "后一直选",
                "help": "后一直选"
            }, "title": "后一直选", "row": {"后一直选": ["34"]}
        }],
    '3': [
        {
            "44": {
                "type": "select",
                "param": {
                    "titles": {"yi": "第一位", "er": "第二位", "san": "第三位"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2
                },
                "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
                "explain": "从第一位、第二位、第三位中至少各选择1个号码。",
                "example": "如：选择01，02，03，开奖号码顺序为01，02，03 * *，即为中奖。",
                "help": "从01-11共11个号码中选择3个不重复的号码组成一注，所选号码与当期顺序摇出的5个号码中的前3个号码相同，且顺序一致，即为中奖。"
            },
            "45": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "如：手动输入01 02 03，开奖号码为是01 02 03 * *，即为中奖。",
                "help": "手动输入3个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前3个号码相同，且顺序一致，即为中奖。"
            },
            "46": {
                "type": "select",
                "param": {"titles": {"zu": "组选"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择3个或3个以上号码。",
                "example": "如：选择01 02 03（展开为01 02 03 * *，01 03 02 * *，02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为03 01 02  如：，即为中奖。",
                "help": "从01-11中共11个号码中选择3个号码，所选号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。"
            },
            "47": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "base_len": 2,
                    "num_separator": ",",
                    "row_separator": "-",
                    "limit_row": 0,
                    "limit_rule": "no_repeat"
                },
                "explain": "从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。",
                "example": "如：选择胆码 01，选择拖码 02 06，开奖号码为 02 01 06 * *，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注。当期顺序摇出的5个号码中的前3个号码中同时包含所选的1个胆码和2个拖码，顺序不限，即为中奖。"
            },
            "330301": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，至少输入1个三位数号码组成一注。",
                "example": "如：手动输入01 02 03（展开为01 02 03 * *，01 03 02 * * , 02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为01 03 02 * *，即为中奖。",
                "help": "手动输入3个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。"
            },
            "title": "三码",
            "row": {"三码": ["44", "45", "46", "330301", "47"]}
        }, {
            "39": {
                "type": "select",
                "param": {
                    "titles": {"yi": "第一位", "er": "第二位"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2
                },
                "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
                "explain": "从第一位、第二位中至少各选择1个号码。",
                "example": " 如：选择01 02，开奖号码 01 02 * * *，即为中奖。",
                "help": "从01-11共11个号码中选择2个不重复的号码组成一注，所选号码与当期顺序摇出的5个号码中的前2个号码相同，且顺序一致，即中奖。"
            },
            "40": {
                "type": "select",
                "param": {"titles": {"zu": "组选"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择3个或3个以上号码。",
                "example": "如：选择01 02 03（展开为01 02 03 * *，01 03 02 * *，02 01 03 * *，02 03 01 * *，03 01 02 * *，03 02 01 * *），开奖号码为03 01 02  如：，即为中奖。",
                "help": "从01-11中共11个号码中选择3个号码，所选号码与当期顺序摇出的5个号码中的前3个号码相同，顺序不限，即为中奖。"
            },
            "41": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "base_len": 1,
                    "num_separator": ",",
                    "row_separator": "-",
                    "limit_row": 0,
                    "limit_rule": "no_repeat"
                },
                "explain": "从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。",
                "example": "如：选择胆码 01，选择拖码 02 06，开奖号码为 02 01 06 * *，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注。当期顺序摇出的5个号码中的前3个号码中同时包含所选的1个胆码和2个拖码，顺序不限，即为中奖。"
            },
            "320201": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，至少输入1个两位数号码组成一注。",
                "example": "如：手动输入01 02（展开为01 02 * * *, 02 01 * * *），开奖号码为01 02 * * *或02 01 * * *，即为中奖。",
                "help": "手动输入2个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前2个号码相同，顺序不限，即为中奖。"
            },
            "320202": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，至少输入1个两位数号码组成一注。",
                "example": "如：手动输入01 02，开奖号码为是01 02 * * *，即为中奖。",
                "help": "手动输入2个号码组成一注，所输入的号码与当期顺序摇出的5个号码中的前2个号码相同，且顺序一致，即为中奖。"
            },
            "title": "二码",
            "row": {"二码": ["39", "320202", "40", "320201", "41"]}
        }, {
            "38": {
                "type": "select",
                "param": {"titles": {"yi": "第一位"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择1个或1个以上号码。",
                "example": "如：选择01，开奖号码为01 * * * *,即为中奖。",
                "help": "从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位开奖号码包含所选号码，即为中奖。"
            }, "title": "一码", "row": {"一码": ["38"]}
        }, {
            "330303": {
                "type": "select",
                "param": {"titles": {"san": "前三位"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择1个或1个以上号码。",
                "example": "如：选择01，开奖号码为01 * * * *，* 01 * * *，* * 01 * *,即为中奖。",
                "help": "从01-11中共11个号码中选择1个号码，每注由1个号码组成，只要当期顺序摇出的第一位、第二位、第三位开奖号码中包含所选号码，即为中奖。"
            }, "title": "不定位", "row": {"不定位": ["330303"]}
        }, {
            "330304": {
                "type": "select",
                "param": {
                    "titles": {"yi": "第一位", "er": "第二位", "san": "第三位"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2
                },
                "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
                "explain": "从第一位，第二位，第三位任意位置上任意选择1个或1个以上号码。",
                "example": "如：万位上选择01，开奖号码为01 * * * *，即为中奖。<br/>如：千位上选择01，开奖号码为 * 01* * *，即为中奖。<br/>如：百位上选择01，开奖号码为 * * 01 * *，即为中奖。",
                "help": "从第一位，第二位，第三位任意1个位置或多个位置上选择1个号码，所选号码与相同位置上的开奖号码一致，即为中奖。"
            }, "title": "定位胆", "row": {"定位胆": ["330304"]}
        }, {
            "350008": {
                "type": "select",
                "param": {"titles": {"ding": "定单双"}, "cs": "eleven_five_dds", "selector": 0},
                "calculate": {"method": "formula_num_count", "num_separator": ","},
                "explain": "从不同的单双组合中任意选择1个或1个以上的组合。",
                "example": "如：选择5单0双，开奖号码01，03，05，07，09五个单数，即为中奖。",
                "help": "从5种单双个数组合中选择1种组合，当期开奖号码的单双个数与所选单双组合一致，即为中奖。"
            },
            "350009": {
                "type": "select",
                "param": {
                    "titles": {"yi": "猜中位"},
                    "begin": 3,
                    "end": 9,
                    "row_num_count": 7,
                    "selector": 2,
                    "value": "number"
                },
                "calculate": {"method": "formula_num_count", "num_separator": "$"},
                "explain": "从3-9中任意选择1个或1个以上数字。",
                "example": "如：选择8，开奖号码为11，04，09，05，08，按开奖号码的数字大小排列为04，05，08，09，11，中间数08，即为中奖。",
                "help": "从3-9中选择1个号码进行购买，所选号码与5个开奖号码按照大小顺序排列后的第3个号码相同，即为中奖。"
            },
            "title": "趣味型",
            "row": {"趣味型": ["350008", "350009"]}
        }, {
            "42": {
                "type": "select",
                "param": {"titles": {"er": "选二中二"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择2个或2个以上号码。",
                "example": "如：选择05 04，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择2个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "48": {
                "type": "select",
                "param": {"titles": {"san": "选三中三"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择3个或3个以上号码。",
                "example": "如：选择05 04 11，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择3个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "50": {
                "type": "select",
                "param": {"titles": {"si": "选四中四"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 4, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择4个或4个以上号码。",
                "example": "如：选择05 04 08 03，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择4个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "52": {
                "type": "select",
                "param": {"titles": {"wu": "选五中五"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 5, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择5个或5个以上号码。",
                "example": "如：选择05 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择5个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "55": {
                "type": "select",
                "param": {"titles": {"liu": "选六中五"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 6, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择6个或6个以上号码。",
                "example": "如：选择05 10 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择6个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "57": {
                "type": "select",
                "param": {"titles": {"qi": "选七中五"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 7, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择7个或7个以上号码。",
                "example": "如：选择05 04 10 11 03 08 09，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择7个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "59": {
                "type": "select",
                "param": {"titles": {"ba": "选八中五"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 8, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择8个或8个以上号码。",
                "example": "如：选择05 04 11 03 08 10 09 01，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择8个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "310005": {
                "type": "select",
                "param": {"titles": {"yi": "选一中一"}, "begin": 1, "end": 11, "row_num_count": 11, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 1, "num_separator": ",", "row_separator": "-"},
                "explain": "从01-11中任意选择1个或1个以上号码。",
                "example": "如：选择05，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11共11个号码中选择1个号码进行购买，只要当期顺序摇出的5个开奖号码中包含所选号码，即为中奖。"
            },
            "title": "任选复式",
            "row": {"任选复式": ["310005", "42", "48", "50", "52", "55", "57", "59"]}
        }, {
            "310006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 1, "check_type": 0, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入1个号码组成一注。",
                "example": "如：输入05，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入1个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "320006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入2个号码组成一注。",
                "example": "如：输入05 04，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入2个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "330006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入3个号码组成一注。",
                "example": "如：输入05 04 11，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入3个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "340006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 4, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入4个号码组成一注。",
                "example": "如：输入05 04 08 03，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入4个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "350006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 5, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入5个号码组成一注。",
                "example": "如：输入05 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入5个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "360006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 6, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入6个号码组成一注。",
                "example": "如：输入05 10 04 11 03 08，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入6个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "370006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 7, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入7个号码组成一注。",
                "example": "如：输入05 04 10 11 03 08 09，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入7个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "380006": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 8, "check_type": 1, "num_separator": " "},
                "explain": "手动输入号码，从01-11中任意输入8个号码组成一注。",
                "example": "如：输入05 04 11 03 08 10 09 01，开奖号码为08 04 11 05 03，即为中奖。",
                "help": "从01-11输入8个号码进行购买，只要当期顺序摇出的5个开奖号码中包含输入号码，即为中奖。"
            },
            "title": "任选单式",
            "row": {"任选单式": ["310006", "320006", "330006", "340006", "350006", "360006", "370006", "380006"]}
        }, {
            "43": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 1,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取2个及以上的号码进行投注，每注需至少包括1个胆码及1个拖码。",
                "example": "如：选择胆码 08，选择拖码 06，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和1个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和1个拖码，所选胆码必须全中，即为中奖。"
            },
            "49": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 2,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取3个及以上的号码进行投注，每注需至少包括1个胆码及2个拖码。",
                "example": "如：选择胆码 08，选择拖码 06 11，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和2个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和2个拖码，所选胆码必须全中，即为中奖。"
            },
            "51": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 3,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取4个及以上的号码进行投注，每注需至少包括1个胆码及3个拖码。",
                "example": "如：选择胆码 08，选择拖码 06 09 11，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和3个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和3个拖码，所选胆码必须全中，即为中奖。"
            },
            "53": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 4,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取5个及以上的号码进行投注，每注需至少包括1个胆码及4个拖码。",
                "example": "如：选择胆码 08，选择拖码 02 06 09 11，开奖号码为  06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和4个拖码组成一注，只要当期顺序摇出的5个开奖号码中同时包含所选的1个胆码和4个拖码，所选胆码必须全中，即为中奖。"
            },
            "56": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 5,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取6个及以上的号码进行投注，每注需至少包括1个胆码及5个拖码。",
                "example": "如：选择胆码 08，选择拖码 01 02 05 06 09 11，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和5个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。"
            },
            "58": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 6,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取7个及以上的号码进行投注，每注需至少包括1个胆码及6个拖码。",
                "example": "如：选择胆码 08，选择拖码 01 02 05 06 07 09 11，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和6个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。"
            },
            "60": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 11,
                    "row_num_count": 11,
                    "selector": 2,
                    "selector_index": {"1": 1}
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 7,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从01-11中，选取8个及以上的号码进行投注，每注需至少包括1个胆码及7个拖码。",
                "example": "如：选择胆码 08，选择拖码 01 02 03 05 06 07 09 11，开奖号码为 06 08 11 09 02，即为中奖。",
                "help": "分别从胆码和拖码的01-11中，至少选择1个胆码和7个拖码组成一注，只要当期顺序摇出的5个开奖号码同时存在于胆码和拖码的任意组合中，即为中奖。"
            },
            "title": "任选胆拖",
            "row": {"任选胆拖": ["43", "49", "51", "53", "56", "58", "60"]}
        }],
    '4': [
        {
            "61": {
                "type": "select",
                "param": {"titles": {"yi": "首位"}, "begin": 1, "end": 18, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
                "explain": "从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。",
                "example": "从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。",
                "help": "从01至18中任选1个,投注号码与开奖号码第一位相同即中奖。"
            },
            "62": {
                "type": "select",
                "param": {"titles": {"yi": "首位"}, "begin": 19, "end": 20, "row_num_count": 10, "selector": 0},
                "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
                "explain": "19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。",
                "example": "19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。",
                "help": "19，20为红号，从这两个号码任选一个投注，开奖号码第一位是红号（19或20）即中奖。"
            },
            "63": {
                "type": "select",
                "param": {
                    "titles": {"qw": "前位", "hou": "后位"},
                    "begin": 1,
                    "end": 20,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。",
                "example": "从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。",
                "help": "从20个号码中任选连续两位,投注号码与开奖号码任意连续两位数字、顺序均相同即中奖。"
            },
            "64": {
                "type": "select",
                "param": {"titles": {"er": "二连组"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。",
                "example": "从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。",
                "help": "从20个号码中任选2个,投注号与开奖号任意连续两位数字相同(顺序不限)即中。"
            },
            "65": {
                "type": "select",
                "param": {"titles": {"er": "快乐二"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 2, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。",
                "example": "从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。",
                "help": "从20个号码中任选2个,投注号码与开奖号码任意两位相同即中奖。"
            },
            "66": {
                "type": "select",
                "param": {
                    "titles": {"yi": "第一位", "er": "第二位", "san": "第三位"},
                    "begin": 1,
                    "end": 20,
                    "row_num_count": 10,
                    "selector": 2
                },
                "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。",
                "example": "从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。",
                "help": "从20个号码中猜开奖号码前三位,投注号码与开奖号码前三位数字、顺序均相同即中奖。"
            },
            "67": {
                "type": "select",
                "param": {"titles": {"san": "前三组"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。",
                "example": "从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。",
                "help": "从20个号码中猜开奖号码的前三位,投注号与开奖号前三位数字相同(顺序不限)即中。"
            },
            "68": {
                "type": "select",
                "param": {"titles": {"san": "快乐三"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 3, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。",
                "example": "从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。",
                "help": "从20个号码中任选3个,投注号码与开奖号码任意三位相同即中奖。"
            },
            "69": {
                "type": "select",
                "param": {"titles": {"si": "快乐四"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 4, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。",
                "example": "从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。",
                "help": "从20个号码中任选4个,投注号码与开奖号码任意四位相同即中奖。"
            },
            "70": {
                "type": "select",
                "param": {"titles": {"wu": "快乐五"}, "begin": 1, "end": 20, "row_num_count": 10, "selector": 2},
                "calculate": {"method": "formula_zx_fs", "base_len": 5, "num_separator": ",", "row_separator": "-"},
                "explain": "从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。",
                "example": "从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。",
                "help": "从20个号码中任选5个,投注号码与开奖号码任意五位相同即中奖。"
            },
            "title": "快乐十分",
            "row": {"快乐十分": ["61", "62", "63", "64", "66", "67", "65", "68", "69", "70"]}
        }],
    '6':[{
        '81': {     //特码直选(A)
                type: 'select',
                param: {
                    titles: {lhc: "特码"},
                    begin: 1,
                    end: 49,
                    row_num_count: 10,
                    selector: 2,
                    show_title: 'get_lhc_odds',
                    value_type: 1,
                    value: 'number'
                },
                calculate: {method: 'formula_num_count', num_separator: ','},
                explain: '特码指的是六合彩开奖序列号的最后一个号。',
                example: '特码直选(A)。',
                help: '特码直选(A)。'
            },
    }],
    '9': [
        {
            "500001": {
                "type": "select",
                "param": {"titles": {"hao": "号码"}, "begin": 1, "end": 6, "row_num_count": 6, "css": "dice"},
                "calculate": {"method": "formula_zx_fs", "base_len": 2, "num_separator": ","},
                "explain": "从1-6中任意选择2个或2个以上号码。",
                "example": "投注方案：2,5<br>开奖号码中出现：1个2、1个5(顺序不限)，即为中奖。",
                "help": "从1-6中任意选择2个号码组成一注，顺序不限。开奖号码中出现所选的两个号码即为中奖。"
            },
            "500002": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 2, "check_type": 1, "to_value": "insert_comma"},
                "explain": "手动输入号码，至少输入一个由1-6中两个不同的数字组成一注的号码。",
                "example": "投注方案：5,6<br>开奖号码：536，即中奖。",
                "help": "开奖号码中至少包含所输入的两个数字即为中奖。"
            },
            "500003": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 6,
                    "row_num_count": 6,
                    "css": "dice"
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 1,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从1-6中任意选择1个胆码以及1个以上的号码作为拖码。",
                "example": "二不同胆拖",
                "help": "从1-6中选择一个胆码和至少一个拖码，如果开奖号码中不重复数字至少包含胆码所选号码即为中奖。"
            },
            "title": "二不同号",
            "row": {"二不同号": ["500001", "500002", "500003"]}
        }, {
            "500004": {
                "type": "select",
                "param": {"titles": {"et": "二同号", "bt": "不同号"}, "cs": "ks_et_bz", "css": "dice"},
                "calculate": {
                    "method": "formula_num_multiply",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "选择1个对子（11,22,33,44,55,66）和1个不同号码(1,2,3,4,5,6)投注。",
                "example": "投注方案：112<br>开奖号码为112,121,211中任意一个，即为中奖。",
                "help": "选择一个对子(11,22,33,44,55,66)和一个不同号码(1,2,3,4,5,6)投注，选号与开奖号码一致即为中奖。"
            },
            "500005": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 2, "to_value": "insert_comma", "row_separator": "-"},
                "explain": "手动输入号码，至少输入一个由1-6中2个数字组成一注的号码。",
                "example": "投注方案：112<br>开奖号码为112,121,211中任意一个，即中奖。",
                "help": "手动输入号码，至少输入一个三位数号码，选号与开奖号码一致即中奖。"
            },
            "500006": {
                "type": "select",
                "param": {"titles": {"tong": "复选"}, "cs": "ks_et_fs", "css": "dice"},
                "calculate": {"method": "formula_num_count", "num_separator": ","},
                "explain": "选择对子(11*,22*,33*,44*,55*,66*)进行投注。",
                "example": "投注方案：11*<br>开奖号码：112,211,121，即中奖。",
                "help": "选择对子(11*,22*,33*,44*,55*,66*)投注，开奖号码中包含选择的对子即中奖。"
            },
            "title": "二同号",
            "row": {"单选": ["500004", "500005"], "复选": ["500006"]}
        }, {
            "500007": {
                "type": "select",
                "param": {"titles": {"hao": "号码"}, "begin": 1, "end": 6, "row_num_count": 6, "css": "dice"},
                "calculate": {"method": "formula_zx_fs", "base_len": 3, "num_separator": ","},
                "explain": "选择任意三个或以上的号码进行投注。",
                "example": "投注方案：2,5,6<br>开奖号码中出现：256,562,625(顺序不限)即中奖。",
                "help": "从1-6中任意选择3个(或以上)不相同号码组成一注，顺序不限，若其中三位与开奖号码相同即为中奖。"
            },
            "500008": {
                "type": "input",
                "param": {},
                "calculate": {"base_len": 3, "check_type": 1, "to_value": "insert_comma"},
                "explain": "对三个各不相同的号码进行投注。",
                "example": "投注方案：256<br>开奖号码中出现：1个2、1个5、1个6(顺序不限)，即中奖。",
                "help": "从1-6中任意选择3个或3个以上各不相同号码组成一注，顺序不限，若开奖号码与所选号码相同，即为中奖。"
            },
            "500009": {
                "type": "select",
                "param": {
                    "titles": {"dan": "胆码", "tuo": "拖码"},
                    "begin": 1,
                    "end": 6,
                    "row_num_count": 6,
                    "css": "dice"
                },
                "calculate": {
                    "method": "formula_dt",
                    "limit_row": 0,
                    "limit_rule": "no_repeat",
                    "base_len": 2,
                    "num_separator": ",",
                    "row_separator": "-"
                },
                "explain": "从1-6中任意选择1~2个胆码以及1个以上的号码作为拖码。",
                "example": "三不同胆拖",
                "help": "从1-6中选择1~2个胆码和至少一个拖码，如果开奖号码中至少包含胆码所选号码，即为中奖。"
            },
            "500010": {
                "type": "select",
                "param": {
                    "titles": {"he": "和值"},
                    "begin": 6,
                    "end": 15,
                    "row_num_count": 10,
                    "selector": 2,
                    "value": "number"
                },
                "calculate": {"method": "formula_value_add", "value": "ks_sbt", "num_separator": "$"},
                "explain": "从6-15中任意选择1个或1个以上号码。",
                "example": "投注方案：和值9<br>开奖号码：234,423,342即为中奖",
                "help": "所选数值等于开奖号码相加之和，即为中奖。"
            },
            "title": "三不同号",
            "row": {"三不同号": ["500007", "500008", "500009", "500010"]}
        }, {
            "500011": {
                "type": "select",
                "param": {"titles": {"dan": "单选"}, 'begin': 1, 'end': 6, "cs": "ks_sth", "css": "dice"},
                "calculate": {"method": "formula_num_count", "num_separator": ","},
                "explain": "选择任意一组以上三位相同的号码。",
                "example": "投注方案：222<br>开奖号码为222，即为中奖。",
                "help": "从111,222,333,444,555,666中选择任意一组或一组以上号码进行投注，选号与开奖号码一致即为中奖。"
            },
            "500012": {
                "type": "select",
                "param": {"titles": {"tong": "通选"}, "cs": "ks_sth", "css": "dice"},
                "calculate": {"method": "fixed_one", "limit_rule": "for_all", "value": "", "num_separator": ","},
                "explain": "对所有三同号（111,222,333,444,555,666）进行投注。",
                "example": "投注方案：通选<br>开奖号码中出现：222或3个其他数字，即中奖。",
                "help": "投注后，开奖号码为任意数字的三重号，即为中奖。"
            },
            "500013": {
                "type": "select",
                "param": {"titles": {"tong": "通选"}, "cs": "ks_slh", "css": "dice"},
                "calculate": {"method": "fixed_one", "limit_rule": "for_all", "value": "", "num_separator": ","},
                "explain": "对所有三个相连的号码进行投注。",
                "example": "投注方案：三连号通选<br>开奖号码：123或324或345或456即中奖。",
                "help": "开奖号码为三连号(123,234,345,456)即为中奖。"
            },
            "title": "三同号",
            "row": {"三同号": ["500011", "500012", "500013"]}
        }, {
            "500014": {
                "type": "select",
                "param": {
                    "titles": {"value": "和值"},
                    "begin": 3,
                    "end": 18,
                    "row_num_count": 8,
                    "selector": 2,
                    "value": "number"
                },
                "calculate": {"method": "formula_num_count", "num_separator": "$"},
                "explain": "从3-18中任意选择1个或1个以上号码。",
                "example": "投注方案：和值4<br>开奖号码：112，即为中奖。",
                "help": "所选数值等于开奖号码三个数字相加之和，即为中奖。"
            }, "title": "和值", "row": {"和值": ["500014"]}
        }],
    '10': [{
        "400001": {
            "type": "select",
            "param": {
                "titles": {"pk": "冠军"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜冠军",
            "example": "猜冠军",
            "help": "猜冠军"
        },
        "400021": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "猜冠军,输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "title": "猜第一",
        "row": {"猜第一": ["400001", "400021"]}
    }, {
        "400002": {
            "type": "select",
            "param": {
                "titles": {"pk": "亚军"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜亚军",
            "example": "猜亚军",
            "help": "猜亚军"
        },
        "400012": {
            "type": "select",
            "param": {
                "titles": {"yi": "冠军", "er": "亚军"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前二名",
            "example": "猜前二名",
            "help": "猜前二名"
        },
        "400022": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400032": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 2, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前二",
        "row": {"猜前二名": ["400002", "400022", "400012", "400032"]}
    }, {
        "400003": {
            "type": "select",
            "param": {
                "titles": {"pk": "季军"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜季军",
            "example": "猜季军",
            "help": "猜季军"
        },
        "400013": {
            "type": "select",
            "param": {
                "titles": {"yi": "冠军", "er": "亚军", "san": "季军"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前三名",
            "example": "猜前三名",
            "help": "猜前三名"
        },
        "400023": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400033": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 3, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前三",
        "row": {"猜前三名": ["400003", "400023", "400013", "400033"]}
    }, {
        "400004": {
            "type": "select",
            "param": {
                "titles": {"pk": "第四名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第四名",
            "example": "猜第四名",
            "help": "猜第四名"
        },
        "400014": {
            "type": "select",
            "param": {
                "titles": {"yi": "冠军", "er": "亚军", "san": "季军", "si": "第四名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前四名",
            "example": "猜前四名",
            "help": "猜前四名"
        },
        "400024": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400034": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 4, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前四",
        "row": {"猜前四名": ["400004", "400024", "400014", "400034"]}
    }, {
        "400005": {
            "type": "select",
            "param": {
                "titles": {"pk": "第五名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第五名",
            "example": "猜第五名",
            "help": "猜第五名"
        },
        "400015": {
            "type": "select",
            "param": {
                "titles": {"yi": "冠军", "er": "亚军", "san": "季军", "si": "第四", "wu": "第五名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前五名",
            "example": "猜前五名",
            "help": "猜前五名"
        },
        "400025": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400035": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 5, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前五",
        "row": {"猜前五名": ["400005", "400025", "400015", "400035"]}
    }, {
        "400006": {
            "type": "select",
            "param": {
                "titles": {"pk": "第六名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第六名",
            "example": "猜第六名",
            "help": "猜第六名"
        },
        "400016": {
            "type": "select",
            "param": {
                "titles": {"yi": "冠军", "er": "亚军", "san": "季军", "si": "第四", "wu": "第五名", "liu": "第六名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前六名",
            "example": "猜前六名",
            "help": "猜前六名"
        },
        "400026": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400036": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 6, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前六",
        "row": {"猜前六名": ["400006", "400026", "400016", "400036"]}
    }, {
        "400007": {
            "type": "select",
            "param": {
                "titles": {"pk": "第七名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第七名",
            "example": "猜第七名",
            "help": "猜第七名"
        },
        "400017": {
            "type": "select",
            "param": {
                "titles": {
                    "yi": "冠军",
                    "er": "亚军",
                    "san": "季军",
                    "si": "第四",
                    "wu": "第五名",
                    "liu": "第六名",
                    "qi": "第七名"
                }, "begin": 1, "end": 10, "row_num_count": 10, "selector": 2, "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前七名",
            "example": "猜前七名",
            "help": "猜前七名"
        },
        "400027": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400037": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 7, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜第七",
        "row": {"猜前七名": ["400007", "400027", "400017", "400037"]}
    }, {
        "400008": {
            "type": "select",
            "param": {
                "titles": {"pk": "第八名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第八名",
            "example": "猜第八名",
            "help": "猜第八名"
        },
        "400018": {
            "type": "select",
            "param": {
                "titles": {
                    "yi": "冠军",
                    "er": "亚军",
                    "san": "季军",
                    "si": "第四",
                    "wu": "第五名",
                    "liu": "第六名",
                    "qi": "第七名",
                    "ba": "第八名"
                }, "begin": 1, "end": 10, "row_num_count": 10, "selector": 2, "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前八名",
            "example": "猜前八名",
            "help": "猜前八名"
        },
        "400028": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400038": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 8, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前八",
        "row": {"猜前八名": ["400008", "400028", "400018", "400038"]}
    }, {
        "400009": {
            "type": "select",
            "param": {
                "titles": {"pk": "第九名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第九名",
            "example": "猜第九名",
            "help": "猜第九名"
        },
        "400019": {
            "type": "select",
            "param": {
                "titles": {
                    "yi": "冠军",
                    "er": "亚军",
                    "san": "季军",
                    "si": "第四",
                    "wu": "第五名",
                    "liu": "第六名",
                    "qi": "第七名",
                    "ba": "第八名",
                    "jiu": "第九名"
                }, "begin": 1, "end": 10, "row_num_count": 10, "selector": 2, "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前九名",
            "example": "猜前九名",
            "help": "猜前九名"
        },
        "400029": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400039": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 9, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前九",
        "row": {"猜前九名": ["400009", "400029", "400019", "400039"]}
    }, {
        "400010": {
            "type": "select",
            "param": {
                "titles": {"pk": "第十名"},
                "begin": 1,
                "end": 10,
                "row_num_count": 10,
                "selector": 2,
                "value": "number"
            },
            "calculate": {"method": "formula_num_count", "num_separator": ","},
            "explain": "猜第十名",
            "example": "猜第十名",
            "help": "猜第十名"
        },
        "400020": {
            "type": "select",
            "param": {
                "titles": {
                    "yi": "冠军",
                    "er": "亚军",
                    "san": "季军",
                    "si": "第四",
                    "wu": "第五名",
                    "liu": "第六名",
                    "qi": "第七名",
                    "ba": "第八名",
                    "jiu": "第九名",
                    "shi": "第十名"
                }, "begin": 1, "end": 10, "row_num_count": 10, "selector": 2, "value": "number"
            },
            "calculate": {"method": "formula_count_no_repeat", "num_separator": ",", "row_separator": "-"},
            "explain": "猜前十名",
            "example": "猜前十名",
            "help": "猜前十名"
        },
        "400030": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 1, "check_type": 0, "num_separator": "~"},
            "explain": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "example": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)",
            "help": "输入选择的号码,每个号码之间用逗号隔开(1,2,3)"
        },
        "400040": {
            "type": "input",
            "param": {},
            "calculate": {"base_len": 10, "check_type": 0, "num_separator": " "},
            "explain": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "example": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)",
            "help": "输入选择的号码,每个号码之间用空格隔开,每组号码用逗号或分号或回车隔开(1 2,3 4)"
        },
        "title": "猜前十",
        "row": {"猜前十名": ["400010", "400030", "400020", "400040"]}
    }, {
        "400041": {
            "type": "select",
            "param": {
                "titles": {
                    "yi": "第一",
                    "er": "第二",
                    "san": "第三",
                    "si": "第四",
                    "wu": "第五",
                    "liu": "第六",
                    "qi": "第七",
                    "ba": "第八",
                    "jiu": "第九",
                    "shi": "第十"
                }, "begin": 1, "end": 10, "row_num_count": 10, "selector": 2
            },
            "calculate": {"method": "formula_num_count", "num_separator": ",", "row_separator": "-"},
            "explain": "定位胆",
            "example": "定位胆",
            "help": "定位胆"
        }, "title": "定位胆", "row": {"定位胆": ["400041"]}
    }, {
        "400051": {
            "type": "select",
            "param": {"titles": {"yi": "冠军"}, "cs": "dx_ds", "selector": 1},
            "calculate": {"method": "formula_num_multiply"},
            "explain": "冠军大小单双",
            "example": "冠军大小单双",
            "help": "冠军大小单双"
        },
        "400052": {
            "type": "select",
            "param": {"titles": {"yi": "亚军"}, "cs": "dx_ds", "selector": 1},
            "calculate": {"method": "formula_num_multiply"},
            "explain": "亚军大小单双",
            "example": "亚军大小单双",
            "help": "亚军大小单双"
        },
        "400053": {
            "type": "select",
            "param": {"titles": {"yi": "季军"}, "cs": "dx_ds", "selector": 1},
            "calculate": {"method": "formula_num_multiply"},
            "explain": "季军大小单双",
            "example": "季军大小单双",
            "help": "季军大小单双"
        },
        "title": "大小单双",
        "row": {"定位胆": ["400051", "400052", "400053"]},
    },{
        '400054': { // 冠亚和值
            'type': 'select',
            'param': {'titles': {hz: "和值"}, 'begin': 3, 'end': 19, row_num_count: 11, 'selector': 1, num_len:1},
            'calculate': {'method': 'formula_num_count', num_separator: ','},
            'explain': '从3-19中任意选择1个或1个以上号码。',
            'example': '投注号码为14，比赛结果的冠军车号为8，亚军车号为6，冠、亚军车号相加的和值为14，与投注的号码相符合时视为中奖',
            'help': '投注号码为14，比赛结果的冠军车号为8，亚军车号为6，冠、亚军车号相加的和值为14，与投注的号码相符合时视为中奖'
        },
        '400055': { // 冠亚季和值
            'type': 'select',
            'param': {'titles': {hz: "和值"}, 'begin': 6, 'end': 27, row_num_count: 11, 'selector': 1, num_len:1},
            'calculate': {'method': 'formula_num_count', num_separator: ','},
            'explain': '从6-27中任意选择1个或1个以上号码。',
            'example': '投注号码为8，比赛结果的冠军车号为1，亚军车号为2，季军车号为5，冠、亚、季军车号相加的和值为8，与投注的号码相符合时视为中奖',
            'help': '投注号码为8，比赛结果的冠军车号为1，亚军车号为2，季军车号为5，冠、亚、季军车号相加的和值为8，与投注的号码相符合时视为中奖'
        },
        '400056': { // 龙虎斗
            type: 'select',
            'param': {
                'titles': {
                    0: "一VS十",
                    1: "二VS九",
                    2: "三VS八",
                    3: "四VS七",
                    4: "五VS六"
                },
                'cs': 'pk_lhd', 'selector': 1
            },
            'calculate': {
                'method': 'formula_num_count',
                'value': 'pk_lhd',
                num_separator: ',',
                group: 'all_num'
            },
            explain: '任意选择一个号码组成一注。',
            example: '龙虎是由两两名次进行号码PK，第一名VS第十名、第二名VS第九名、第三名VS第八名、第四名VS第七名、第五名VS第六名',
            help: '第一名、第二名、第三名、第四名、第五名为龙，第六名、第七名、第八名、第九名、第十名为虎。 假设:投注第二名:[龙]，比赛结果第二名为5，第九名为4，即为中奖。 假设:投注第五名:[龙]，比赛结果第五名为1，第六名为9，则为不中奖'
        },
        "title": "和值",
        "row": {"和值": ["400054", "400055"]},
    }],
    '13':[{'600001': {
        "special": true,
        "type": "28",
        "param": {
            "begin": 0,
            "end": 27,
            "row_num_count": 28,
            "selector": 1
        },
        "title": "猜数字",
        "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
        "explain": "和值为购买数字",
        "example": "和值为购买数字",
        "help": "和值为购买数字"
    },
        '600002': {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 1
            },
            "title": "大小单双",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "大:和值大于14; 小:和值小于13; 单:和值为单数; 双:和值为偶数",
            "example": "大:和值大于14; 小:和值小于13; 单:和值为单数; 双:和值为偶数",
            "help": "大:和值大于14; 小:和值小于13; 单:和值为单数; 双:和值为偶数"
        },
        '600003': {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 8
            },
            "title": "波色",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "红:和值3,6,9,12,15,18,21,24; 绿:和值1,4,7,10,16,19,22,25; 蓝:和值2,5,8,11,17,20,23,26",
            "example": "红:和值3,6,9,12,15,18,21,24; 绿:和值1,4,7,10,16,19,22,25; 蓝:和值2,5,8,11,17,20,23,26",
            "help": "红:和值3,6,9,12,15,18,21,24; 绿:和值1,4,7,10,16,19,22,25; 蓝:和值2,5,8,11,17,20,23,26"
        },
        600004: {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 8
            },
            "title": "特码包三",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "text: 特码包三, value: 0",
            "example": "text: 特码包三, value: 0",
            "help": "text: 特码包三, value: 0"
        },
        600005: {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 8
            },
            "title": "特殊组合",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "豹子: 三位号码为8,8,8",
            "example": "豹子: 三位号码为8,8,8",
            "help": "豹子: 三位号码为8,8,8"
        },
        600006: {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 8
            },
            "title": "大单小单大双小双",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "大单: 和值大于14并且为单数; 小单:和值小于13并且为单数; 大双:和值大于14并且为偶数; 小双:和值小于13并且为偶数",
            "example": "大单: 和值大于14并且为单数; 小单:和值小于13并且为单数; 大双:和值大于14并且为偶数; 小双:和值小于13并且为偶数",
            "help": "大单: 和值大于14并且为单数; 小单:和值小于13并且为单数; 大双:和值大于14并且为偶数; 小双:和值小于13并且为偶数"
        },
        600007: {
            "special": true,
            "type": "28",
            "param": {
                "begin": 0,
                "end": 27,
                "row_num_count": 28,
                "selector": 8
            },
            "title": "极大极小",
            "calculate": {"method": "formula_zx_one_more", "oneRow": 0, "moreRow": 1, "base_len": 1},
            "explain": "极大:和值22，23，24，25，26，27; 极小: 和值0，1，2，3，4，5",
            "example": "极大:和值22，23，24，25，26，27; 极小: 和值0，1，2，3，4，5",
            "help": "极大:和值22，23，24，25，26，27; 极小: 和值0，1，2，3，4，5"
        }}]
};

var NUM_VALUE = {
    zhi_san: {
        "0": 1,
        "1": 3,
        "2": 6,
        "3": 10,
        "4": 15,
        "5": 21,
        "6": 28,
        "7": 36,
        "8": 45,
        "9": 55,
        "10": 63,
        "11": 69,
        "12": 73,
        "13": 75,
        "14": 75,
        "15": 73,
        "16": 69,
        "17": 63,
        "18": 55,
        "19": 45,
        "20": 36,
        "21": 28,
        "22": 21,
        "23": 15,
        "24": 10,
        "25": 6,
        "26": 3,
        "27": 1
    },
    kd_san: {
        "0": 10,
        "1": 54,
        "2": 96,
        "3": 126,
        "4": 144,
        "5": 150,
        "6": 144,
        "7": 126,
        "8": 96,
        "9": 54
    },
    zu_san: {
        "1": 1,
        "2": 2,
        "3": 2,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 8,
        "8": 10,
        "9": 11,
        "10": 13,
        "11": 14,
        "12": 14,
        "13": 15,
        "14": 15,
        "15": 14,
        "16": 14,
        "17": 13,
        "18": 11,
        "19": 10,
        "20": 8,
        "21": 6,
        "22": 5,
        "23": 4,
        "24": 2,
        "25": 2,
        "26": 1
    },
    "zhi_er": {
        "0": 1,
        "1": 2,
        "2": 3,
        "3": 4,
        "4": 5,
        "5": 6,
        "6": 7,
        "7": 8,
        "8": 9,
        "9": 10,
        "10": 9,
        "11": 8,
        "12": 7,
        "13": 6,
        "14": 5,
        "15": 4,
        "16": 3,
        "17": 2,
        "18": 1
    },
    "kd_er": {
        "0": 10,
        "1": 18,
        "2": 16,
        "3": 14,
        "4": 12,
        "5": 10,
        "6": 8,
        "7": 6,
        "8": 4,
        "9": 2
    },
    "zu_er": {
        "1": 1,
        "2": 1,
        "3": 2,
        "4": 2,
        "5": 3,
        "6": 3,
        "7": 4,
        "8": 4,
        "9": 5,
        "10": 4,
        "11": 4,
        "12": 3,
        "13": 3,
        "14": 2,
        "15": 2,
        "16": 1,
        "17": 1
    },
    "fc_spice_012": {
        "000": 64,
        "001": 48,
        "002": 48,
        "010": 48,
        "011": 36,
        "012": 36,
        "020": 48,
        "021": 36,
        "022": 36,
        "100": 48,
        "101": 36,
        "102": 36,
        "110": 36,
        "111": 27,
        "112": 27,
        "120": 27,
        "121": 36,
        "122": 27,
        "200": 48,
        "201": 36,
        "202": 36,
        "210": 36,
        "211": 27,
        "212": 27,
        "220": 36,
        "221": 27,
        "222": 27
    },
    "ks_sbt": {
        "6": 1,
        "7": 1,
        "8": 2,
        "9": 3,
        "10": 3,
        "11": 3,
        "12": 3,
        "13": 2,
        "14": 1,
        "15": 1
    },
    pk_lhd: {
        0: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 0,
                '虎': 1
            },
            sort: ['龙', '虎']
        },
        1: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 2,
                '虎': 3
            },
            sort: ['龙', '虎']
        },
        2: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 4,
                '虎': 5
            },
            sort: ['龙', '虎']
        },
        3: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 6,
                '虎': 7
            },
            sort: ['龙', '虎']
        },
        4: {
            num_cls: 'nb',
            row_num_count: 2,
            num: {
                '龙': 8,
                '虎': 9
            },
            sort: ['龙', '虎']
        }
    },
    pk_lhd_num: {
        num: {
            '一VS十-龙': '0',
            '一VS十-虎': '1',
            '二VS九-龙': '2',
            '二VS九-虎': '3',
            '三VS八-龙': '4',
            '三VS八-虎': '5',
            '四VS七-龙': '6',
            '四VS七-虎': '7',
            '五VS六-龙': '8',
            '五VS六-虎': '9'
        }
    }

};

"use strict";
angular.module("ionic-toast", ["ionic"]).run(["$templateCache", function (t) {
    var o = '<div class="ionic_toast" ng-class="ionicToast.toastClass" ng-style="ionicToast.toastStyle"><span class="ionic_toast_close" ng-click="hide()"><i class="ion-close-round toast_close_icon"></i></span><span ng-bind-html="ionicToast.toastMessage"></span></div>';
    t.put("ionic-toast/templates/ionic-toast.html", o)
}]).provider("ionicToast", function () {
    this.$get = ["$compile", "$document", "$interval", "$rootScope", "$templateCache", "$timeout", function (t, o, i, n, s, a) {
        var c, e = {
            toastClass: "",
            toastMessage: "",
            toastStyle: {display: "none", opacity: 0}
        }, l = {
            top: "ionic_toast_top",
            middle: "ionic_toast_middle",
            bottom: "ionic_toast_bottom"
        }, d = n.$new(), p = t(s.get("ionic-toast/templates/ionic-toast.html"))(d);
        d.ionicToast = e, o.find("body").append(p);
        var u = function (t, o, i) {
            d.ionicToast.toastStyle = {display: t, opacity: o}, d.ionicToast.toastStyle.opacity = o, i()
        };
        return d.hide = function () {
            u("none", 0, function () {
                console.log("toast hidden")
            })
        }, {
            show: function (t, o, i, n) {
                t && o && n && (a.cancel(c), n > 5e3 && (n = 5e3), angular.extend(d.ionicToast, {
                    toastClass: l[o] + " " + (i ? "ionic_toast_sticky" : ""),
                    toastMessage: t
                }), u("block", 1, function () {
                    i || (c = a(function () {
                        d.hide()
                    }, n))
                }))
            }, hide: function () {
                d.hide()
            }
        }
    }]
});

(function () {
  'use strict';

  angular
    .module('yike.back', [])
    .directive('yikeBack', YikeBack);

  YikeBack.$inject = ['$ionicHistory'];

  function YikeBack($ionicHistory) {
    var directive = {
      template: ' <button class="button button-clear ion-chevron-left white"></button>',
      link: link,
      replace: true,
      restrict: 'AE'
    };
    return directive;

    function link(scope, element, attrs) {
      element.bind('click', function(e) {
        $ionicHistory.goBack();
      })
    }
  }
})();

(function () {
    'use strict';

    angular
        .module('yike', ['yike.subMenu', 'yike.utils', 'ionic-toast', 'yike.back']);

})();

(function () {
  'use strict';

  angular
    .module('yike.subMenu', [])
    .directive('yikeSubMenu', yikeSubMenu);

  yikeSubMenu.$inject = [];
  function yikeSubMenu() {
    return {
      replace: false,
      restrict: 'AE',
      link: function (scope, elem, attrs) {
        scope.clickCategory = function (key) {
          scope.current.menu = key == scope.current.menu ? '' : key;
          scope.current.subMenu = [];
        };

        scope.clickMenu = function (menu) {
          if (menu.sub.length > 0) {
            scope.current.subMenu = menu.sub;
          } else {
            scope.condition[scope.current.menu] = menu;
            scope.current.menu = null;
            scope.page = 1;
            scope.query();
          }
          $('.sub').scrollTop(0);
        };

        scope.clickSubMenu = function (subMenu) {
          scope.condition[scope.current.menu] = subMenu;
          scope.current.menu = null;
          scope.page = 1;
          scope.query();
        }
      },
      templateUrl: 'templates/utils/sub-menu.html'
    };
  }
})();

(function () {
  'use strict';

  angular
    .module('yike.utils', ['ionic'])
    .factory('$yikeUtils', $yikeUtils);

  $yikeUtils.$inject = ['$rootScope', '$state', '$ionicPopup', '$ionicModal', '$location', '$timeout', 'ionicToast', '$ionicLoading'];

  /* @ngInject */
  function $yikeUtils($rootScope, $state, $ionicPopup, $ionicModal, $location, $timeout, ionicToast, $ionicLoading) {
    return {
      go: go,
      alert: alert,
      confirm: confirm,
      show: show,
      toast: toast,
      confirmWindow:confirmWindow
    };

    ////////////////

    function go(target, params, options) {
      $state.go(target, params, options);
    }

    function toast(message, position, stick, time) {
      //position = position || 'middle';
      //stick = stick || false;
      //time = time || 3000;
      //ionicToast.show(message, position, stick, time);
      $ionicLoading.show({ template: message, noBackdrop: true, duration: 2000 });
    }

    function alert(title, template) {
      var _alert = $ionicPopup.alert({
        title: title,
        template: template,
        'okType': 'button-assertive'
      });

      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 1500);

      return _alert;
    }

    function confirm(title, template) {
      var _alert = $ionicPopup.confirm({
        'title': title,
        'template': template,
        'okType': 'button-assertive',
        'cancelText': '取消',
        'okText': '确认',
        cssClass:'red-confirm'
      });

      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 3000);

      return _alert;
    }

    function confirmWindow(title, template) {
      var _alert = $ionicPopup.confirm({
        'title': title,
        'template': template,
        'okType': 'button-assertive',
        'cancelText': '取消',
        'okText': '确认',
        cssClass:'red-confirm'
      });

      return _alert;
    }

    function show(title, template, scope, buttons){
      var _alert = $ionicPopup.show({
        title: title,
        template: template,
        scope: scope,
        buttons: buttons
      });
      $timeout(function() {
        _alert.close(); //close the popup after 3 seconds for some reason
      }, 3000);

      return _alert;
    }
  }
})();
