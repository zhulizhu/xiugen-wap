var later = require('later');
var execFile = require('child_process').exec,
    child;
later.date.localTime();

console.log("Now:"+new Date());

var sched = later.parse.recur().every(1).hour(),
    t = later.setInterval(function() {
        test(5);
    }, sched);

function test() {
    console.log(new Date());
    child = execFile('pm2 restart data', function(error, stdout, stderr){
        if (error == null) {
            console.error('运行啦！！！！！');
            console.error('stdout: ' + stdout);
        } else {
            console.error('出错啦！！！！！');
            console.error('stderr: ' + error);
            console.error('stderr: ' + stderr);
        }
    });
}