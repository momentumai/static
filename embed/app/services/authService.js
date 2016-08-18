/*global momentum, bvConfig*/
momentum.factory('auth', ['$http', function ($http) {
    var auth = {};

    auth.getUser = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user'
        ].join(''), {
            'session_id': sessionId
        }).then(function (res) {
            return res.data;
        });
    };

    return auth;
}]);

