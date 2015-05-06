'use strict';

/**
 * @ngdoc overview
 * @name movielensApp
 * @description
 * # movielensApp
 *
 * Main module of the application.
 */
angular
    .module('movielensApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'Seldon'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            })
            .when('/users', {
                templateUrl: 'views/users.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });


var seldonAPI = angular.module('Seldon', ['ngResource']);


seldonAPI.factory('Seldon', ['$http','$q',
    function($http, $q){
        var prefix = "";
        var host = "";
        var consumer_key = "tnedddvlho";
        var consumer_key2 = 'uggyecofcz';
        var consumer_secret = "lzufhqbomz";
        var _access_token;

        var getAccessToken = function() {
            var endpoint = "/token";

            var params = {
                'consumer_key': consumer_key,
                'consumer_secret': consumer_secret,
                'jsonpCallback': 'JSON_CALLBACK'
            };

            var def = $q.defer();


            $http.jsonp(prefix+host+endpoint, {'params':params}).success(function(response) {
                console.log(response);
                _access_token = response.access_token;

                def.resolve(response);
            });
            return def.promise;
        };

        var asyncAPICall = function(endpoint,params) {
            var def = $q.defer();
            console.log(endpoint);
            console.log(params);

            $http.jsonp(prefix+host+endpoint, {'params':params}).success(function(data, status, headers, config) {
                // console.log(headers('Location'));
                def.resolve(data);
            });
            return def.promise;
        };

        return {
            getAccessToken: function(){
                return getAccessToken();
            },
            searchItem: function(name){

                var endpoint = "/token";

                var params = {
                    'consumer_key': consumer_key,
                    'consumer_secret': consumer_secret,
                    'jsonpCallback': 'JSON_CALLBACK',
                };

                var def = $q.defer();

                $http.jsonp(prefix+host+endpoint, {'params':params}).success(function(response) {
                    console.log(response);
                    _access_token = response.access_token;

                    return response;
                }).then(function(response) {

                    endpoint = "/items";

                    params = {
                        'oauth_token': _access_token,
                        'consumer_key': consumer_key,
                        'consumer_secret': consumer_secret,
                        'jsonpCallback': 'JSON_CALLBACK',
                        'full': 'true',
                        'name': name
                    };

                    $http.jsonp(prefix+host+endpoint, {'params':params}).success(function(response) {
                        def.resolve(response);
                    });

                });

                return def.promise;

            },
            addUserAction: function(user_id, item_id) {

                var endpoint = "/js/action/new";

                var params = {
                    'consumer_key': consumer_key2,
                    // 'consumer_secret': consumer_secret,
                    'type': '1',
                    'jsonpCallback': 'JSON_CALLBACK',
                    'user':user_id,
                    'item':item_id,
                    'timestamp': Date.now()
                };

                return asyncAPICall(endpoint,params);

            },
            getRecentItems: function(user_id) {
                var deferred = $q.defer();
                this.getRecentActions(user_id).then(
                    function(resp){
                        var items = [];
                        var acts = resp['list'];

                        var urlCalls = [];
                        var endpoint = "/items/";

                        var params = {
                            'oauth_token': _access_token,
                            'jsonpCallback': 'JSON_CALLBACK',
                            'full': 'true'
                        };

                        angular.forEach(acts, function(act) {
                            urlCalls.push($http.jsonp(prefix+host+endpoint +act['item'],{'params':params}));
                        });
                        $q.all(urlCalls)
                            .then(
                            function(results) {
                                deferred.resolve(results);
                            },
                            function(errors) {
                                deferred.reject(errors);
                            },
                            function(updates) {
                                deferred.update(updates);
                            });

                    },
                    function(error){
                        console.log("ERROR, " + error);
                        return {}
                    }

                );
                return deferred.promise;
            },

            getRecentActions: function(user_id) {

                var endpoint = "/users/" + user_id + "/actions";
                var params = {
                    'oauth_token': _access_token,
                    // 'consumer_secret': consumer_secret,
                    'jsonpCallback': 'JSON_CALLBACK',
                    'user':user_id,
                    'limit':'50'
                };

                return asyncAPICall(endpoint,params);

            },
            getRecommendations: function(algorithms, user_id, item_id) {

                var endpoint = "/js/recommendations";
                var params = {
                    'consumer_key': consumer_key2,
                    'user': user_id,
                    'attributes': 'title,img_url,genre1',
                    // 'consumer_secret': consumer_secret,
                    'jsonpCallback': 'JSON_CALLBACK',
                    'item': item_id, // do we need to include an item?
                    'limit':'10',
                    'algorithms': algorithms,
                };

                return asyncAPICall(endpoint,params);

            },
            addUser: function(user_id) {

                var endpoint = "/js/user/new";

                var params = {
                    'consumer_key': consumer_key2,
                    'user':user_id,
                    'jsonpCallback': 'JSON_CALLBACK'
                };

                return asyncAPICall(endpoint,params);
            }
        }
    }]);

