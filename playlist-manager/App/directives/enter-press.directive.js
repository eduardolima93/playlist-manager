(function () {
    'use strict';

    angular
        .module('app')
        .directive('enterPress', enterPress);

    enterPress.$inject = ['$window'];

    function enterPress($window) {

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            if (!attrs.enterPress) {
                console.log("missing attributes on element: ", element);
            }

            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {        //enter keycode
                    scope.$apply(function () {
                        scope.$eval(attrs.enterPress);
                    });
                    event.preventDefault();
                }
            });
        }
    }

})();