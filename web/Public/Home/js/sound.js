function down_sound() {

        var ua = navigator.userAgent.toLowerCase();
        var ring = "/Public/Home/sound/cash.mp3";
        var c = $('#player_sound');
        if (ua.match(/msie ([\d.]+)/)) { //ie
            c.html('<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95"><param name="AutoStart" value="1" /><param name="Src" value="' + ring + '" /></object>');
        } else if (ua.match(/firefox\/([\d.]+)/)) {
            c.html('<audio src=' + ring + ' type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
        } else if (ua.match(/chrome\/([\d.]+)/)) {
            c.html('<audio src=' + ring + ' type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
        } else if (ua.match(/opera.([\d.]+)/)) {
            c.html('<embed src=' + ring + ' hidden="true" loop="false"><noembed><bgsounds src=' + ring + '></noembed>');
        } else if (ua.match(/version\/([\d.]+).*safari/)) {
            c.html('<audio src=' + ring + ' type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
        } else {
            c.html('<audio src=' + ring + ' type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
        }
    };