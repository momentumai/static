/*global momentum */
momentum.controller('ContentInfoController', [
    'content',
    '$rootScope',
    '$scope',
    '$q',
    '$timeout',
    function (
        content,
        $rootScope,
        $scope,
        $q,
        $timeout
    ) {
        var poller;

        $scope.viewLoaded = 0;
        $scope.updated = 0;

        $scope.content = {
            'sourceStats': null,
            'chart': null,
            'stats': null
        };

        function animate () {
            $timeout(function () {
                $scope.content.chart.animate();
                $scope.content.stats.forEach(function (stat) {
                    stat.animate();
                });
                $scope.content.sourceStats.forEach(function (stat) {
                    stat.animate();
                });
            });
        }

        function oneMinutePoll () {
            var promises = {
                    'stats': content.getStats(
                        $scope.sessionId,
                        $scope.stateParams.contentId
                    ),
                    'shareStats': content.getShareStats(
                        $scope.sessionId,
                        $scope.stateParams.contentId
                    )
                },
                first = !$scope.viewLoaded;

            if (poller) {
                $timeout.cancel(poller);
            }

            promises.stats = promises.stats.then(function (data) {
                $scope.content.stats = data.stats;
                $scope.content.chart = data.chart;
            });

            promises.shareStats = promises.shareStats.then(function (data) {
                var i,
                    sourceStat;

                if (!$scope.content.sourceStats) {
                    $scope.content.sourceStats = data;
                } else {
                    for (i = 0; i < $scope.content.sourceStats.length; i += 1) {
                        sourceStat = $scope.content.sourceStats[i];
                        data.forEach(function (datum) {
                            if (sourceStat.id === datum.id) {
                                $scope.content.sourceStats[i] = datum;
                            }
                        });
                    }
                }
            });

            $q.all(promises).then(function () {
                $scope.viewLoaded = 1;
                if (first) {
                    animate();
                } else {
                    $scope.updated = 1;
                }
                poller = $timeout(oneMinutePoll, 60000);
            });
        }

        if ($scope.loaded) {
            oneMinutePoll();
        } else {
            $scope.$on('loaded', oneMinutePoll);
        }

        $scope.$on('$destroy', function () {
            if (poller) {
                $timeout.cancel(poller);
            }
        });
    }
]);
