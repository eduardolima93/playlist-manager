(function () {
    'use strict';

    angular
        .module('app')
        .service('data', data);

    data.$inject = ['Spotify', '$q', 'dataRepository', 'sortFilter', 'toastr'];

    function data(Spotify, $q, dataRepository, sortFilter, toastr) {
        var service = this;
        service.audioPlayer = new Audio();
        service.userTracksId = 'user-tracks';
        service.playlistList = [];
        service.initPlaylistList = initPlaylistList;
        service.checkedPlaylistList = [];
        service.trackList = [];
        service.displayedPlaylistTrackList = [];
        service.filteredTrackList = [];
        service.user = {};
        service.userOptions = {};
        service.updateCheckedPlaylistList = updateCheckedPlaylistList;
        service.insertToTrackList = insertToTrackList;
        service.updateTrackList = updateTrackList;
        service.isProcessing = false;
        service.isLoggedIn = false;
        service.isLoadingDone = false;


        function updateCheckedPlaylistList(doNotUpdateTrackList) {
            service.checkedPlaylistList = _.filter(service.playlistList, function (playlist) {
                return playlist.isChecked;
            });

            updateCheckedPlaylistIds();

            if (!doNotUpdateTrackList) {
                updateTrackList();
            }
        };

        function insertToTrackList(trackToAddList) {
            _.each(trackToAddList, function (trackToAdd) {
                var existingTrack = _.find(service.trackList, function (track) {
                    return track.uri == trackToAdd.uri;
                });

                if (!existingTrack) {
                    service.trackList.push(trackToAdd);
                } else {
                    existingTrack.containingPlaylistList.push({ id: trackToAdd.containingPlaylistList[0].id, addedAt: trackToAdd.containingPlaylistList[0].addedAt });
                    existingTrack.mostRecentAddedAt = existingTrack.mostRecentAddedAt > trackToAdd.mostRecentAddedAt ? existingTrack.mostRecentAddedAt : trackToAdd.mostRecentAddedAt;
                    existingTrack.leastRecentAddedAt = existingTrack.leastRecentAddedAt < trackToAdd.leastRecentAddedAt ? existingTrack.leastRecentAddedAt : trackToAdd.leastRecentAddedAt;
                }
            });

            if (_.every(service.playlistList, function (playlist) {
                return playlist.isReady;
            })) {
                updateTrackList();
            }
        };

        var shownMessage = false;
        function updateTrackList() {
            var tracksToDisplay = _.filter(service.trackList, function (track) {
                return _.some(service.checkedPlaylistList, function (checkedPlaylist) {
                    var containingPlaylistIdList = _.map(track.containingPlaylistList, function (containingPlaylist) { return containingPlaylist.id; });
                    return containingPlaylistIdList.indexOf(checkedPlaylist.id) !== -1;
                });
            });

            service.displayedPlaylistTrackList = tracksToDisplay;
            service.filteredTrackList = sortFilter.reSort(sortFilter.filterLocals(service.displayedPlaylistTrackList));

            service.isProcessing = false;

            if (!shownMessage) {
                toastr.info('Select from which playlists you wish to see songs on the list on the left.<br />' +
                    'Add or remove songs from a playlist by clicking <i class="fa fa-plus fa-fw"></i> or <i class="fa fa-check fa-fw"></i><br />' +
                    'You can order the songs by the time it was added overall, or added in a specific playlist by clicking <i class="fa fa-calendar-o fa-fw fa-lg"></i>', 'Welcome!', {
                        allowHtml: true,
                        iconClass: 'welcome-toast',
                        progressBar: true,
                        timeOut: 40000,
                        extendedTimeOut: 20000
                    });
                shownMessage = true;
            }
        };

        function initPlaylistList() {
            var savedTracks = {
                name: "Saved Songs",
                isSavedTracks: true,
                trackList: [],
                isOwned: true,
                id: service.userTracksId,
                totalLoadedTracks: 0
            }
            service.playlistList = [savedTracks];
        }

        function updateCheckedPlaylistIds() {
            service.userOptions.checkedPlaylistIdList = _.map(service.checkedPlaylistList, function (playlist) {
                return playlist.id;
            });
            dataRepository.setUserOptions(service.userOptions);
        }
    }
})();