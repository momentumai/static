/*global momentum, Stripe, window */
momentum.controller('BillingSettingsController', [
    'toast',
    'account',
    'formHelper',
    '$scope',
    '$state',
    '$q',
    '$timeout',
    'stripe',
    function (
        toast,
        account,
        formHelper,
        $scope,
        $state,
        $q,
        $timeout,
        stripe
    ) {
        function animate () {
            $timeout(function () {
                $scope.payment.animate();
            });
        }

        function getPayment () {
            return account.getPayment(
                $scope.sessionId
            ).then(function (resp) {
                $scope.payment.status = Boolean(resp.status);
                $scope.payment.amount = resp.amount;
                $scope.payment.name = resp.name;
                if (!resp.status) {
                    $state.go('root.main.dashboard.history');
                }
            });
        }

        $scope.payment = {
            'dataLoading': false,
            'amount': 0,
            'status': false,
            'states': {},
            'countries': {},
            'company': '',
            'error': '',
            'stripe': {
                'number': '',
                'expiry': '',
                'cvc': '',
                'address_city': '',
                'address_country': '',
                'address_line1': '',
                'address_zip': ''
            },
            'pay': function () {
                return $q(function (resolve, reject) {
                    var data = $scope.payment.stripe,
                        exp = $scope.payment.stripe.expiry || '';

                    /* You must not change the following 4 lines! */
                    exp = exp.toString();
                    exp = exp.split('/');
                    data.exp_month = exp && Number(exp[0]) || '';
                    data.exp_year = exp && Number(exp[1]) || '';
                    data.address_country = $scope.payment.countries.selected;
                    delete data.expiry;
                    $scope.payment.dataLoading = true;
                    Stripe.card.createToken(
                        data,
                        function (status, resp) {
                            if (resp.error) {
                                reject(resp.error.message);
                            }
                            resolve(resp);
                        }
                    );
                }).then(function (resp) {
                    var data = {};

                    data.client_ip = resp.client_ip;
                    data.address_country = $scope.payment.countries.selected;
                    data.address_line1 =  $scope.payment.stripe.address_line1;
                    data.address_zip =  $scope.payment.stripe.address_zip;
                    data.address_city =  $scope.payment.stripe.address_city;
                    data.company = $scope.payment.company;
                    return stripe.pay(
                        $scope.sessionId,
                        data,
                        resp.id
                    );
                }).then(function (resp) {
                    if (resp === 'success') {
                        window.location.reload(true);
                    } else {
                        throw resp.toString();
                    }
                }).catch(function (err) {
                    $scope.payment.dataLoading = false;
                    $scope.payment.error = err;
                    return false;
                });
            }
        };

        $scope.payment.countries = {
            'data': formHelper.countries,
            'selected': 'GB',
            'label': 'Country'
        };

        function getBilling () {
            return stripe.getBilling(
                $scope.sessionId
            ).then(function (resp) {
                $scope.payment.countries.selected =
                    resp.address_country || 'GB';
                $scope.payment.stripe.address_line1 = resp.address_line1;
                $scope.payment.stripe.address_zip = resp.address_zip;
                $scope.payment.stripe.address_country = resp.address_country;
                $scope.payment.stripe.address_city = resp.address_city;
                $scope.payment.company = resp.company;
            });
        }

        $scope.viewLoaded = 0;

        function init () {
            var promises = {
                'payment': getPayment(),
                'getBilling': getBilling(),
                'stripe': stripe.init()
            };

            return $q.all(promises).then(function () {
                animate();
                $scope.viewLoaded = 1;
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
