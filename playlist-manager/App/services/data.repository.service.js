(function () {
    'use strict';

    angular
        .module('app')
        .service('dataRepository', dataRepository);

    dataRepository.$inject = ['Spotify', '$q', '$localStorage'];

    function dataRepository(Spotify, $q, $localStorage) {
        this.getUserOptions = getUserOptions;
        this.setUserOptions = setUserOptions;

        function getUserOptions(userId) {
            return $q.when($localStorage.userOptions)
        };

        function setUserOptions(userOptions) {
            $localStorage.userOptions = userOptions;
        }
    }
})();