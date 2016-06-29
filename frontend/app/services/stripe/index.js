/*global momentum, Stripe, document, bvConfig*/
momentum.factory('stripe', [
    '$q',
    '$http',
    function ($q, $http) {
        var stripe = {};

        stripe.init = function () {
            return $q(function (resolve) {
                var d = document.createElement('script');

                d.async = 1;
                d.src = 'https://js.stripe.com/v2/';
                document.getElementsByTagName('head')[0].appendChild(d);
                d.onload = function () {
                    Stripe.setPublishableKey(bvConfig.stripe.public);
                    resolve();
                };
            });
        };

        stripe.pay = function (sessionId, info, token) {
            return $http.post([
                bvConfig.endpoint,
                'stripe/pay'
            ].join(''), {
                'session_id': sessionId,
                'info': info,
                'token': token
            }).then(function (resp) {
                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }
                return resp.data;
            });
        };

        stripe.getBilling = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'stripe/get/billing'
            ].join(''), {
                'session_id': sessionId
            }).then(function (resp) {
                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }
                return resp.data;
            });
        };

        return stripe;
    }
]);
