(function () {
    'use strict';

    angular
        .module('app')
        .directive('fixedTableHeader', fixedTableHeader);

    fixedTableHeader.$inject = ['$window'];

    function fixedTableHeader($window) {
        var directive = {
            link: link,
            restrict: 'EA'
        };
        return directive;

        function link(scope, element, attrs) {
            var container = $(".viewport");
            angular.element(container).bind("scroll", function (e) {
                var offsetTop = container.scrollTop();

                var thList = $(element[0]).find("th");
                if (offsetTop > 0) {
                    thList.css('top', offsetTop);
                    thList.css('position', 'relative');
                } else {
                    thList.css('position', 'static');
                }
            });
        }
    }

})();