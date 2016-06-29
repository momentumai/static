/*global momentum*/
momentum.controller('InfoController', [
    'dashboard',
    '$scope',
    '$q',
    '$timeout',
    function (
        dashboard,
        $scope,
        $q,
        $timeout
    ) {
        var poller;

        $scope.viewLoaded = 0;
        $scope.updated = 0;

        $scope.dashboard = {
            'chart': null,
            'stats': null
        };

        function animate () {
            $timeout(function () {
                $scope.dashboard.chart.animate();
                $scope.dashboard.stats.forEach(function (stat) {
                    stat.animate();
                });
            });
        }

        function oneMinutePoll () {
            var promises = {
                    'main': dashboard.getMain($scope.sessionId)
                },
                first = !$scope.viewLoaded;

            if (poller) {
                $timeout.cancel(poller);
            }

            promises.main = promises.main.then(function (main) {
                $scope.dashboard.chart = main.chart;
                $scope.dashboard.stats = main.stats;
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
