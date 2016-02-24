(function () {
    'use strict';

    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing

        'spotify',
        'ngStorage',
        //'sf.virtualScroll',
        'angularUtils.directives.dirPagination',
        'toastr'
    ]);

    // Handle routing errors and success events
    app.run(['$route', function ($route) {
        // Include $route to kick start the router.
    }]);
})();