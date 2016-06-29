/*global momentum, bvConfig*/
momentum.factory('account', ['$http', function ($http) {
    var account = {};

    account.changePassword = function (sessionId, password, newPassword) {
        return $http.post([
            bvConfig.endpoint,
            'auth/password/change'
        ].join(''), {
            'session_id': sessionId,
            'password': password,
            'new_password': newPassword
        });
    };

    account.getPayment = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/payment/get'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    return account;
}]);
