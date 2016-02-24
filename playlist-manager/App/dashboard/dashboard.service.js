(function () {
    'use strict';

    angular
        .module('app')
        .service('dashboardService', dashboardService);

    dashboardService.$inject = ['Spotify', '$q', 'data', 'sortFilter'];

    function dashboardService(Spotify, $q, data, sortFilter) {
        this.treatTrack = treatTrack;
        this.playlistContainTrack = playlistContainTrack;
        this.getLoadingBarPercentage = getLoadingBarPercentage;
        this.sortByName = sortByName;
        this.sortByArtist = sortByArtist;
        this.sortByLeastRecentAddedAt = sortByLeastRecentAddedAt;
        this.sortByPlaylistAddedAt = sortByPlaylistAddedAt;

        function playlistContainTrack(playlist, track) {
            return _.some(track.containingPlaylistList, function (containingPlaylist) {
                return containingPlaylist.id === playlist.id;
            });
        };

        function treatTrack(untreatedTrack, playlistId) {
            if (!untreatedTrack.added_at) {
                console.log("added_at of this track is null: ", untreatedTrack);
                untreatedTrack.added_at = "0";
            }
            var addedAt = untreatedTrack.added_at.replace(/([a-zA-Z \-\:])/g, "");
            var track = angular.copy(untreatedTrack.track);
            if (track == null) {
                console.log("property track of this track is null, why? :", untreatedTrack);
                return null;
            }

            track.embedUrl = 'https://embed.spotify.com/?uri=' + track.uri;
            track.previewUrl = track.preview_url;
            track.isPlayable = track.is_playable;
            track.isLocal = untreatedTrack.is_local === true ? true : false;
            track.artistList = _.map(track.artists, function (artist) { return artist.name; });
            track.artistListSring = track.artistList.join(", ");
            track.mostRecentAddedAt = addedAt;
            track.leastRecentAddedAt = addedAt;
            track.containingPlaylistList = [{ id: playlistId, addedAt: addedAt }];
            return track;
        };

        function getLoadingBarPercentage() {
            var totalNumber = data.playlistList.length;
            if (!totalNumber) {
                return 5;
            }
            var readyNumber = _.filter(data.playlistList, function (playlist) {
                return playlist.isReady;
            }).length;

            var percentage = (readyNumber / totalNumber) * 100;

            data.isLoadingDone = (percentage >= 100);

            return percentage > 5 ? percentage : 5;
        };

        function sortByName() {
            data.filteredTrackList = sortFilter.sortByType(data.filteredTrackList, sortFilter.sortTypes.name);
        }
        function sortByArtist() {
            data.filteredTrackList = sortFilter.sortByType(data.filteredTrackList, sortFilter.sortTypes.artist);
        }
        function sortByLeastRecentAddedAt() {
            data.filteredTrackList = sortFilter.sortByType(data.filteredTrackList, sortFilter.sortTypes.leastRecentAddedAt);
        }

        function sortByPlaylistAddedAt(playlistId) {
            data.filteredTrackList = sortFilter.sortByType(data.filteredTrackList, sortFilter.sortTypes.addedAtPlaylist, playlistId);
        }
    }
})();