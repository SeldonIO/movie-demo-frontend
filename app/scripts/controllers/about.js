'use strict';

/**
 * @ngdoc function
 * @name movielensApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the movielensApp
 */
angular.module('movielensApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });


angular.module('movielensApp')
    .controller('IndexCtrl',  ['$scope', '$location',function($scope, $location) {
        console.log("hey0");
        $scope.navClass = function (page) {
            var currentRoute = $location.path().substring(1) || 'demo';
            return page === currentRoute ? 'active' : '';
        };

    }]);
