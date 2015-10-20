'use strict';
/*
var oauthSignature = require('oauth-signature');  
var n = require('nonce')();  
var request = require('request');  
var qs = require('querystring');  
var _ = require('lodash');

*/

var nonce = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}



angular.module('basejumpsApp')
  .controller('MainCtrl', function ($scope, $http, $location, Auth) {
    $scope.awesomeThings = [];
    $scope.businesses=[];
    $scope.attendList=[];
    var consumerKey = 'Vw1PkSTUAloUmzN_0b3BYQ';
    var authToken = 'cNaFOLxWxGu-sJ1ljd5mxDOOnfKDBo5e';
    var consumerSecret = '19QJ5T78qu9LLR6yHfBO9agEp0Y';
    var tokenSecret = '2I2C3d6tbAeJtRKAvKTS2nVYi70';
    var callbackCount = 0;
    //queryYelp('Los Angeles');
    getAttendList();


    function queryYelp(query){
      var url = 'https://api.yelp.com/v2/search';
      var parameters = {
        location: query,
        oauth_consumer_key: consumerKey,
        oauth_token: authToken,
        oauth_nonce : nonce(32),
        oauth_timestamp : new Date().getTime(),
        oauth_signature_method:'HMAC-SHA1',
        callback: 'angular.callbacks._'+callbackCount,
        term:'bar'
      };
      console.log(callbackCount);
      callbackCount++; 
      parameters.oauth_signature = oauthSignature.generate('GET', url, parameters, consumerSecret, tokenSecret, { encodeSignature: false});
      var apiURL = url+'?'+$.param(parameters);
      $http.jsonp(apiURL)
        .success(function(data){
        $scope.businesses = data.businesses;
        for(var i in $scope.businesses){
          var name = $scope.businesses[i].name;
          var found = false;
          for(var j in $scope.attendList){
            if($scope.attendList[j].name == name){
              $scope.businesses[i].going = $scope.attendList[j].attendees.length;
              found = true;
              break;
            }
          }
          if(!found)
            $scope.businesses[i].going = 0;
        }
        console.log($scope.businesses);
      }).error(function(error,data,la){
        console.log(error,data);
      });

    }

    $scope.getTimes = function(n,method){
      if(method == 'floor')
        return new Array(Math.floor(n));
      else
        return new Array(Math.ceil(n));
    };

    $scope.search = function(){
      queryYelp($scope.searchText);
    }

    $scope.going = function(name){
      if(!Auth.isLoggedIn()){
        $location.path('login');
        return;
      }
      console.log($scope.attendList);
      var found = false;
      var obj = {};
      var user = Auth.getCurrentUser().name;
      for(var i in $scope.attendList){
        if($scope.attendList[i].name == name){
          console.log('');
          found = true;
          obj = $scope.attendList[i];
          if($scope.attendList[i].attendees.indexOf(user) != -1)
            return;
        }
      }
      if(!found){
        obj = {name:name, attendees:[user]};
        $http.post('/api/businesses', obj);
      }
      else{
        obj.attendees.push(user);
        $http.put('/api/businesses/'+obj._id,obj)
      }
      getAttendList();
      
      for(var i in $scope.businesses){
        if($scope.businesses[i].name == name)
          $scope.businesses[i].going += 1;
      }
    }

    $scope.isLoggedIn = function(){
      return Auth.isLoggedIn();
    }

    $scope.logout = function(){
      Auth.logout();
    }
    function getAttendList(){
      $http.get('/api/businesses').success(function(attendList) {
        $scope.attendList = attendList;
      });
    }

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };
  


  });
