/*global momentum, bvConfig */
momentum.factory('experiments', [
    '$q',
    '$http',
    function ($q, $http) {
        var experiments = {
            'tests': {}
        };

        function getK (number) {
            if (number > 1000) {
                return Math.round(number / 1000) + 'k';
            }
            return String(Math.round(number));
        }

        function round (number) {
            var num = Number(number) || 0;

            if (num < 1) {
                return num.toPrecision(2);
            }

            return num.toPrecision(3);
        }

        function toShortDate (date) {
            var months = [
                'Jan.',
                'Feb.',
                'Mar.',
                'Apr.',
                'May',
                'June',
                'July',
                'Aug.',
                'Sept.',
                'Oct.',
                'Nov.',
                'Dec.'
            ];

            return [
                date.getUTCDate(),
                months[date.getUTCMonth()]
            ].join(' ');
        }

        experiments.list = function (
                sessionId,
                limit,
                offset,
                first
        ) {
            var params = {
                'session_id': sessionId
            };

            if (Number(limit)) {
                params.limit = Number(limit);
            }

            if (offset) {
                params.offset = offset;
            }

            return $http.post([
                bvConfig.endpoint,
                'experiment/list'
            ].join(''), params).then(function (res) {
                var experiment = res.data;

                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }

                experiment.sum = experiment.data.length;

                if (first) {
                    experiment.firstPage = true;
                }

                experiment.data.forEach(function (e) {
                    e.click = getK(e.click);
                    e.fb_actions = getK(e.fb_actions);
                    e.landing = e.landing === -1 ? 'N/A' : round(e.landing);
                    e.latest_endtime = toShortDate(new Date(e.latest_endtime));
                });

                return experiment;
            });
        };

        experiments.tests.list = function (sessionId, expId, limit, offset) {
            return experiments.list(
                sessionId,
                limit,
                offset
            ).then(function (res) {
                res.data = res.data.map(function (act) {
                    act.name = 'Dummy test';
                    return act;
                });

                return res;
            });
        };

        experiments.get = function (sessionId, expId) {
            console.log(expId);
            return experiments.list(
                sessionId,
                1,
                0
            ).then(function (res) {
                return res.data[0];
            });
        };

        experiments.create = function (sessionId, data) {
            return $http.post([
                bvConfig.endpoint,
                'experiment/create'
            ].join(''), {
                'session_id': sessionId,
                'data': data
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        return experiments;
    }
]);
