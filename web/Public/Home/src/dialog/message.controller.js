(function () {
    'use strict';

    angular
        .module('message.controller', [])
        .controller('MessageCtrl', MessageCtrl);
    /* @ngInject*/
    MessageCtrl.$inject = ['$scope'];
    /* @ngInject*/

    function MessageCtrl($scope) {
        $scope.data = {
            type: 1
        }
    }
})();



