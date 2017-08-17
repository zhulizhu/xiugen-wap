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

angular.module('frame', ['ionic', 'lottery.controller', 'main.controller', 'dialog.module', 'luck.controller']);




















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

var WX_ID = 2;
var WX_API_URL = "http://www.yike1908.com/app/index.php";
var TOKEN = localStorage.getItem('token') || '';
//var openid = elocalStorage.get('openid') || '';
var yikeYbc = new yikeYbc(WX_API_URL, WX_ID);

