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
        $scope.viewLoaded = 0;
        $scope.updated = 0;

        $scope.chart = null;
        $scope.stats = null;
        $scope.sourceStats = null;

        function animate () {
            $timeout(function () {
                $scope.chart.animate();
                $scope.stats.forEach(function (stat) {
                    stat.animate();
                });
                $scope.sourceStats.forEach(function (stat) {
                    stat.animate();
                });
            });
        }

        function getChart (chart) {
            var ret = {
                'data': [{
                    'values': [],
                    'key': 'Social views',
                    'color': '#4DB6AC'
                }]
            };

            Object.keys(chart.data).forEach(function (timestamp, index) {
                ret.data[0].values.push({
                    'x': index,
                    'y': chart.data[timestamp]
                });
            });

            ret.data.from = chart.from;

            return ret;
        }

        function formatChartData (data) {
            var ret = [],
                i = 0;

            Object.keys(data).forEach(function (timestamp) {
                ret.push({
                    'x': i,
                    'y': data[timestamp]
                });
                i += 1;
            });

            return ret;
        }

        function getK (num) {
            var number = Number(num) || 0;

            return String(
                number >= 10000 ? (
                    Math.floor(number / 1000) + 'k'
                ) : number
            );
        }

        function getStats (stats) {
            return [
                {
                    'metric': 'Users',
                    'value': getK(stats.user.sum),
                    'chartData': formatChartData(
                        stats.user.values
                    )
                },
                {
                    'metric': 'Views',
                    'value': getK(stats.view.sum),
                    'chartData': formatChartData(
                        stats.view.values
                    )
                },
                {
                    'metric': 'Social views',
                    'value': getK(stats.share.sum),
                    'chartData': formatChartData(
                        stats.share.values
                    )
                }
            ];
        }

        function getPercent (sum, value) {
            if (!value || !sum) {
                return '0';
            }

            return String(
                Math.round(value / sum * 100)
            );
        }

        function getSourceStats (organic, team, paid, source) {
            var ret = [],
                sum = organic +
                    team +
                    paid;

            ret.push({
                'id': 'organic',
                'title': 'Organic',
                'percent': getPercent(sum, organic),
                'topSource': Object.keys(
                    source['organic'] && source['organic'][0] || {}
                )[0] || 'N/A'
            });

            ret.push({
                'id': 'team',
                'title': 'Team',
                'percent': getPercent(sum, team),
                'topSource': Object.keys(
                    source['team'] && source['team'][0] || {}
                )[0] || 'N/A'
            });

            ret.push({
                'id': 'paid',
                'title': 'Paid',
                'percent': getPercent(sum, paid),
                'topSource': Object.keys(
                    source['paid'] && source['paid'][0] || {}
                )[0] || 'N/A'
            });

            return ret;
        }

        $scope.$watch('content', function (content) {
            var first = !$scope.viewLoaded;

            if (!content) {
                return;
            }

            $scope.chart = getChart(content.chart);
            $scope.stats = getStats(content.stats);
            $scope.sourceStats = getSourceStats(
                content.organic,
                content.team,
                content.paid,
                content.source
            );

            if (first) {
                animate();
            } else {
                $scope.updated = 1;
            }

            $scope.viewLoaded = 1;
        });
    }
]);
