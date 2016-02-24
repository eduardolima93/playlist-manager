(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['$rootScope', 'Spotify', 'dashboardService', 'data', 'dataRepository', '$timeout', '$window', '$location', 'sortFilter', dashboard]);

    function dashboard($rootScope, Spotify, dashboardService, data, dataRepository, $timeout, $window, $location, sortFilter) {
        var vm = this;
        vm.title = 'Dashboard';
        vm.data = data;
        vm.sortFilter = sortFilter;
        vm.filterTracklist = filterTracklist;
        vm.currentPage = 1;
        vm.playlistContainTrack = dashboardService.playlistContainTrack;
        vm.sortByName = dashboardService.sortByName;
        vm.sortByArtist = dashboardService.sortByArtist;
        vm.sortByLeastRecentAddedAt = dashboardService.sortByLeastRecentAddedAt;
        vm.sortByPlaylistAddedAt = dashboardService.sortByPlaylistAddedAt;
        vm.addTrack = addTrack;
        vm.removeTrack = removeTrack;
        vm.getPlaylistTracks = getPlaylistTracks;
        vm.getLoadingBarPercentage = dashboardService.getLoadingBarPercentage;
        vm.playTrack = playTrack;
        vm.pausePreview = pausePreview;
        vm.selectedRow = null;
        vm.setClickedRow = setClickedRow;
        vm.pageChangeHandler = pageChangeHandler;
        vm.filter = {
            value: "",
            clear: function() {
                this.value = "";
            }
        };
        var throttle = 40;

        activate();

        function activate() {
            if (!vm.data.isLoggedIn) {
                Spotify.getCurrentUser().then(function (data) {
                    vm.data.isLoggedIn = true;
                    vm.data.user = data;
                    if (!vm.data.user.country) { vm.data.user.country = "US"; }
                    getUserOptions();
                }, function (data) {
                    $location.path("/login");
                });
            }
            else {
                getUserOptions();
            }
        }

        function getUserOptions() {
            dataRepository.getUserOptions(vm.data.user.id).then(function (data) {
                if (!!data) vm.data.userOptions = data;
                vm.data.initPlaylistList();
                getUserPlaylists();
                getSavedUserTracks();

                //var currentEmbedUrl = vm.data.userOptions.currentEmbedUrl || "https://embed.spotify.com/?uri=spotify:track:4th1RQAelzqgY7wL53UGQt";
                //$rootScope.$emit('init-player', currentEmbedUrl);
            });
        }

        function getUserPlaylists(offset) {
            if (!offset) offset = 0;
            var limit = 50;

            Spotify.getUserPlaylists(vm.data.user.id, { limit: limit, offset: offset }).then(function (data) {
                vm.data.playlistList = vm.data.playlistList.concat(_.map(data.items, function (item) {
                    if (!!vm.data.userOptions.checkedPlaylistIdList) {
                        item.isChecked = _.some(vm.data.userOptions.checkedPlaylistIdList, function (id) { return id == item.id; })
                    } else {
                        if (item.owner.id == vm.data.user.id) {
                            item.isChecked = true;
                        }
                    }
                    if (item.owner.id == vm.data.user.id) {
                        item.isOwned = true;
                    }

                    item.isReady = false;
                    return item;
                }));

                if (data.items.length == limit) {
                    //getUserPlaylists(offset + limit);
                    $timeout(function () { getUserPlaylists(offset + limit); }, throttle);
                    return;
                }

                vm.data.updateCheckedPlaylistList(true);

                _.each(vm.data.playlistList, function (playlist) {
                    if (!playlist.isSavedTracks) {
                        playlist.totalLoadedTracks = 0;
                        getPlaylistTracks(playlist);
                    }
                })
            }, function(err) {
                console.log(err);
                $timeout(function () { getUserPlaylists(offset); }, throttle);
            });
        }

        function getSavedUserTracks(offset) {
            if (!offset) offset = 0;

            var savedTracks = _.find(vm.data.playlistList, function (playlist) {
                return playlist.isSavedTracks;
            });
            if (!!vm.data.userOptions.checkedPlaylistIdList) {
                savedTracks.isChecked = _.some(vm.data.userOptions.checkedPlaylistIdList, function (id) { return id == savedTracks.id; })
            } else {
                savedTracks.isChecked = true;
            }

            Spotify.getSavedUserTracks({ limit: 50, offset: offset, market: vm.data.user.country }).then(function (data) {
                var treatedTrackList = _.map(data.items, function (track) { return dashboardService.treatTrack(track, vm.data.userTracksId); })
                treatedTrackList = _.filter(treatedTrackList, function (track) { return track != null; });

                savedTracks.totalLoadedTracks += data.items.length;
                if (data.total > savedTracks.totalLoadedTracks) {
                    //getSavedUserTracks(offset + 50);
                    $timeout(function () { getSavedUserTracks(offset + 50); }, throttle);
                } else {
                    savedTracks.isReady = true;
                }

                vm.data.insertToTrackList(treatedTrackList);
            },function(err) {
                console.log(err);
                $timeout(function () { getSavedUserTracks(offset); }, throttle);
            });
        }


        function getPlaylistTracks(playlist, offset) {
            if (!offset) offset = 0;

            Spotify.getPlaylistTracks(playlist.owner.id, playlist.id, { offset: offset, market: vm.data.user.country }).then(function (data) {
                var treatedTrackList = _.map(data.items, function (track) { return dashboardService.treatTrack(track, playlist.id); });
                treatedTrackList = _.filter(treatedTrackList, function (track) { return track != null; });

                playlist.totalLoadedTracks += data.items.length;

                if (playlist.tracks.total > playlist.totalLoadedTracks) {
                    $timeout(function () { getPlaylistTracks(playlist, offset + 100); }, throttle);
                    //getPlaylistTracks(playlist, offset + 100);
                } else {
                    playlist.isReady = true;
                }

                vm.data.insertToTrackList(treatedTrackList);
            }, function(err) {
                console.log(err);
                $timeout(function () { getPlaylistTracks(playlist, offset); }, throttle);
            });
        };

        function addTrack(playlist, track) {
            if (track.isLocal) {
                alert("can't add local tracks atm");
                return;
            }

            var addCall = !playlist.isSavedTracks ? Spotify.addPlaylistTracks(vm.data.user.id, playlist.id, track.uri) : Spotify.saveUserTracks(track.id);

            addCall.then(function (data) {
                track.containingPlaylistList.push({ id: playlist.id, addedAt: new Date().toJSON().slice(0, 19).replace(/([a-zA-Z \-\:])/g, "") });
            }, function (data) {
                console.log("failed to add track")
                console.log(data);
                Spotify.getCurrentUser().then(function (data) {
                    addTrack(playlist, track);
                }, function (data) {
                    $location.path("/login");
                });
            });
        }

        function removeTrack(playlist, track) {
            if (track.isLocal) {
                alert("can't remove local tracks atm");
                return;
            }

            var removeCall = !playlist.isSavedTracks ? Spotify.removePlaylistTracks(playlist.owner.id, playlist.id, track.uri) : Spotify.removeUserTracks(track.id);

            removeCall.then(function (data) {
                track.containingPlaylistList = _.filter(track.containingPlaylistList, function (containingPlaylist) {
                    return playlist.id != containingPlaylist.id;
                });
            }, function (data) {
                console.log("failed to remove track")
                console.log(data);
                Spotify.getCurrentUser().then(function (data) {
                    removeTrack(playlist, track);
                }, function (data) {
                    $location.path("/login");
                });

            });
        }

        function playTrack(track) {
            if (track.isLocal || !track.isPlayable) {
                return;
            }
            $rootScope.$emit('play-track', track);
        }

        function pausePreview(track) {
            $rootScope.$emit('pause-track', track);
        };

        $rootScope.$on('set-is-playing-false-all', function (evt, useApply) {
            function pauseAll() {
                _.each(vm.data.filteredTrackList, function (track) {
                    track.isPlaying = false;
                });
            }
            if (useApply) {
                $rootScope.$apply(function () {
                    pauseAll();
                });
            } else {
                pauseAll();
            }
        });

        $rootScope.$on('set-is-playing-true-by-uri', function (evt, uri) {
            var trackPlaying = _.find(vm.data.filteredTrackList, function (track) {
                return track.uri == uri;
            });
            if (!!trackPlaying) {
                $rootScope.$apply(function () {
                    trackPlaying.isPlaying = true;
                });
            }
        });


        $rootScope.$on('go-to-page', function (evt, page) {
            vm.currentPage = page;
        });

        function setClickedRow(index) {
            vm.selectedRow = index;
        }

        function filterTracklist() {
            $timeout(function () {
                vm.data.updateCheckedPlaylistList();
                vm.currentPage = 1;
            });
        }

        function pageChangeHandler(newPageNumber) {
            $timeout(function () {
                //feio
                $(".viewport").scrollTop(0)
            });
        }
    }
})();