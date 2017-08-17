var data = 'INSERT INTO `gygy_data_time` (`type`, `actionNo`, `actionTime`, `stopTime`) VALUES ';
var type = 62;
var len = 203;
var startTime = '07:05:00';
var diffTime = 5 * 60 * 1000;

for (var i = 0; i < len; i++) {
    var _timer = new Date(new Date('2017-02-18 ' + startTime) - 0 + i * diffTime);
    var hour = _timer.getHours();
    var minute = _timer.getMinutes();
    var sec = _timer.getSeconds();

    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }

    var timer = hour + ':' + minute + ':' + sec;
    var sql = "('" + type + "', '" + (parseInt(i) + 1) + "', '" + timer + "', '" + timer + "'), ";
    data += sql;
    console.log(sql);
}
data = data.slice(0, data.length - 2) + ';';
console.log(data);
