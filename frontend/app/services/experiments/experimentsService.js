/*global momentum, angular */
momentum.factory('experiments', [
    '$q',
    function ($q) {
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

        function toShortDate (timestamp) {
            var date = new Date(timestamp * 1000),
                months = [
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

        function getDummyExperiments (params) {
            var dummyExperiment = {
                'id': 18837,
                'cId': '959ace8a-1263-4ccc-8fd9-5fc4bdbfef0d',
                'seed': 2,
                'viral': 0,
                'created_at': 1473813900,
                'active': true,
                'status': 'ACTIVE',
                'name': 'Dummy experiment',
                'url': 'google.com',
                'from': 1473814693,
                'to': 1473986700,
                'conversion': 2,
                'click': 0,
                'landing': -1,
                'lift': 1,
                'cpa': 'N/A',
                'spend': '£0.0',
                'meta': {
                    'page': 'FourFourTwo USA',
                    'audience': '2% Lookalike_13-50_USA',
                    'adaccount': 'FourFourTwo USA',
                    'currency': 'GBP',
                    'offset': 100
                },
                'adset': {
                    'name': 'Dummy experiment',
                    'start_time': '2016-09-14T01:58:13+0100',
                    'end_time': '2016-09-16T01:45:00+0100',
                    'effective_status': 'ACTIVE',
                    'lifetime_budget': '2000',
                    'ads': {
                        'data': [
                            {
                                'effective_status': 'ACTIVE',
                                'id': '6050205780203'
                            }
                        ],
                        'paging': {
                            'cursors': {
                                'before': 'NjA1MDIwNTc4MDIwMwZDZD',
                                'after': 'NjA1MDIwNTc4MDIwMwZDZD'
                            }
                        }
                    },
                    'id': '6050205778203'
                }
            };

            return $q.resolve({
                'data': {
                    'data': new Array(8).fill(
                        null
                    ).map(function (ignore, index) {
                        return angular.extend(
                            {},
                            dummyExperiment,
                            {
                                'id': String(index)
                            }
                        );
                    }),
                    'cnt': 80,
                    'sum': 8,
                    'offset': params.offset || 0
                }
            });
        }

        experiments.list = function (sessionId, limit, offset) {
            var params = {
                'session_id': sessionId
            };

            if (Number(limit)) {
                params.limit = Number(limit);
            }

            if (Number(offset)) {
                params.offset = Number(offset);
            }

            return getDummyExperiments(params).then(function (resp) {
                var campaigns = resp.data;

                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }

                campaigns.data.forEach(function (campaign) {
                    campaign.from = toShortDate(campaign.from);
                    campaign.to = toShortDate(campaign.to);
                    campaign.conversion = getK(campaign.conversion);
                    campaign.click = getK(campaign.click);
                    if (campaign.landing < 0) {
                        campaign.landing = 'N/A';
                    } else {
                        campaign.landing = round(campaign.landing);
                    }
                    if (campaign.lift > 10) {
                        campaign.lift = getK(campaign.lift);
                    } else {
                        campaign.lift = round(campaign.lift);
                    }
                });

                return resp.data;
            });
        };

        return experiments;
    }
]);
