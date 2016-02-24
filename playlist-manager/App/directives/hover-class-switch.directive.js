(function () {
    'use strict';

    angular
        .module('app')
        .directive('hoverClassSwitch', hoverClassSwitch);

    hoverClassSwitch.$inject = ['$window'];

    function hoverClassSwitch($window) {

        var directive = {
            link: link,
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {
            if (!attrs.mouseInClass || !attrs.mouseOutClass) {
                console.log("missing attributes on element: ", element);
            }

            element.on('mouseenter', function () {
                element.addClass(attrs.mouseInClass);
                element.removeClass(attrs.mouseOutClass);
            });
            element.on('mouseleave', function () {
                element.removeClass(attrs.mouseInClass);
                element.addClass(attrs.mouseOutClass);
            });
        }
    }

})();