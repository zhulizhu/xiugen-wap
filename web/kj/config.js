var mysql = require('mysql');
var dbinfo = require('./db').dbinfo;
var parse = require('./kj-data/parse-calc-count.js');
var played = {};

var IS_DEBUG = false;

function getNowFormatDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear().toString() + month + strDate;
    return currentdate;
}

// 出错时等待 15
exports.errorSleepTime = 15;

// 重启时间间隔，以小时为单位，0为不重启
//exports.restartTime=0.4;
exports.restartTime = 0;

exports.submit = {

    host: 'localhost',
    path: '/wjadmin.php/dataSource/kj'
}

exports.dbinfo = dbinfo;

global.log = function (log, level) {
    level = level ? level : 'info';
    var date = new Date();
    if (level == 'info') {
        console.log('[' + date.toDateString() + ' ' + date.toLocaleTimeString() + '] ' + log)
    } else if (level == 'debug') {
        console.debug('[' + date.toDateString() + ' ' + date.toLocaleTimeString() + '] ' + log)
    } else if (level == 'error') {
        console.debug('[' + date.toDateString() + ' ' + date.toLocaleTimeString() + '] ' + log)
    }
}

function getFromXJFLCPWeb(str, type) {
    str = str.substr(str.indexOf('<strong>时时彩</strong>'), 300).replace(/[\r\n]+/g, '');

    if (!str) throw new Error('数据不正确');
    var number = str.substr(str.indexOf('第') + 1, 10);

    var myDate = new Date();
    var year = myDate.getFullYear();       //年
    var month = myDate.getMonth() + 1;     //月   
    var day = myDate.getDate();            //日
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var mytime = year + "-" + month + "-" + day + " " + myDate.toLocaleTimeString();

    str = str.substr(str.indexOf('ballWrap') + 10, 200).replace(/[^0-9]/ig, "");
    //console.log(str);
    var data = str.split('').join(',');
    //console.log('期号：%s，开奖时间：%s，开奖数据：%s', number, mytime, data);

    try {
        var data = {
            type: type,
            time: mytime,
            number: number.replace(/^(\d{8})(\d{2})$/, '$1-$2'),
            data: data
        };
        //console.log(data);
        return data;
    } catch (err) {
        throw('解析数据失败');
    }
}


function getFromCaileleWeb(str, type, slen) {
    if (!slen) slen = 580;
    str = str.substr(str.indexOf('<p class="cz_name_period">') + 26, slen);
    var mynumber = str.substr(0, 10);
    mynumber = mynumber.substr(0, 8) + "-0" + mynumber.substr(8);
    var mytime = str.substr(str.indexOf('<span>') + 6, 16);

    var text = str.substr(str.indexOf('red_ball') + 10, 200);
    text = text.replace(/[^0-9]/ig, "");
    //console.log(text);

    //var mynumber = str
    var reg = /<td.*?>(\d+)<\/td>[\s\S]*?<td.*?>([\d\- \:]+)<\/td>[\s\S]*?<td.*?>((?:[\s\S]*?<span class="red_ball">\d+<\/span>){3,5})\s*<\/td>/,
        match = str.match(reg);


    try {
        var data = {
            type: type,
            time: mytime,
            number: mynumber,
            data: text.substr(0, 2) + "," + text.substr(2, 2) + "," + text.substr(4, 2) + "," + text.substr(6, 2) + "," + text.substr(8, 2)
        }


        //console.log(data);
        return data;
    } catch (err) {
        throw('解析数据失败');
    }
}

function getLuckBj(str, type) {
    var _data = JSON.parse(str);
    var result = [];
    var content = _data.open_content.split(',').sort();

    var one = 0;
    var two = 0;
    var three = 0;

    for (var i = 0; i < 6; i++) {
        var num = parseInt(content[i], 10);
        one += num;
    }

    for (var i = 6; i < 12; i++) {
        var num = parseInt(content[i], 10);
        two += num;
    }

    for (var i = 12; i < 18; i++) {
        var num = parseInt(content[i], 10);
        three += num;
    }

    if (one.toString().length == 2) {
        result[0] = one.toString().slice(1);
    } else if (one.toString().length == 3) {
        result[0] = one.toString().slice(2);
    }
    result[1] = two.toString().slice(2);
    result[2] = three.toString().slice(2);

    var data = {
        type: type,
        time: _data.open_time,
        number: _data.period,
        data: result.join(',')
    }
    console.log(data);
    return data;
}

function getFrom360CP(str, type) {

    str = str.substr(str.indexOf('<em class="red" id="open_issue">'), 380);
    //console.log(str);
    var reg = /[\s\S]*?(\d+)<\/em>[\s\S].*?<ul id="open_code_list">((?:[\s\S]*?<li class=".*?">\d+<\/li>){3,5})[\s\S]*?<\/ul>/,
        match = str.match(reg);
    var myDate = new Date();
    var year = myDate.getFullYear();       //年
    var month = myDate.getMonth() + 1;     //月   
    var day = myDate.getDate();            //日
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var mytime = year + "-" + month + "-" + day + " " + myDate.toLocaleTimeString();
    //console.log(match);
    if (match.length > 1) {
        if (match[1].length == 6) match[1] = '2017' + match[1].replace(/(\d{4})(\d{2})/, '$1-0$2');
        if (match[1].length == 7) match[1] = '2017' + match[1].replace(/(\d{4})(\d{3})/, '$1-$2');
        if (match[1].length == 8) match[1] = '20' + match[1].replace(/(\d{6})(\d{2})/, '$1-0$2');
        if (match[1].length == 9) match[1] = '20' + match[1].replace(/(\d{6})(\d{2})/, '$1-$2');
        if (match[1].length == 10) match[1] = match[1].replace(/(\d{8})(\d{2})/, '$1-0$2');
        var mynumber = match[1].replace(/(\d{8})(\d{3})/, '$1-$2');

        try {
            var data = {
                type: type,
                time: mytime,
                number: mynumber
            }

            reg = /<li class=".*?">(\d+)<\/li>/g;
            data.data = match[2].match(reg).map(function (v) {
                var reg = /<li class=".*?">(\d+)<\/li>/;
                return v.match(reg)[1];
            }).join(',');

            //console.log(data);
            return data;
        } catch (err) {
            throw('解析数据失败');
        }
    }
}

function getFromPK10(str, type) {

    str = str.substr(str.indexOf('<div class="lott_cont">'), 350).replace(/[\r\n]+/g, '');
    //console.log(str);
    var reg = /<tr class=".*?">[\s\S]*?<td>(\d+)<\/td>[\s\S]*?<td>(.*)<\/td>[\s\S]*?<td>([\d\:\- ]+?)<\/td>[\s\S]*?<\/tr>/,
        match = str.match(reg);
    if (!match) throw new Error('数据不正确');
    //console.log(match);
    try {
        var data = {
            type: type,
            time: match[3],
            number: match[1],
            data: match[2]
        };
        //console.log(data);
        return data;
    } catch (err) {
        throw('解析数据失败');
    }

}

function getFromK8(str, type) {

    str = str.substr(str.indexOf('<div class="lott_cont">'), 450).replace(/[\r\n]+/g, '');
    //console.log(str);
    var reg = /<tr class=".*?">[\s\S]*?<td>(\d+)<\/td>[\s\S]*?<td>(.*)<\/td>[\s\S]*?<td>(.*)<\/td>[\s\S]*?<td>([\d\:\- ]+?)<\/td>[\s\S]*?<\/tr>/,
        match = str.match(reg);
    if (!match) throw new Error('数据不正确');
    //console.log(match);
    try {
        var data = {
            type: type,
            time: match[4],
            number: match[1],
            data: match[2] + '|' + match[3]
        };
        //console.log(data);
        return data;
    } catch (err) {
        throw('解析数据失败');
    }

}


function getFromCJCPWeb(str, type) {

    //console.log(str);
    str = str.substr(str.indexOf('<table class="qgkj_table">'), 1200);

    //console.log(str);

    var reg = /<tr>[\s\S]*?<td class=".*">(\d+).*?<\/td>[\s\S]*?<td class=".*">([\d\- \:]+)<\/td>[\s\S]*?<td class=".*">((?:[\s\S]*?<input type="button" value="\d+" class=".*?" \/>){3,5})[\s\S]*?<\/td>/,
        match = str.match(reg);

    //console.log(match);

    if (!match) throw new Error('数据不正确');
    try {
        var data = {
            type: type,
            time: match[2],
            number: match[1].replace(/(\d{8})(\d{2})/, '$1-0$2')
        }

        reg = /<input type="button" value="(\d+)" class=".*?" \/>/g;
        data.data = match[3].match(reg).map(function (v) {
            var reg = /<input type="button" value="(\d+)" class=".*?" \/>/;
            return v.match(reg)[1];
        }).join(',');

        //console.log(data);
        return data;
    } catch (err) {
        throw('解析数据失败');
    }

}

var wfFullData;
var efFullData;
var wfGaiLv = 100;
var wfNo = '0';
var efNo = '0';
//万金娱乐自主研发五分彩开奖
function getFromWANJINYULE(str, type) {

    try {
        var client = mysql.createClient(exports.dbinfo);
    } catch (err) {
        throw('连接数据库失败');
    }

    var jd = JSON.parse(str);

    var match = [];
    match[1] = jd.actionNo;
    match[2] = jd.wufencai;
    match[3] = jd.actionTime;
    match[4] = 1;

    wfGaiLv = match[2];

    console.log("读取盈亏率成功：" + wfGaiLv);
    if (wfNo != match[1] && efNo != match[1]) {
        sql = "select * from gygy_bets where type=? and actionNo=? and isDelete=0 and lotteryNo=''";
        client.query(sql, [type, match[1]], function (err, bets) {
            if (err) {
                log("读取投注出错：" + err);
            } else {
                var myDate = new Date();
                var year = myDate.getFullYear();       //年
                var month = myDate.getMonth() + 1;     //月
                var day = myDate.getDate();            //日
                if (month < 10) month = "0" + month;
                if (day < 10) day = "0" + day;
                var mytime = year + "-" + month + "-" + day + " " + myDate.toLocaleTimeString();
                var mydata = GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9);
                var yingLv = GetRandomNum(0, 100);

                //控制盈亏
                for (var go = 0; go < 1000000; go++) {
                    if (yingLv > wfGaiLv) {
                        go = 1000000;
                        console.log("概率超出必赢范围，随机开奖");
                    } else {
                        go = go + 1;
                        var all = 0;
                        var win = 0;
                        bets.forEach(function (bet) {
                            var fun;

                            try {
                                fun = parse[global.played[bet.playedId]];
                                if (typeof fun != 'function') throw new Error('算法不是可用的函数');
                            } catch (err) {
                                log('计算玩法[%f]中奖号码算法不可用：%s'.format(bet.playedId, err.message));
                                return;
                            }

                            try {
                                var zjCount = fun(bet.actionData, mydata, bet.weiShu) || 0;
                            } catch (err) {
                                log('计算中奖号码时出错：' + err);
                                return;
                            }
                            win += bet.bonusProp * zjCount * bet.beiShu * bet.mode / 2;
                            all += bet.mode * bet.beiShu * bet.actionNum;
                        });
                        console.log("投注总额：盈亏总额----" + all + "：" + win);
                        if (all > win || bets.length == 0) {
                            go = 1000000;
                        }
                        else
                            mydata = GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9) + ',' + GetRandomNum(0, 9);
                    }

                    if (!match) throw new Error('数据不正确');
                    if (parseInt(match[4]) == 1) {
                        try {
                            var data = {
                                type: type,
                                time: mytime,
                                number: match[1],
                                data: mydata
                            }

                            if (type == 14) {
                                wfFullData = data;
                                wfNo = match[1];
                            }
                            else {
                                efFullData = data;
                                efNo = match[1];
                            }
                        }
                        catch (err) {
                            throw('解析数据失败');
                        }
                    }
                }
            }
        });
    }

    client.end();
    if (type == 14) {
        return wfFullData;
    }
    else {
        return efFullData;
    }

}

//随机数 GetRandomNum(0,9);   
function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

if (!IS_DEBUG) {
    exports.cp = [
        {
            title: '六合彩',
            source: '开彩网',
            name: 'lhc',
            enable: true,
            timer: 'lhc',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=hk6&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var d = m.opencode.split('+');
                    var _d = d[0] + ',' + d[1];
                    var result = {
                        type: 40,
                        time: +new Date(m.opentime),
                        number: m.expect,
                        data: _d
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('时时乐解析数据不正确');
                }
            }
        },
        {
            title: '上海时时乐',
            source: '官网',
            name: 'shssl',
            enable: true,
            timer: 'shssl',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)-(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"/;
                    if (m = str.match(reg)) {
                        return {
                            type: 7,
                            time: m[4],
                            number: m[1] + '-0' + m[2],
                            data: m[3]
                        };
                    }
                } catch (err) {
                    throw('时时乐解析数据不正确');
                }
            }
        },
        {
            title: '台湾5分彩',
            source: '官网',
            name: 'tw5',
            enable: true,
            timer: 'tw5',

            option: {
                host: "www.cai018.com",
                timeout: 50000,
                path: '/index.php?r=lottery%2Fgetfivestartsdirectbasetrenddata&play_type=3&period_num=30&run_days=1',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var result = data.rows[data.rows.length - 1];

                    return {
                        type: 62,
                        time: result.date,
                        number: result.periods,
                        data: result.lottery_number.split('').join(',')
                    };
                } catch (err) {
                    throw('台湾5分彩解析数据不正确');
                }
            }
        },
        {
            title: '加拿大3.5分彩',
            source: '官网',
            name: 'jnd3d5',
            enable: true,
            timer: 'jnd3d5',

            option: {
                host: "www.cai018.com",
                timeout: 50000,
                path: '/index.php?r=lottery%2Fgetfivestartsdirectbasetrenddata&play_type=4&period_num=30',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var result = data.rows[29];

                    return {
                        type: 61,
                        time: result.date,
                        number: result.periods,
                        data: result.lottery_number.split('').join(',')
                    };
                } catch (err) {
                    throw('加拿大3.5分彩解析数据不正确');
                }
            }
        },
        {
            title: '韩国1.5分彩',
            source: '官网',
            name: 'hg1d5',
            enable: true,
            timer: 'hg1d5',

            option: {
                host: "www.cai018.com",
                timeout: 50000,
                path: '/index.php?r=lottery%2Fgetfivestartsdirectbasetrenddata&play_type=2&period_num=30',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var result = data.rows[29];

                    return {
                        type: 60,
                        time: result.date,
                        number: result.periods,
                        data: result.lottery_number.split('').join(',')
                    };
                } catch (err) {
                    throw('时时乐解析数据不正确');
                }
            }
        },
        {
            title: '排列5',
            source: '官网',
            name: 'pai5',
            enable: true,
            timer: 'pai5',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/plw/list10.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" opentime="([\d\:\- ]+?)"/;
                    if (m = str.match(reg)) {
                        return {
                            type: 11,
                            time: m[3],
                            number: 20 + m[1],
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('排5解析数据不正确');
                }
            }
        },
        {
            title: '江苏快三',
            source: '500wan',
            name: 'jsk3',
            enable: true,
            timer: 'jsk3',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/jsk3/' + getNowFormatDate() + '.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"\/>/;

                    if (m = str.match(reg)) {
                        return {
                            type: 25,
                            time: m[3],
                            number: '20' + m[1].slice(0, 6) + '-' + m[1].slice(6),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('江苏快三解析数据不正确');
                }
            }
        },
        {
            title: '广东快乐十分',
            source: '500wan',
            name: 'gdklsf',
            enable: true,
            timer: 'gdklsf',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/gdklsf/' + getNowFormatDate() + '.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"\/>/;

                    if (m = str.match(reg)) {
                        return {
                            type: 17,
                            time: m[3],
                            number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('广东快乐十分解析数据不正确');
                }
            }
        },
        {
            title: '天津快乐十分',
            source: '500wan',
            name: 'tjklsf',
            enable: true,
            timer: 'tjklsf',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/klsf/' + getNowFormatDate() + '.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"\/>/;

                    if (m = str.match(reg)) {
                        return {
                            type: 18,
                            time: m[3],
                            number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('天津快乐十分解析数据不正确');
                }
            }
        },
        // {
        //     title: '山东11选5',
        //     source: '500wan',
        //     name: 'sd11x5',
        //     enable: true,
        //     timer: 'sd11x5',
        //
        //     option: {
        //         host: "www.500.com",
        //         timeout: 50000,
        //         path: '/static/info/kaijiang/xml/shdsyxw/' + getNowFormatDate() + '.xml',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             str = str.substr(0, 300);
        //             var m;
        //             var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"\/>/;
        //
        //             if (m = str.match(reg)) {
        //                 return {
        //                     type: 8,
        //                     time: m[3],
        //                     number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
        //                     data: m[2]
        //                 };
        //             }
        //         } catch (err) {
        //             throw('山东11选5解析数据不正确');
        //         }
        //     }
        // },
        {
            title: '天津时时彩',
            source: '开放平台',
            name: 'tjssc',
            enable: true,
            timer: 'tjssc',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/tjssc/' + getNowFormatDate() + '.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"/;

                    if (m = str.match(reg)) {
                        return {
                            type: 2,
                            time: m[3],
                            number: m[1].slice(0, 8) + '-' + m[1].slice(8),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('天津时时彩数据解析不正确');
                }
            }
        },
        // {
        //     title: '北京幸运28',
        //     source: '开放平台',
        //     name: 'luckbj',
        //     enable: true,
        //     timer: 'luckbj',
        //
        //     option: {
        //         host: "open.yike1908.com",
        //         timeout: 50000,
        //         path: '/api/thinkphp/index.php/Home/Api',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             return getLuckBj(str, 50);
        //         } catch (err) {
        //             throw('北京幸运28解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: '重庆时时彩',
        //     source: '360彩票网',
        //     name: 'cqssc',
        //     enable: true,
        //     timer: 'cqssc',
        //
        //     option: {
        //         host: "cp.360.cn",
        //         timeout: 50000,
        //         path: '/ssccq/',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             return getFrom360CP(str, 1);
        //         } catch (err) {
        //             throw('重庆时时彩解析数据不正确');
        //         }
        //     }
        // },
        {
            title: '江西时时彩',
            source: '官网',
            name: 'jxssc',
            enable: true,
            timer: 'jxssc',


            option: {
                host: "cp.360.cn",
                timeout: 50000,
                path: '/sscjx/',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getFrom360CP(str, 3);
                } catch (err) {
                    throw('江西时时彩解析数据不正确');
                }
            }
        },
        // {
        //     title: '新疆时时彩',
        //     source: '官网',
        //     name: 'xjssc',
        //     enable: true,
        //     timer: 'xjssc',
        //
        //     option: {
        //         host: "www.xjflcp.com",
        //         timeout: 50000,
        //         path: '/',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //
        //     parse: function (str) {
        //         return getFromXJFLCPWeb(str, 12);
        //     }
        // },
        {
            title: '福彩3D',
            source: '官网',
            name: 'fc3d',
            enable: true,
            timer: 'fc3d',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/sd/list10.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" opentime="([\d\:\- ]+?)" trycode="[\d\,]*?" tryinfo=""/;

                    if (m = str.match(reg)) {
                        return {
                            type: 9,
                            time: m[3],
                            number: m[1],
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('福彩3D解析数据不正确');
                }
            }
        },
        {
            title: '排列3',
            source: '官网',
            name: 'pai3',
            enable: true,
            timer: 'pai3',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/pls/list10.xml',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    str = str.substr(0, 300);
                    var m;
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" opentime="([\d\:\- ]+?)"/;
                    if (m = str.match(reg)) {
                        return {
                            type: 10,
                            time: m[3],
                            number: 20 + m[1],
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('排3解析数据不正确');
                }
            }
        },
        // {
        //     title: '重庆11选5',
        //     source: '官网',
        //     name: 'cq11x5',
        //     enable: true,
        //     timer: 'cq11x5',
        //
        //     option: {
        //         host: "kjh.cailele.com",
        //         timeout: 50000,
        //         path: '/kj_cq11x5.shtml',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             return getFromCaileleWeb(str, 15);
        //         } catch (err) {
        //             //throw('重庆11选5解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: '广东11选5',
        //     source: '官网',
        //     name: 'gd11x5',
        //     enable: true,
        //     timer: 'gd11x5',
        //
        //
        //     option: {
        //         host: "cp.360.cn",
        //         timeout: 50000,
        //         path: '/gd11/',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             return getFrom360CP(str, 6);
        //         } catch (err) {
        //             //throw('广东11选5解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: 'GD115',
        //     source: 'CLE',
        //     name: 'gd11x5',
        //     enable: true,
        //     timer: 'gd11x5',
        //
        //     option: {
        //         host: "www.cailele.com",
        //         timeout: 30000,
        //         path: '/static/gd11x5/newlyopenlist.xml',
        //         headers: {
        //             "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/28.0.1271.64 Safari/537.11"
        //         }
        //     },
        //
        //     parse: function (str) {
        //         try {
        //             //return getFromCaileWeb(str,6);
        //             str = str.substr(0, 200);
        //             var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" opentime="([\d\:\- ]+?)"/;
        //             //<row expect="2013071984" opencode="04,11,05,03,07" specail="" opentime="2013-07-19 23:00:15"/>
        //             var m;
        //
        //             if (m = str.match(reg)) {
        //                 return {
        //                     type: 6,
        //                     time: m[3],
        //                     number: m[1].replace(/^(\d{8})(\d{2})$/, '$1-0$2'),
        //                     data: m[2]
        //                 };
        //             }
        //         } catch (err) {
        //             throw('广东11选5解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: '江西11选5',
        //     source: '官网',
        //     name: 'jx11x5',
        //     enable: true,
        //     timer: 'jx11x5',
        //
        //     option: {
        //         host: "www.500.com",
        //         timeout: 50000,
        //         path: '/static/info/kaijiang/xml/dlc/' + getNowFormatDate() + '.xml',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             str = str.substr(0, 300);
        //             var m;
        //             var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"\/>/;
        //
        //             if (m = str.match(reg)) {
        //                 return {
        //                     type: 16,
        //                     time: m[3],
        //                     number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
        //                     data: m[2]
        //                 };
        //             }
        //         } catch (err) {
        //             throw('江西11选5解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: '江西多乐彩',
        //     source: '官网',
        //     name: 'jx11x5',
        //     enable: true,
        //     timer: 'jx11x5',
        //
        //
        //     option: {
        //         host: "cp.360.cn",
        //         timeout: 50000,
        //         path: '/dlcjx/',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //     parse: function (str) {
        //         try {
        //             return getFrom360CP(str, 16);
        //         } catch (err) {
        //             //throw('江西多乐彩解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     title: '北京PK10',
        //     source: '官网',
        //     name: 'bjpk10',
        //     enable: true,
        //     timer: 'bjpk10',
        //
        //     option: {
        //
        //         host: "www.500.com",
        //         timeout: 50000,
        //         path: '/static/info/kaijiang/xml/bjpkshi/' + getNowFormatDate() + '.xml',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
        //         }
        //     },
        //
        //     parse: function (str) {
        //         try {
        //             str = str.substr(0, 300);
        //             var m;
        //             var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" specail="" opentime="([\d\:\- ]+?)"/;
        //
        //             if (m = str.match(reg)) {
        //                 return {
        //                     type: 20,
        //                     time: m[3],
        //                     number: m[1],
        //                     data: m[2]
        //                 };
        //             }
        //         } catch (err) {
        //             throw('北京PK10解析数据不正确');
        //         }
        //     }
        // },
        {

            title: '北京PK10',
            source: '极速开奖网',
            name: 'bjpk10',
            enable: true,
            timer: 'bjpk10',

            option: {

                host: "www.pk10.me",
                timeout: 50000,
                path: '/pk10/getHistoryData?count=20&t=' + Math.random(),
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.rows[0];
                    var result = {
                        type: 20,
                        time: +new Date(m.lotteryTime),
                        number: m.termNum,
                        data: [toTen(m.n1), toTen(m.n2), toTen(m.n3), toTen(m.n4), toTen(m.n5), toTen(m.n6), toTen(m.n7), toTen(m.n8), toTen(m.n9), toTen(m.n10)].join(',')
                    };
                    return result;
                } catch (err) {
                    throw('北京PK10解析数据不正确');
                }
            }
        },
        // {
        //
        //     title: '广东十一选五-极速开奖网',
        //     source: '极速开奖网',
        //     name: 'gd11x5',
        //     enable: true,
        //     timer: 'gd11x5',
        //
        //     option: {
        //
        //         host: "www.pk10.me",
        //         timeout: 50000,
        //         path: '/gd11x5/getHistoryData?count=20&t=' + Math.random(),
        //         headers: {
        //             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
        //             "Accept": "application/json, text/javascript, */*; q=0.01",
        //             "X-Requested-With": "XMLHttpRequest"
        //         }
        //     },
        //
        //     parse: function (str) {
        //         try {
        //             var data = JSON.parse(str);
        //             var m = data.rows[0];
        //             var result = {
        //                 type: 20,
        //                 time: +new Date(m.lotteryTime),
        //                 number: m.termNum,
        //                 data: [m.n1, m.n2, m.n3, m.n4, m.n5].join(',')
        //             };
        //             return result;
        //         } catch (err) {
        //             throw('北京PK10解析数据不正确');
        //         }
        //     }
        // },
        {
            title: '北京快乐8',
            source: '官网',
            name: 'bjk8',
            enable: true,
            timer: 'bjk8',

            option: {

                host: "www.bwlc.net",
                timeout: 50000,
                path: '/bulletin/keno.html',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                try {
                    return getFromK8(str, 24);
                } catch (err) {
                    throw('解析数据不正确');
                }
            }
        },
        {
            title: '分分彩',
            source: '官网',
            name: 'ffssc',
            enable: true,
            timer: 'ffssc',
            option: {
                host: "www.jiuxinyule8.com",
                port: 80,
                timeout: 50000,
                path: '/index.php?s=/home/wufencai/info3',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13"
                }
            },
            parse: function (str) {
                try {
                    return getFromWANJINYULE(str, 35);
                } catch (err) {
                    throw('分分彩解析数据不正确');
                }
            }
        },
        {
            title: '5分彩',
            source: '官网',
            name: 'qtllc',
            enable: true,
            timer: 'qtllc',
            option: {
                host: "www.jiuxinyule8.com",
                port: 80,
                timeout: 50000,
                path: '/index.php?s=/home/wufencai/info',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getFromWANJINYULE(str, 14);
                } catch (err) {
                    throw('5分彩解析数据不正确');
                }
            }
        },
        {
            title: '上海时时乐',
            source: '盈丰开奖网',
            name: 'shssl',
            enable: true,
            timer: 'shssl',

            option: {
                host: "www.yfcpw.com",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/Open/CurrentOpen?code=10015&_=' + Math.random(),
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept": "application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.list[0];
                    var c = m.c_d.split(' ');
                    var d = '2017 ' + c[0] + ' ' + c[6];
                    var n1 = m.c_t.toString();
                    var number = n1.slice(0, 8) + '-0' + n1.slice(8);
                    var result = {
                        type: 7,
                        time: +new Date(d),
                        number: number,
                        data: m.c_r
                    };
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('时时乐解析数据不正确');
                }
            }
        },
        // {
        //     title: '山东11选5',
        //     source: '盈丰开奖网',
        //     name: 'sd11x5',
        //     enable: true,
        //     timer: 'sd11x5',
        //
        //     option: {
        //         host: "www.yfcpw.com",
        //         timeout: 50000,
        //         // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
        //         path: '/Open/CurrentOpen?code=1003&_=' + Math.random(),
        //         headers: {
        //             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
        //             "Accept": "application/json, text/javascript, */*; q=0.01",
        //             "X-Requested-With": "XMLHttpRequest"
        //         }
        //     },
        //
        //     parse: function (str) {
        //         try {
        //             var data = JSON.parse(str);
        //             var m = data.list[0];
        //             var c = m.c_d.split(' ');
        //             var d = '2017 ' + c[0] + ' ' + c[6];
        //             var n1 = m.c_t.toString();
        //             var number = '20' + n1.slice(0, 6) + '-0' + n1.slice(6);
        //             var result = {
        //                 type: 8,
        //                 time: +new Date(d),
        //                 number: number,
        //                 data: m.c_r
        //             };
        //             console.log(result);
        //             return result;
        //         } catch (err) {
        //             console.log(err);
        //             throw('山东11选5解析数据不正确');
        //         }
        //     }
        // },
        // {
        //     data: {
        //         'content': '23|1|1|10|',
        //         'rand': +(new Date()),
        //         'command': 'lottery_request_transmit'
        //     },
        //     title: '重庆时时彩',
        //     source: 'PPP-风采',
        //     name: 'cqssc',
        //     enable: true,
        //     timer: 'cqssc',
        //     option: {
        //         host: "www.cq8848.com",
        //         timeout: 50000,
        //         method: 'POST',
        //         path: '/proxy',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
        //         },
        //     },
        //
        //
        //     parse: function (str) {
        //         try {
        //             var b = str.split('^!^10|');
        //             var c = b[1].split('|||');
        //             var d = c[0].split('|');
        //
        //             var result = {
        //                 type: 1,
        //                 time: +new Date(),
        //                 number: d[1],
        //                 data: d[2]
        //             };
        //             console.log(result);
        //             return result;
        //         } catch (err) {
        //             throw('重庆时时彩解析不正确');
        //         }
        //     }
        // },
        {
            data: {
                'content': '23|1|50|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '北京28',
            source: 'PPP-风采',
            name: 'bj28',
            enable: true,
            timer: 'bj28',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 50,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    }

                    console.log(result);
                    return result;
                } catch (err) {
                    throw('北京28解析不正确');
                }
            }
        },
        {
            data: {
                'content': '23|1|46|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '北京五分彩',
            source: 'PPP-风采',
            name: 'bj5f',
            enable: true,
            timer: 'bj5f',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 63,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    }

                    console.log(result);
                    return result;
                } catch (err) {
                    throw('北京五分彩解析不正确');
                }
            }
        },
        {
            data: {
                'content': '23|1|47|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '韩国1.5分彩',
            source: 'PPP-风采',
            name: 'hg1.5',
            enable: true,
            timer: 'hg1.5',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 60,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('韩国1.5分彩解析不正确');
                }
            }
        },
        {
            data: {
                'content': '23|1|48|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '加拿大3.5分彩',
            source: 'PPP-风采',
            name: 'jnd3.5',
            enable: true,
            timer: 'jnd3.5',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 61,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('加拿大3.5分彩解析不正确');
                }
            }
        },
        {
            data: {
                'content': '23|1|49|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '台湾5分彩',
            source: 'PPP-风采',
            name: 'tw5',
            enable: true,
            timer: 'tw5',
            option: {
                host: "www.11cp11.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 62,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('台湾5分彩解析不正确');
                }
            }
        },
        {
            data: {
                'content': '23|1|49|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '台湾5分彩',
            source: 'PPP-风采',
            name: 'tw5',
            enable: true,
            timer: 'tw5',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 62,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('台湾5分彩解析不正确');
                }
            }
        },
        // {
        //     data: {
        //         'content': '23|1|10|10|',
        //         'rand': +(new Date()),
        //         'command': 'lottery_request_transmit'
        //     },
        //     title: '山东11选5',
        //     source: 'PPP-风采',
        //     name: 'sd11x5',
        //     enable: true,
        //     timer: 'sd11x5',
        //     option: {
        //         host: "www.fengcai66.com",
        //         timeout: 50000,
        //         method: 'POST',
        //         path: '/proxy',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
        //         },
        //     },
        //
        //
        //     parse: function (str) {
        //         try {
        //             console.log(str);
        //             var b = str.split('^!^10|');
        //             var c = b[1].split('|||');
        //             var d = c[0].split('|');
        //
        //             var result = {
        //                 type: 8,
        //                 time: +new Date(),
        //                 number: d[1],
        //                 data: d[2]
        //             };
        //             console.log(result);
        //             return result;
        //         } catch (err) {
        //             throw('重庆时时彩解析不正确');
        //         }
        //     }
        // },
        {
            data: {
                'content': '23|1|27|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: 'PK10',
            source: 'PPP-风采',
            name: 'pk10',
            enable: true,
            timer: 'pk10',
            option: {
                host: "www.cq8848.com",
                timeout: 50000,
                method: 'POST',
                path: '/proxy',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
                },
            },


            parse: function (str) {
                try {
                    console.log(str);
                    var b = str.split('^!^10|');
                    var c = b[1].split('|||');
                    var d = c[0].split('|');

                    var result = {
                        type: 20,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('pk10解析不正确');
                }
            }
        },
        // {
        //     data: {
        //         'content': '23|1|10|10|',
        //         'rand': +(new Date()),
        //         'command': 'lottery_request_transmit'
        //     },
        //     title: '山东11选5',
        //     source: 'PPP-风采',
        //     name: 'sd11x5',
        //     enable: true,
        //     timer: 'sd11x5',
        //     option: {
        //         host: "www.cq8848.com",
        //         timeout: 50000,
        //         method: 'POST',
        //         path: '/proxy',
        //         headers: {
        //             "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)",
        //         },
        //     },
        //
        //
        //     parse: function (str) {
        //         try {
        //             console.log(str);
        //             var b = str.split('^!^10|');
        //             var c = b[1].split('|||');
        //             var d = c[0].split('|');
        //
        //             var result = {
        //                 type: 8,
        //                 time: +new Date(),
        //                 number: d[1],
        //                 data: d[2]
        //             };
        //             console.log(result);
        //             return result;
        //         } catch (err) {
        //             throw('重庆时时彩解析不正确');
        //         }
        //     }
        // },
        {
            title: '广东11选5',
            source: '开彩网',
            name: 'gd11x5',
            enable: true,
            timer: 'gd11x5',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=gd11x5&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 6,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0,8) + '-0' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('广东11选5-解析数据不正确');
                }
            }
        },
        {
            title: '山东11选5',
            source: '开彩网',
            name: 'sd11x5',
            enable: true,
            timer: 'sd11x5',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=sd11x5&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 8,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0,8) + '-0' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('山东11选5-解析数据不正确');
                }
            }
        },
        {
            title: '江苏快三',
            source: '开彩网',
            name: 'jsk3',
            enable: true,
            timer: 'jsk3',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=jsk3&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 25,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('江苏快三-解析数据不正确');
                }
            }
        },
        {
            title: '广东快乐十分',
            source: '开彩网',
            name: 'gdklsf',
            enable: true,
            timer: 'gdklsf',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=gdklsf&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 17,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('广东快乐十分-解析数据不正确');
                }
            }
        },
        {
            title: '天津快乐十分',
            source: '开彩网',
            name: 'tjklsf',
            enable: true,
            timer: 'tjklsf',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=tjklsf&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 18,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('广东快乐十分-解析数据不正确');
                }
            }
        },
        {
            title: '重庆时时彩',
            source: '开彩网',
            name: 'cqssc',
            enable: true,
            timer: 'cqssc',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=cqssc&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 1,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('重庆时时彩-解析数据不正确');
                }
            }
        },
        {
            title: '天津时时彩',
            source: '开彩网',
            name: 'tjssc',
            enable: true,
            timer: 'tjssc',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=tjssc&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 2,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('天津时时彩-解析数据不正确');
                }
            }
        },
        {
            title: '新疆时时彩',
            source: '开彩网',
            name: 'xjssc',
            enable: true,
            timer: 'xjssc',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=xjssc&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 12,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('新疆时时彩-解析数据不正确');
                }
            }
        },
        {
            title: 'PK10',
            source: '开彩网',
            name: 'pk10',
            enable: true,
            timer: 'pk10',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=bjpk10&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 20,
                        time: +new Date(m.opentime),
                        number: m.expect,
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('北京PK10-解析数据不正确');
                }
            }
        },
        {
            title: '上海时时乐',
            source: '开彩网',
            name: 'shssl',
            enable: true,
            timer: 'shssl',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=shssl&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 7,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0, 8) + '-0' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('北京PK10-解析数据不正确');
                }
            }
        },
        {
            title: '福彩3D',
            source: '开彩网',
            name: 'fc3d',
            enable: true,
            timer: 'fc3d',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=fc3d&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 9,
                        time: +new Date(m.opentime),
                        number: m.expect,
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('福彩3D-解析数据不正确');
                }
            }
        },
        {
            title: '排列3',
            source: '开彩网',
            name: 'pl3',
            enable: true,
            timer: 'pl3',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=pl3&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 10,
                        time: +new Date(m.opentime),
                        number: m.expect,
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('福彩3D-解析数据不正确');
                }
            }
        },
        {
            title: '排列5',
            source: '开彩网',
            name: 'pl5',
            enable: true,
            timer: 'pl5',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=pl5&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 11,
                        time: +new Date(m.opentime),
                        number: m.expect,
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('排列5-解析数据不正确');
                }
            }
        },
    ];

} else {
    exports.cp = [
        {
            title: '山东11选5',
            source: '开彩网',
            name: 'sd11x5',
            enable: true,
            timer: 'sd11x5',

            option: {
                host: "c.apiplus.net",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/newly.do?token=bec0b2b7621dda45&code=sd11x5&format=json',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
                    "Accept":"application/json, text/javascript, */*; q=0.01",
                    "X-Requested-With": "XMLHttpRequest"
                }
            },

            parse: function (str) {
                try {
                    var data = JSON.parse(str);
                    var m = data.data[0];
                    var result = {
                        type: 8,
                        time: +new Date(m.opentime),
                        number: m.expect.slice(0,8) + '-0' + m.expect.slice(8),
                        data: m.opencode
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    console.log(err);
                    throw('山东11选5-解析数据不正确');
                }
            }
        },
    ];
}
