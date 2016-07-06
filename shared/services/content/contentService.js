/*global momentum, bvConfig*/
momentum.factory('content', ['$http', function ($http) {
    var content = {};

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

    function getPercent (sum, value) {
        if (!value || !sum) {
            return '0';
        }

        return String(
            Math.round(value / sum * 100)
        );
    }

    function getK (num) {
        var number = Number(num) || 0;

        return String(
            number >= 10000 ? (
                Math.floor(number / 1000) + 'k'
            ) : number
        );
    }

    content.getStats = function (sessionId, contentId) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/content/stats'
        ].join(''), {
            'session_id': sessionId,
            'content_id': Number(contentId),
            'cache': [
                sessionId,
                contentId
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

    content.getShareStats = function (sessionId, contentId) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/content/sources'
        ].join(''), {
            'session_id': sessionId,
            'content_id': Number(contentId),
            'cache': [
                sessionId,
                contentId
            ]
        }).then(function (res) {
            var ret = [],
                data = res.data,
                sum = data['organic-stat'] +
                    data['team-stat'] +
                    data['paid-stat'];

            ret.push({
                'id': 'organic',
                'title': 'Organic',
                'percent': getPercent(sum, data['organic-stat']),
                'topSource': data['organic-top'] || 'N/A'
            });

            ret.push({
                'id': 'team',
                'title': 'Team',
                'percent': getPercent(sum, data['team-stat']),
                'topSource': data['team-top'] || 'N/A'
            });

            ret.push({
                'id': 'paid',
                'title': 'Paid',
                'percent': getPercent(sum, data['paid-stat']),
                'topSource': data['paid-top'] || 'N/A'
            });

            return ret;
        });
    };

    content.getShareStatDetails = function (
        sessionId,
        contentId
    ) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/content/sources/history'
        ].join(''), {
            'session_id': sessionId,
            'content_id': contentId,
            'cache': [
                sessionId,
                contentId
            ]
        }).then(function (res) {
            var ret = [],
                helper = {},
                data = res.data,
                sum;

            function viralLift (seed, viral) {
                if (!seed || !viral) {
                    return 1;
                }

                return Math.round(
                    (seed + viral) / seed * 100
                ) / 100;
            }

            Object.keys(data).forEach(function (key) {
                helper[key] = {
                    'share': data[key].seed +
                        data[key].viral,
                    'topList': []
                };
                Object.keys(data[key].sources).forEach(function (sourceKey) {
                    helper[key].topList.push({
                        'name': sourceKey,
                        'seed': data[key].sources[sourceKey].seed,
                        'viral': data[key].sources[sourceKey].viral,
                        'lift': viralLift(
                            data[key].sources[sourceKey].seed,
                            data[key].sources[sourceKey].viral
                        ),
                        'share': data[key].sources[sourceKey].seed +
                            data[key].sources[sourceKey].viral
                    });
                });
                helper[key].topList.sort(function (a, b) {
                    return b.share - a.share;
                });
            });

            sum = helper.organic.share +
                helper.team.share +
                helper.paid.share;

            ret.push({
                'id': 'organic',
                'title': 'Organic',
                'percent': getPercent(sum, helper.organic.share),
                'topSource': helper.organic.topList[0] &&
                    helper.organic.topList[0].name ||
                    'N/A',
                'details': helper.organic.topList
            });

            ret.push({
                'id': 'team',
                'title': 'Team',
                'percent': getPercent(sum, helper.team.share),
                'topSource': helper.team.topList[0] &&
                    helper.team.topList[0].name ||
                    'N/A',
                'details': helper.team.topList
            });

            ret.push({
                'id': 'paid',
                'title': 'Paid',
                'percent': getPercent(sum, helper.paid.share),
                'topSource': helper.paid.topList[0] &&
                    helper.paid.topList[0].name ||
                    'N/A',
                'details': helper.paid.topList
            });

            return ret;
        });
    };

    content.getInfo = function (sessionId, contentId) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/content/info'
        ].join(''), {
            'session_id': sessionId,
            'content_id': Number(contentId),
            'cache': [
                sessionId,
                contentId
            ]
        }).then(function (res) {
            return res.data;
        });
    };

    return content;
}]);
