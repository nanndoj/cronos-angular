// Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'Cronos' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'cronos.controllers' is found in controllers.js
var app = (function() {
    // 'cronos.dataset' is found in /components/js/dataset.js
    return angular.module('Cronos', [
    	'ngRoute',
      'ngResource',
      'ngSanitize',
	    'cronos.controllers', ,
	    'cronos.dataset'
    ])
    .config(['$routeProvider', function($routeProvider) {
  	    // Route
        $routeProvider.
          when('/home', {
            templateUrl: 'views/home.html',
        }).
    
        // Default route
         otherwise({
            redirectTo: '/home'
         });
    }]);
}(window));