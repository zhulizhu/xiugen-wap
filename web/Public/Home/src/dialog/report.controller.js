(function () {
    'use strict';

    angular
        .module('report.controller', [])
        .controller('ReportCtrl', ReportCtrl);
    /* @ngInject*/
    ReportCtrl.$inject = ['$scope'];
    /* @ngInject*/

    function ReportCtrl($scope) {
        $scope.data = {
            type: 1
        }
    }
})();



