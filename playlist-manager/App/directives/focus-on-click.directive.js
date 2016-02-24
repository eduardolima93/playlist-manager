(function () {
    'use strict';

    angular
        .module('app')
        .directive('focusOnClick', focusOnClick);

    focusOnClick.$inject = ['$window', '$timeout'];

    function focusOnClick($window, $timeout) {

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            if (!attrs.focusOnClick) {
                console.log("missing attributes on element: ", element);
            }

            element.bind("click", function (e) {
                var targetInput = $(attrs.focusOnClick);

                if (!targetInput.is(':visible')) {
                    $timeout(function () {
                        targetInput.focus();
                    });
                }
            });
        }
    }

})();