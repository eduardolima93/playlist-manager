(function () {
    'use strict';

    var app = angular.module('app');

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
          when('/login', {
              templateUrl: 'app/login/login.html?3'
          }).
          when('/main', {
              templateUrl: 'app/layout/shell.html?3'
          }).
          otherwise({
              redirectTo: '/login'
          });
    }]);

    app.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
          // Allow same origin resource loads.
          'self',
          // Allow loading from our assets domain.  Notice the difference between * and **.
          'https://embed.spotify.com/**',
          'https://www.spotify.com/**'
        ]);
    }]);

    app.config(['toastrConfig', function (toastrConfig) {
        angular.extend(toastrConfig, {
            autoDismiss: false,
            closeButton: true,
            containerId: 'toast-container',
            maxOpened: 3,
            newestOnTop: true,
            positionClass: 'toast-bottom-left',
            preventDuplicates: false,
            preventOpenDuplicates: true,
            target: '.container',
            timeOut: 15000,
            extendedTimeOut: 10000,
            allowHtml: true,
            iconClass: 'welcome-toast',
            progressBar: true,
        });
    }]);

})();