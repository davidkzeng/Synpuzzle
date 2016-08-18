var ngApp = angular.module('main', []);

var mainController = ['$scope', function(scope) {

  scope.synonymString = '';
  scope.regexString = '';

  scope.searchResults = {};
  scope.sortedSearchResults = [];
  scope.matchWords = function() {
    var dataObject = {
      synonyms: scope.synonymString,
      regex: scope.regexString
    };
    scope.showLoading = true;
    $.ajax({
      url: '/ajax/matchwords',
      method: 'GET',
      data: dataObject,
      dataType: 'json',
      success: scope.processSearch,
      failure: function() {
        scope.showLoading = false;
        console.log('Error');
      }
    });
  };

  scope.processSearch = function(data) {
    var words = Object.keys(data);
    words.sort(function (a, b){
      return data[b] - data[a];
    });
    scope.searchResults = data;
    scope.sortedSearchResults = words;
    scope.topResults = words.slice(0, Math.min(words.length, 100));
    scope.showLoading = false;
    scope.$apply();
  }
}];

ngApp.controller('MainController', mainController);