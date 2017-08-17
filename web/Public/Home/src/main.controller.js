(function () {
    'use strict';

    angular
        .module('main.controller', [])
        .controller('MainCtrl', MainCtrl);
    /* @ngInject*/
    MainCtrl.$inject = ['$scope'];

    function MainCtrl($scope) {
        var token = '';
        headHover();
        choseNav();
        gameShowChange();
        swiperImg();
        changeDownload();
        changeNoticeNav(1);
        changeNoticeType();

        //首页轮播图
        yikeYbc.changeBanner()
            .then(function (data) {
                $scope.banner = data.result.banner;
                $scope.$digest();
                Caroursel.init($('.caroursel'));
            });

        //banner图下面的小图切换效果
        $scope.slotImg = slotImg;
        function slotImg() {
            play.cozyTip("<p class='cozy-tip'>暂未开放，敬请期待！</p>");
        }

        //首页通知公告列表
        $scope.changeNoticeNav = changeNoticeNav;
        function changeNoticeNav(type) {
            yikeYbc.noticeList(token, type)
                .then(function (data) {
                    $scope.noticeList = data.result.result;
                    $scope.$digest();
                });
        }

        //首页通知公告列表详情
        $scope.noticeListDetails = noticeListDetails;
        function noticeListDetails(noticeId) {
            yikeYbc.noticeListDetails(token, noticeId).then(function (data) {
                play.noticeListPop();
                $scope.popNoticeList = data.result.result;
                $scope.listId = data.result.result.id;
                $scope.$digest();
            });
        }

        //首页通知公告列表详情切
        $scope.changeNoticeDetails = changeNoticeDetails;
        function changeNoticeDetails(noticeId) {
            yikeYbc.noticeListDetails(token, noticeId).then(function (data) {
                $scope.popNoticeList = data.result.result;
                $scope.listId = data.result.result.id;
                $scope.$digest();
            });
        }
    }
})();



