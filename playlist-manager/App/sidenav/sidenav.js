(function () {
    'use strict';
    var controllerId = 'sidenav';
    angular.module('app').controller(controllerId, ['$rootScope', 'Spotify', 'data', 'dataRepository', '$timeout', dashboard]);

    function dashboard($rootScope, Spotify, data, dataRepository, $timeout) {
        var vm = this;
        vm.playlistList = data.playlistList;
        vm.data = data;
        vm.newPlaylist = {
            name: "",
            isPrivate: false,
        }
        vm.addNewPlaylist = addNewPlaylist;
        vm.currentEmbedUrl = "https://embed.spotify.com/?uri=spotify:track:4th1RQAelzqgY7wL53UGQt";
        vm.updateCheckedPlaylistList = updateCheckedPlaylistList;

        function addNewPlaylist() {
            if (!vm.newPlaylist.name) {
                return;
            }

            var options = { name: vm.newPlaylist.name, public: !vm.newPlaylist.isPrivate };
            Spotify.createPlaylist(vm.data.user.id, options).then(function (newPlaylist) {
                newPlaylist.isChecked = true;
                newPlaylist.isReady = true;
                newPlaylist.trackList = [];
                newPlaylist.isNew = true;
                newPlaylist.isOwned = true;

                vm.data.playlistList.splice(1, 0, newPlaylist);

                vm.data.updateCheckedPlaylistList(true);

                vm.newPlaylist = {
                    name: "",
                    isPrivate: false,
                }

                //Feio:
                $('#divNewAddPlaylistForm').collapse('hide');

            }, function (data) {
                console.log('failed to create playlist', data);
            });
        }

        function updateCheckedPlaylistList() {
            vm.data.isProcessing = true;
            $timeout(function () {
                vm.data.updateCheckedPlaylistList();
            });
        }

        $rootScope.$on('set-spotify-player', function (evt, embedUrl) {
            vm.currentEmbedUrl = embedUrl;
            //vm.data.userOptions.currentEmbedUrl = embedUrl;
            //dataRepository.setUserOptions(vm.data.userOptions);
        });
    };
})();