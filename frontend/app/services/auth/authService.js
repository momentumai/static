/*global momentum, bvConfig*/
momentum.factory('auth', ['$http', function ($http) {
    var auth = {};

    auth.login = function (email, password) {
        return $http.post([
            bvConfig.endpoint,
            'auth/login'
        ].join(''), {
            'email': email,
            'password': password
        });
    };

    auth.logout = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/logout'
        ].join(''), {
            'session_id': sessionId
        });
    };

    auth.getUser = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            resp.data.is_super = Number(resp.data.is_super);
            resp.data.is_admin = Number(resp.data.is_admin);
            resp.data.payment_amount = Number(resp.data.payment_amount);
            return resp.data;
        });
    };

    auth.getCode = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/code'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            return resp.data;
        });
    };

    auth.getTeams = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/list'
        ].join(''), {
            'session_id': sessionId
        }).then(function (res) {
            var data = res.data,
                ret = {
                    'selected': null,
                    'data': []
                };

            data.forEach(function (team) {
                if (Number(team.active)) {
                    ret.selected = team.id;
                }
                ret.data.push({
                    'id': team.id,
                    'label': team.name
                });
            });
            return ret;
        });
    };

    auth.setTeam = function (sessionId, teamId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team'
        ].join(''), {
            'session_id': sessionId,
            'team_id': Number(teamId)
        }).then(function (res) {
            if (res.data.errorMessage) {
                throw res.data.errorMessage.split(':')[2];
            }
            return $http.post([
                bvConfig.endpoint,
                'auth/user/data/set'
            ].join(''), {
                'session_id': sessionId,
                'key': 'last_team',
                'value': String(teamId)
            });
        });
    };

    auth.getUsers = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/user/list'
        ].join(''), {
            'session_id': sessionId
        }).then(function (res) {
            var ret = [];

            if (res.data.length) {
                res.data.forEach(function (user) {
                    ret.push(user);
                });
            }
            return ret;
        });
    };

    auth.removeUser = function (sessionId, userId) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/remove'
        ].join(''), {
            'session_id': sessionId,
            'user_id': userId
        }).then(function (res) {
            var ret = [];

            if (res.data.length) {
                res.data.forEach(function (user) {
                    ret.push(user);
                });
            }
            return ret;
        });
    };

    auth.inviteUser = function (sessionId, email) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/invite'
        ].join(''), {
            'session_id': sessionId,
            'email': email
        }).then(function (res) {
            var ret = [];

            if (res.data.length) {
                res.data.forEach(function (user) {
                    ret.push(user);
                });
            }
            return ret;
        });
    };

    auth.forgotPassword = function (email) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/forgot'
        ].join(''), {
            'email': email
        }).then(function (res) {
            if (res.data.errorMessage) {
                throw res.data.errorMessage.split(':')[2];
            }
            return res.data;
        });
    };

    auth.setupPassword = function (email, token, password) {
        return $http.post([
            bvConfig.endpoint,
            'auth/user/forgot/setup'
        ].join(''), {
            'email': email,
            'token': token,
            'password': password
        }).then(function (res) {
            if (res.data.errorMessage) {
                throw res.data.errorMessage.split(':')[2];
            }
            return res.data;
        });
    };

    auth.switchAdminState = function (sessionId, userId, state) {
        return $http.post([
            bvConfig.endpoint,
            'auth/team/user/modify'
        ].join(''), {
            'session_id': sessionId,
            'user_id': userId,
            'state': state
        });
    };

    return auth;
}]);
