/*global momentum, bvConfig */
momentum.factory('experiments', [
    '$q',
    '$http',
    function ($q, $http) {
        var experiments = {};

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

        function formatExperiment (e) {
            e.click = getK(e.click);
            e.fb_actions = getK(e.fb_actions);
            e.landing = e.landing === -1 ? 'N/A' : round(e.landing);
            e.latest_endtime = toShortDate(new Date(e.latest_endtime));

            e.tests.forEach(function (t) {
                t.click = getK(t.click);
                t.fb_actions = getK(t.fb_actions);
                t.landing = t.landing === -1 ? 'N/A' : round(t.landing);
                t.start_time = toShortDate(new Date(t.start_time));
                t.end_time = toShortDate(new Date(t.end_time));
            });
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

                experiment.data.forEach(formatExperiment);

                return experiment;
            });
        };

        experiments.get = function (sessionId, contentId) {
            return $http.post([
                bvConfig.endpoint,
                'experiment/get'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId
            }).then(function (res) {
                var e = res.data;

                formatExperiment(e);

                return e;
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

        experiments.edit = function (sessionId, contentId, data) {
            return $http.post([
                bvConfig.endpoint,
                'experiment/edit'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId,
                'data': data
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        experiments.editTest = function (sessionId, testId, data) {
            return $http.post([
                bvConfig.endpoint,
                'experiment/test/edit'
            ].join(''), {
                'session_id': sessionId,
                'id': testId,
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
