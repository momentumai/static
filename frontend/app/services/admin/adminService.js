/*global momentum, bvConfig*/
momentum.factory('admin', ['$http', function ($http) {
    var admin = {};

    admin.addTeam = function (sessionId, team, email, code, partner, amount) {
        return $http.post([
            bvConfig.endpoint,
            'admin/team/add'
        ].join(''), {
            'session_id': sessionId,
            'email': email,
            'team_name': team,
            'partner': partner,
            'send_code': code,
            'payment_amount': amount
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    admin.getTeamInactive = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'admin/team/inactive/get'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    admin.setTeamInactive = function (sessionId, status) {
        return $http.post([
            bvConfig.endpoint,
            'admin/team/inactive/set'
        ].join(''), {
            'session_id': sessionId,
            'status': Number(status)
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    admin.getPayment = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'admin/team/payment/get'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    admin.setPayment = function (sessionId, amount) {
        return $http.post([
            bvConfig.endpoint,
            'admin/team/payment/set'
        ].join(''), {
            'session_id': sessionId,
            'amount': Number(amount)
        }).then(function (resp) {
            if (resp.data.errorMessage) {
                throw resp.data.errorMessage.split(':')[2];
            }
            return resp.data;
        });
    };

    return admin;
}]);
