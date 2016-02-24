(function () {
    'use strict';

    angular
        .module('app')
        .directive('listHeight', listHeight);

    listHeight.$inject = ['$window'];

    function listHeight($window) {
        var directive = {
            link: link,
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {
            setMaxHeight();
            angular.element($window).bind("resize", function (e) {
                setMaxHeight();
            });

            function setMaxHeight() {
                var windowHeight = $window.innerHeight;
                var maxHeight = windowHeight - 228;

                element.css({
                    maxHeight: maxHeight + 'px'
                });
            }
        }
    }

})();