(function () {
    'use strict';

    angular
        .module('team.controller', [])
        .controller('TeamCtrl', TeamCtrl);
    /* @ngInject*/
    TeamCtrl.$inject = ['$scope'];
    /* @ngInject*/

    function TeamCtrl($scope) {
        $scope.data = {
            type: 1
        }
    }
})();



