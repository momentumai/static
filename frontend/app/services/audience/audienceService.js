/*global momentum, bvConfig*/
momentum.factory('audience', ['$q', '$http', function ($q, $http) {
    var audience = {};

    audience.list = function () {
        return $q.resolve().then(function () {
            var res = {
                'act_1136171943066150': [{
                    'id': 'random_id',
                    'name': 'Programozok akik hotfixelnek',
                    'data': {
                        'custom_audiences': [{'id': '6042873124795'}]
                    }
                }, {
                    'id': 'random_id2',
                    'name': 'Programozok akik meg mindig hotfixelnek',
                    'data': {
                        'custom_audiences': [{'id': '6042873124795'}]
                    }
                }, {
                    'id': 'random_id3',
                    'name': 'Programozok akik meg mindig hotfixelnek :(',
                    'data': {
                        'custom_audiences': [{'id': '6042873124795'}]
                    }
                }]
            };

            return res;
        });
    };

    audience.dummy = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'dummy'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    return audience;
}]);
