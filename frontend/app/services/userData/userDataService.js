/*global momentum, bvConfig*/
momentum.factory('userData', ['$http',
function ($http) {
    var userData = {};

    userData.get = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/data/list'
        ].join(''), {
            'session_id': sessionId
        }).then(function (res) {
            return res.data;
        });
    };

    userData.set = function (sessionId, key, value) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/data/set'
        ].join(''), {
            'session_id': sessionId,
            'key': key,
            'value': value
        });
    };

    return userData;
}]);
