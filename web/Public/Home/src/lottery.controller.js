(function () {
    'use strict';

    angular
        .module('lottery.controller', [])
        .controller('LotteryCtrl', LotteryCtrl);
    /* @ngInject*/
    LotteryCtrl.$inject = ['$scope'];

    function LotteryCtrl($scope) {
        $scope.data = {reIndex: 1};
        $scope.BettingRecord = BettingRecord;

        function BettingRecord(type) {
            $scope.data.reIndex = type;
                    $scope.$$phase || $scope.$digest();
        }
    }
})();



