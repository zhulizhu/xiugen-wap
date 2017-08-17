var IS_DEBUG = false;
if (IS_DEBUG) {
    exports.cp = [
        {
            data: {
                'content': '23|1|1|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '重庆时时彩',
            source: 'PPP-风采',
            name: 'cqssc',
            enable: true,
            timer: 'cqssc',
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
                        type: 1,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('重庆时时彩解析不正确');
                }
            }
        },
    ];
} else {
// 彩票开奖配置
    exports.cp = [
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
        {
            title: '山东11选5',
            source: '500wan',
            name: 'sd11x5',
            enable: true,
            timer: 'sd11x5',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/shdsyxw/' + getNowFormatDate() + '.xml',
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
                            type: 8,
                            time: m[3],
                            number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('山东11选5解析数据不正确');
                }
            }
        },
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
        {
            title: '北京幸运28',
            source: '开放平台',
            name: 'luckbj',
            enable: true,
            timer: 'luckbj',

            option: {
                host: "open.yike1908.com",
                timeout: 50000,
                path: '/api/thinkphp/index.php/Home/Api',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getLuckBj(str, 50);
                } catch (err) {
                    throw('北京幸运28解析数据不正确');
                }
            }
        },
        {
            title: '重庆时时彩',
            source: '360彩票网',
            name: 'cqssc',
            enable: true,
            timer: 'cqssc',

            option: {
                host: "cp.360.cn",
                timeout: 50000,
                path: '/ssccq/',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getFrom360CP(str, 1);
                } catch (err) {
                    throw('重庆时时彩解析数据不正确');
                }
            }
        },
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
        {
            title: '新疆时时彩',
            source: '官网',
            name: 'xjssc',
            enable: true,
            timer: 'xjssc',

            option: {
                host: "www.xjflcp.com",
                timeout: 50000,
                path: '/',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },

            parse: function (str) {
                return getFromXJFLCPWeb(str, 12);
            }
        },
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
        {
            title: '广东11选5',
            source: '官网',
            name: 'gd11x5',
            enable: true,
            timer: 'gd11x5',


            option: {
                host: "cp.360.cn",
                timeout: 50000,
                path: '/gd11/',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getFrom360CP(str, 6);
                } catch (err) {
                    //throw('广东11选5解析数据不正确');
                }
            }
        },
        {
            title: 'GD115',
            source: 'CLE',
            name: 'gd11x5',
            enable: true,
            timer: 'gd11x5',

            option: {
                host: "www.cailele.com",
                timeout: 30000,
                path: '/static/gd11x5/newlyopenlist.xml',
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/28.0.1271.64 Safari/537.11"
                }
            },

            parse: function (str) {
                try {
                    //return getFromCaileWeb(str,6);
                    str = str.substr(0, 200);
                    var reg = /<row expect="(\d+?)" opencode="([\d\,]+?)" opentime="([\d\:\- ]+?)"/;
                    //<row expect="2013071984" opencode="04,11,05,03,07" specail="" opentime="2013-07-19 23:00:15"/>
                    var m;

                    if (m = str.match(reg)) {
                        return {
                            type: 6,
                            time: m[3],
                            number: m[1].replace(/^(\d{8})(\d{2})$/, '$1-0$2'),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('广东11选5解析数据不正确');
                }
            }
        },
        {
            title: '江西11选5',
            source: '官网',
            name: 'jx11x5',
            enable: true,
            timer: 'jx11x5',

            option: {
                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/dlc/' + getNowFormatDate() + '.xml',
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
                            type: 16,
                            time: m[3],
                            number: '20' + m[1].slice(0, 6) + '-' + '0' + m[1].slice(6),
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('江西11选5解析数据不正确');
                }
            }
        },
        {
            title: '江西多乐彩',
            source: '官网',
            name: 'jx11x5',
            enable: true,
            timer: 'jx11x5',


            option: {
                host: "cp.360.cn",
                timeout: 50000,
                path: '/dlcjx/',
                headers: {
                    "User-Agent": "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)"
                }
            },
            parse: function (str) {
                try {
                    return getFrom360CP(str, 16);
                } catch (err) {
                    //throw('江西多乐彩解析数据不正确');
                }
            }
        },
        {
            title: '北京PK10',
            source: '官网',
            name: 'bjpk10',
            enable: true,
            timer: 'bjpk10',

            option: {

                host: "www.500.com",
                timeout: 50000,
                path: '/static/info/kaijiang/xml/bjpkshi/' + getNowFormatDate() + '.xml',
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
                            type: 20,
                            time: m[3],
                            number: m[1],
                            data: m[2]
                        };
                    }
                } catch (err) {
                    throw('北京PK10解析数据不正确');
                }
            }
        },
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
        {

            title: '广东十一选五-极速开奖网',
            source: '极速开奖网',
            name: 'gd11x5',
            enable: true,
            timer: 'gd11x5',

            option: {

                host: "www.pk10.me",
                timeout: 50000,
                path: '/gd11x5/getHistoryData?count=20&t=' + Math.random(),
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
                        data: [m.n1, m.n2, m.n3, m.n4, m.n5].join(',')
                    };
                    return result;
                } catch (err) {
                    throw('北京PK10解析数据不正确');
                }
            }
        },
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
            title: '2分彩',
            source: '官网',
            name: 'efssc',
            enable: true,
            timer: 'efssc',
            option: {
                host: "ssc.yike1908.com",
                port: 8000,
                timeout: 50000,
                path: '/index.php?s=/home/wufencai/info2',
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows; U; Windows NT 5.2) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13"
                }
            },
            parse: function (str) {
                try {
                    return getFromWANJINYULE(str, 34);
                } catch (err) {
                    throw('5分彩解析数据不正确');
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
                host: "ssc.yike1908.com",
                port: 8000,
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
        {
            title: '山东11选5',
            source: '盈丰开奖网',
            name: 'sd11x5',
            enable: true,
            timer: 'sd11x5',

            option: {
                host: "www.yfcpw.com",
                timeout: 50000,
                // path: '/static/public/ssl/xml/qihaoxml/' + getNowFormatDate() + '.xml',
                path: '/Open/CurrentOpen?code=1003&_=' + Math.random(),
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
                    var number = '20' + n1.slice(0, 6) + '-0' + n1.slice(6);
                    var result = {
                        type: 8,
                        time: +new Date(d),
                        number: number,
                        data: m.c_r
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
            data: {
                'content': '23|1|1|10|',
                'rand': +(new Date()),
                'command': 'lottery_request_transmit'
            },
            title: '重庆时时彩',
            source: 'PPP-风采',
            name: 'cqssc',
            enable: true,
            timer: 'cqssc',
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
                        type: 1,
                        time: +new Date(),
                        number: d[1],
                        data: d[2]
                    };
                    console.log(result);
                    return result;
                } catch (err) {
                    throw('重庆时时彩解析不正确');
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
                    throw('台湾5分彩解析不正确');
                }
            }
        },
    ];

}
