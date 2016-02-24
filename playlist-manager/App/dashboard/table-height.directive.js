(function () {
    'use strict';

    angular
        .module('app')
        .directive('tableHeight', tableHeight);

    tableHeight.$inject = ['$window'];

    function tableHeight($window) {

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            setMaxHeight();
            angular.element($window).bind("resize", function (e) {
                setMaxHeight();
            });

            function setMaxHeight() {
                var windowHeight = $window.innerHeight;
                var maxHeight = windowHeight - 62

                element.css({
                    maxHeight: maxHeight + 'px'
                });
            }
        }
    }

})();