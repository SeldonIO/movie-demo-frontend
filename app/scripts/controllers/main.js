'use strict';

/**
 * @ngdoc function
 * @name movielensApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the movielensApp
 */
angular.module('movielensApp')
    .controller('MainCtrl', function ($scope, $http, $resource, $q, Seldon, $cookieStore, $timeout) {

        var INTRO_MESSAGE="This demo is example of the recommender algorithms provided by Seldon, trained on the open MovieLens dataset. Start by searching for a movie that you like...";

        $scope.host = "";
        $scope.consumer_key = "tnedddvlho";
        $scope.consumer_secret = "lzufhqbomz";
        $scope.access_token = "5c0rkho6ucmrb6h5qhjb1vo49";
        $scope.leadMessage=INTRO_MESSAGE;
        $scope.info_message="Now you can like some movies to build up a profile.";
        $scope.failed_search_message="No matching movies found. Note only movies before 2010 are in the database.";
        $scope.failed_rec_message="No recommendations returned for this algorihtm. Try liking another movie or trying a different algorithm.";
        $scope.mfActivated = '';
        $scope.simActivated = '';
        $scope.semActivated = '';
        $scope.wordActivated = '';
        $scope.topActivated = '';
        $scope.recResults='';
        $scope.searchedBefore = false;
        var user_id = ""; // update the text box
        var EMBEDLY_URL_PREFIX= "http://i.embed.ly/1/display/resize?key=<EMBEDLY_KEY_HERE>&url=";

        var secondaryLeadMessage = "Add more films to increase the accuracy of the predictions...";
        var generateUUID = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        var fillInMissingImages = function(data) {
            angular.forEach(data, function(movie){
                if(movie.data){
                    movie = movie.data;
                }
                if(movie['attributesName'] && !movie['attributesName']['img_url']){
                    movie['attributesName']['img_url'] = 'images/check.gif';
                }

            });
        };

        var rewriteImageUrlForEmbedly = function(data){
            angular.forEach(data, function(movie) {
                if (movie.data) {
                    movie = movie.data;
                }
                if (movie['attributesName'] && movie['attributesName']['img_url']) {
                    movie['attributesName']['img_url'] = EMBEDLY_URL_PREFIX + encodeURIComponent(movie['attributesName']['img_url']);
                }
            });
        };


        var getUserId = function() {
            var userIdLocal = $cookieStore.get("userId");
            if (!userIdLocal || userIdLocal == ""){
                userIdLocal = generateUUID();
                $cookieStore.put("userId",userIdLocal);
            }
            user_id = userIdLocal;
            $scope.current_user = user_id;
        };

        var setUserId = function(userId) {
            $cookieStore.put("userId",userId);
        };

        var getAccessToken = function() {
            Seldon.getAccessToken().then(function(response){

                Seldon.getRecentItems(user_id).then(function(movies){
                    console.log(movies);
                    rewriteImageUrlForEmbedly(movies);
                    fillInMissingImages(movies);

                    $scope.watched = movies;
                    if(movies && movies.length > 0){
                        jQuery("#watched").show();
                        jQuery("#user-history-algs-section").show();
                        jQuery("#searched-movies").show();
                        $scope.leadMessage = secondaryLeadMessage;
                    }
                });

            });
        };


        $scope.changeUser = function() {
            $scope.movies = null;
            $scope.search_title = null;
            user_id = $scope.current_user;
            setUserId(user_id);
            getAccessToken();
            console.log("new user: " + user_id);
            $scope.success_message = "Changed the active user to " + user_id;

        };

        $scope.resetUser = function() {
            $scope.current_user = $scope.movies =  $scope.search_title = null;
            $scope.recResults = 'no-display';
            $scope.watched = [];
            $scope.leadMessage=INTRO_MESSAGE;
            jQuery('#watched').hide();
            jQuery("#user-history-algs-section").hide();
            jQuery("#searched-movies").hide();
            $cookieStore.remove("userId");
            getUserId();
        };

        $scope.searchMovies = function() {

            Seldon.searchItem($scope.search_movie).then(function(movies){
                console.log(movies);
                rewriteImageUrlForEmbedly(movies.list);
                fillInMissingImages(movies.list);
                $scope.movies = movies;
		$scope.recAlert = 'no-display'
                if(movies && movies.list.length > 0) {
                    $scope.searchAlert = 'no-display';
                    jQuery("#searched-movies").show();
                    if ($scope.searchedBefore) {
                        $scope.infoAlert = 'no-display'
                    } else {
                        $scope.searchedBefore = true;
                        $scope.infoAlert = 'should-display';
                    }
                    $scope.searchResultsClass = 'should-display';
                    $scope.recsResult = 'no-display'
                    $scope.deactivateAlgButton();
                    jQuery('html, body').delay(100).animate({
                        scrollTop: jQuery("#searched-movies").offset().top
                    }, 300);
                }
		else
		{
                  jQuery("#searched-movies").hide();
		  $scope.searchAlert = 'should-display'
		  $scope.infoAlert = 'no-display'
		}
            });

            $scope.search_title = "Search results for \"" + $scope.search_movie+"\"";

            // $http.get('json/searchmovies.json').success(function(data){
            // 	$scope.movies = data;
            // 	console.log($scope.movies);
            // });

        };

        $scope.addUserAction = function(item_id) {
            console.log(item_id);

            Seldon.addUserAction(user_id, item_id).then(function(response){
                console.log(response);
//                jQuery('.alert').show();
                jQuery("#user-history-algs-section").show();
                jQuery('#watched').show();
            })
                .then(function(response) {
                    $timeout(function () {
                        Seldon.getRecentItems(user_id).then(function (movies) {
                            if ($scope.watched.length == 0) {
//                            $scope.likeAddedAlert = 'should-display';
                                $scope.likeAddedAlert = 'no-display';
                                $scope.success_message = "You've added a user action - i.e. told the algorithm you watched movie ID " + item_id +
                                    " Now add more movies that you like or get recommendations below.";
                            } else {
                                $scope.likeAddedAlert = 'no-display';
                            }
                            $scope.getRecommendations('recommenders:RECENT_MATRIX_FACTOR,num_recent_actions:1', item_id);
                            $scope.activateAlgButton('mfActivated');
                            console.log(movies);
                            rewriteImageUrlForEmbedly(movies);
                            fillInMissingImages(movies);
                            $scope.watched = movies;
                            $scope.leadMessage = secondaryLeadMessage;
                        })
                    },200);
                });
        };

        $scope.getRecentActions = function(action) {
            console.log(action);
        };

        $scope.getSimilarItems = function(items) {
            console.log(item);
        };

        $scope.getSemanticVectorsItem = function(item) {
            console.log(item);
        };

        $scope.getSemanticVectorsRecentItems = function(items) {
            console.log(items);
        };

        $scope.activateAlgButton = function(name){
            $scope.mfActivated = '';
            $scope.simActivated = '';
            $scope.semActivated = '';
            $scope.wordActivated = '';
            $scope.topActivated = '';
            $scope[name] = 'active'
        };

        $scope.deactivateAlgButton = function(){
            $scope.mfActivated = '';
            $scope.simActivated = '';
            $scope.semActivated = '';
            $scope.wordActivated = '';
            $scope.topActivated = '';
        };

        $scope.getRecommendations = function(algorithms, item_id) {

            // var algorithsm = {
            //   'SIMILAR'
            // }

            $scope.isCollapsed = false;

            $scope.movies = null;
            $scope.search_title = "Recommendations using " + algorithms;

            if(item_id == undefined) {
                item_id = "";
            } else {
                $scope.search_title += " and item " + item_id;
            }

            console.log(algorithms);
            console.log(item_id);

            Seldon.getRecommendations(algorithms, user_id, item_id).then(function(movies){
                console.log(movies);
                jQuery("#searched-movies").show();
                $scope.searchAlert = 'no-display'
                $scope.searchResultsClass = 'no-display';
                $scope.infoAlert = 'no-display';
                if(movies && movies.list.length > 0) 
		{
		    $scope.recAlert = 'no-display'
                    rewriteImageUrlForEmbedly(movies.list);
                    fillInMissingImages(movies.list);
                    $scope.movies = movies;
                    $scope.recResults = 'should-display'
		}
		else
		{
		    $scope.recAlert = 'should-display'
		}
                jQuery('html, body').delay(100).animate({
                    scrollTop: jQuery("#user-history-algs-section").offset().top
                }, 300);
            });
        };
        getUserId();
        getAccessToken();
        $("#movie-search-box").keyup(function() {
            var empty = $("#movie-search-box").val() == "";
            jQuery("#movie-search-button").prop('disabled', empty);

        });
        function unused(data) {
            $scope.movies = data;
            console.log($scope.movies);
        }

    });
