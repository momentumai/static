/*global momentum */
momentum.controller('ContentHistoryController', [
    'content',
    'fb',
    'dialog',
    'storage',
    'utils',
    '$rootScope',
    '$scope',
    '$q',
    '$timeout',
    function (
        content,
        fb,
        dialog,
        storage,
        utils,
        $rootScope,
        $scope,
        $q,
        $timeout
    ) {
        $scope.viewLoaded = 0;
        $scope.statsDirty = 0;

        $scope.sourceStats = null;

        function animate () {
            $timeout(function () {
                $scope.sourceStats.forEach(function (stat) {
                    stat.animate();
                });
            });
        }

        function init () {
            var promises = {
                'shareStats': content.getShareStatDetails(
                    $scope.sessionId,
                    $scope.stateParams.contentId
                )
            };

            promises.shareStats = promises.shareStats.then(function (data) {
                data.forEach(function (datum) {
                    datum.hasMore = 1;
                });
                $scope.sourceStats = data;
            });

            $q.all(promises).finally(function () {
                $scope.viewLoaded = 1;
                animate();
            });
        }

        $scope.isVisible = function (id) {
            var haveActive = 0,
                isActive = 0;

            $scope.sourceStats.forEach(function (stat) {
                if (stat.active) {
                    haveActive = 1;
                    if (stat.id === id) {
                        isActive = 1;
                    }
                }
            });

            return !haveActive || isActive;
        };

        $scope.switchState = function (id) {
            $scope.statsDirty = 1;
            $scope.sourceStats.forEach(function (stat) {
                var active;

                if (stat.id === id) {
                    active = stat.active ? 0 : 1;
                    if (active) {
                        stat.offset = 0;
                        stat.active = 1;
                    } else {
                        stat.active = 0;
                    }
                } else {
                    stat.active = 0;
                }
            });
        };

        $scope.switchPage = function (id, dir) {
            $scope.sourceStats.forEach(function (stat) {
                if (stat.id === id) {
                    stat.offset = Math.min(
                        stat.details.length,
                        Math.max(0, stat.offset + dir * 10)
                    );
                }
            });
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
