/*global momentum, bvConfig*/
momentum.factory('teamUserData', ['$http',
function ($http) {
    var teamUserData = {};

    teamUserData.get = function (sessionId, key) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/user/data/get'
        ].join(''), {
            'session_id': sessionId,
            'key': key
        }).then(function (res) {
            return res.data;
        });
    };

    teamUserData.set = function (sessionId, key, value) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/user/data/set'
        ].join(''), {
            'session_id': sessionId,
            'key': key,
            'value': value
        });
    };

    return teamUserData;
}]);
