/*global momentum, bvConfig*/
momentum.factory('dashboard', ['$http', function ($http) {
    var dashboard = {};

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

    dashboard.getMain = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/main'
        ].join(''), {
            'session_id': sessionId,
            'cache': [
                sessionId
            ]
        }).then(function (res) {
            var data = res.data,
                ret = {
                    'chart': {
                        'data': [{
                            'values': [],
                            'key': 'Social views',
                            'color': '#4DB6AC'
                        }]
                    },
                    'stats': [
                        {
                            'metric': 'Users',
                            'value': getK(data.stats.user.sum),
                            'chartData': formatChartData(
                                data.stats.user.values
                            )
                        },
                        {
                            'metric': 'Views',
                            'value': getK(data.stats.view.sum),
                            'chartData': formatChartData(
                                data.stats.view.values
                            )
                        },
                        {
                            'metric': 'Social views',
                            'value': getK(data.stats.seed.sum),
                            'chartData': formatChartData(
                                data.stats.seed.values
                            )
                        }
                    ]
                };

            Object.keys(data.chart.data).forEach(function (timestamp, index) {
                ret.chart.data[0].values.push({
                    'x': index,
                    'y': data.chart.data[timestamp].seed
                });
            });

            ret.chart.data.from = data.chart.from;

            return ret;
        });
    };

    return dashboard;
}]);
