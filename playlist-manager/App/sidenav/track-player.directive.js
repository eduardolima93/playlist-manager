(function () {
    'use strict';

    angular
        .module('app')
        .directive('trackPlayer', trackPlayer);

    trackPlayer.$inject = ['$window', '$timeout', '$rootScope', 'toastr'];

    function trackPlayer($window, $timeout, $rootScope, toastr) {

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            var audioPlayer = element[0],
                trackCurrentlyPlaying = {
                    uri: null
                },
                timer,
                   messageShown = false;

            audioPlayer.onpause = function () {
                trackCurrentlyPlaying.isPlaying = false;
                $rootScope.$emit('set-is-playing-false-all', true);
            };

            audioPlayer.onplay = function () {
                if (!trackCurrentlyPlaying.isPlaying) {
                    trackCurrentlyPlaying.isPlaying = true;
                    $rootScope.$emit('set-is-playing-true-by-uri', trackCurrentlyPlaying.uri);
                }
            }

            var unsubscribePlayTrack = $rootScope.$on('play-track', function (evt, track) {
                $rootScope.$emit('set-spotify-player', track.embedUrl);

                if (!track.previewUrl) {
                    toastr.info('The preview for this song is not available.<br />' +
                        'You can still play the full song through Spotify by clicking on the big play button on the left.', {
                            allowHtml: true,
                            iconClass: 'welcome-toast'
                        });
                    return;
                }

                audioPlayer.pause();

                if (!messageShown) {
                    toastr.info('A 30 seconds preview of the song is playing.<br />' +
                        'You can play the whole song through Spotify by clicking on the big play button on the left, ' +
                        'but remember to pause the preview on the player on the bottom.', {
                            allowHtml: true,
                            iconClass: 'welcome-toast'
                        });
                    messageShown = true;
                }

                $rootScope.$emit('set-is-playing-false-all');

                track.isPlaying = true;

                if (timer) {
                    $timeout.cancel(timer);
                }

                timer = $timeout(function () {
                    track.isPlaying = false;
                }, 30000);

                if (trackCurrentlyPlaying.uri !== track.uri) {
                    audioPlayer.src = track.previewUrl;
                }

                trackCurrentlyPlaying = track;

                audioPlayer.play();
            });

            var unsubscribePauseTrack = $rootScope.$on('pause-track', function (evt, track) {
                track.isPlaying = false;
                audioPlayer.pause();
            });

            scope.$on('$destroy', function () {
                unsubscribePlayTrack();
                unsubscribePauseTrack();
            });

        }
    }

})();