(function () {
    'use strict';

    angular
        .module('app')
        .service('sortFilter', sortFilter);

    sortFilter.$inject = ['$rootScope', 'dataRepository'];

    function sortFilter($rootScope, dataRepository) {
        var service = this;
        service.currentSorting = { sortType: null, isReversed: false, playlistId: null };
        service.sortByType = sortByType;
        service.reSort = reSort;
        service.sortTypes = {
            name: "name",
            artist: "artistListSring",
            leastRecentAddedAt: "leastRecentAddedAt",
            addedAtPlaylist: "addedAtPlaylist"
        };
        service.filterLocals = filterLocals;
        service.filterLocalTypes = {
            showLocal: "showLocal",
            hideLocal: "hideLocal",
            showOnlyLocal: "showOnlyLocal"
        }
        service.currentLocalFilterType = service.filterLocalTypes.showLocal;

        function sortByType(trackList, sortType, playlistId) {
            if (sortType === service.sortTypes.name || sortType === service.sortTypes.artist || sortType === service.sortTypes.leastRecentAddedAt) {
                trackList = generalSort(trackList, sortType);
            }
            else if (sortType === service.sortTypes.addedAtPlaylist) {
                if (!playlistId) {
                    console.error("Missing playlistId in sortType: ", sortType);
                } else {
                    trackList = sortByPlaylistAddedAt(trackList, playlistId);
                }

            } else {
                console.error("wrong or missing type in sortType: ", sortType);
            }

            service.currentSorting = {
                isReversed: (service.currentSorting.sortType === sortType && service.currentSorting.playlistId == playlistId) ? !service.currentSorting.isReversed : false,
                sortType: sortType,
                playlistId: playlistId || null
            }

            $rootScope.$emit('go-to-page', 1);

            return trackList;
        }

        function generalSort(trackList, sortType) {
            trackList = _.sortBy(trackList, sortType);
            if (service.currentSorting.sortType === sortType && !service.currentSorting.isReversed) {
                trackList = trackList.reverse();
            }
            if (sortType === service.sortTypes.leastRecentAddedAt) {
                trackList = trackList.reverse();
            }

            return trackList;
        }

        function sortByPlaylistAddedAt(trackList, playlistId) {
            trackList = _.sortBy(trackList, function (track) {
                var playlistToSortBy = _.find(track.containingPlaylistList, function (containingPlaylist) { return containingPlaylist.id === playlistId; });
                return !!playlistToSortBy ? playlistToSortBy.addedAt : -track.leastRecentAddedAt;
            }).reverse();
            if (service.currentSorting.playlistId === playlistId && !service.currentSorting.isReversed) {
                trackList = trackList.reverse();
            }

            return trackList;
        }

        function reSort(trackList) {
            if (!service.currentSorting.sortType) {
                return service.sortByType(trackList, service.sortTypes.leastRecentAddedAt);
            } else {
                service.currentSorting.isReversed = !service.currentSorting.isReversed;
                return service.sortByType(trackList, service.currentSorting.sortType, service.currentSorting.playlistId);
            }
        }

        function filterLocals(displayedPlaylistTrackList) {
            return _.filter(displayedPlaylistTrackList, function (track) {
                if (service.currentLocalFilterType === service.filterLocalTypes.showLocal) {
                    return true;
                } else if (service.currentLocalFilterType === service.filterLocalTypes.hideLocal) {
                    return !track.isLocal;
                } else if (service.currentLocalFilterType === service.filterLocalTypes.showOnlyLocal) {
                    return track.isLocal;
                }
                console.error("something is wrong: ", service.currentLocalFilterType);
                return true;
            });
        }
    }
})();