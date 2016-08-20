// client.js

'use strict';

require('angular/angular');
require('angular-route');
require('angular-bootstrap');

// app
var app = angular.module('airheatApp', ['ngRoute', 'ui.bootstrap']);

// Services
require('./services/data_service')(app);
require('./services/')

// Controllers
require('./controllers/main_controller')(app);

// Directives


// View Routes
app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/dashboard.html';
      controller: 'mainController';
    })
}]);

