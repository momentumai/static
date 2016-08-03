/*global momentum, bvConfig, angular */
momentum.factory('audience', ['$q', '$http', function ($q, $http) {
    var audience = {};

    audience.list = function (sessionId) {
        return $http.post([
            bvConfig.endpoint,
            'audience/list'
        ].join(''), {
            'session_id': sessionId
        }).then(function (resp) {
            var res = resp.data,
                ret = {};

            res.forEach(function (au) {
                ret[au['ad_account']] = ret[au['ad_account']] || [];
                ret[au['ad_account']].push(au);
            });

            Object.keys(ret).forEach(function (accountId) {
                ret[accountId].forEach(function (audience) {
                    audience.$original = angular.copy(audience);
                });
            });

            return ret;
        });
    };

    audience.save = function (params) {
        return $http.post([
            bvConfig.endpoint,
            'audience/save'
        ].join(''), params).then(function (resp) {
            return resp.data;
        });
    };

    return audience;
}]);
