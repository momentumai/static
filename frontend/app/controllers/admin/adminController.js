/*global momentum, confirm*/
momentum.controller('AdminController', [
    '$timeout',
    '$scope',
    'admin',
    'storage',
    'toast',
    'dialog',
    '$q',
    function ($timeout, $scope, admin, storage, toast, dialog, $q) {
        $scope.viewLoaded = 0;

        $scope.addUser = {
            'dataLoading': 0,
            'email': '',
            'teamName': '',
            'sendCode': true,
            'forcePayment': false,
            'partner': false,
            'sendCodeTo': '',
            'paymentAmount': 0,
            'send': function () {
                var sendCode = $scope.addUser.sendCode,
                    amount = Number($scope.addUser.paymentAmount),
                    forcePayment = $scope.addUser.forcePayment;

                $scope.addUser.dataLoading = 1;
                admin.addTeam(
                    $scope.sessionId,
                    $scope.addUser.teamName,
                    $scope.addUser.email,
                    sendCode ? $scope.addUser.sendCodeTo : '',
                    Number($scope.addUser.partner),
                    forcePayment ? amount : 0
                ).then(function (resp) {
                    $scope.addUser.dataLoading = 0;
                    return dialog.open({
                        'dialogClass': 'auto-width',
                        'htmlText': [
                            'Team has been added<br /><br />',
                            'Insert code:<br />',
                            '<textarea',
                            ' spellcheck="false" id="tr-code"',
                            ' readonly class="code-cont">',
                            resp,
                            '</textarea>'
                        ].join('')
                    }).catch(function () {});
                }).catch(function (err) {
                    return dialog.open({
                        'htmlText': err
                    }).finally(function () {
                        $scope.addUser.dataLoading = 0;
                    });
                });
            },
            'emailChange': function () {
                $scope.addUser.sendCodeTo = $scope.addUser.email;
            }
        };
        $scope.payment = {
            'dataLoading': 0,
            'status': false,
            'amount': 0,
            'name': '',
            'change': function () {
                var amount = $scope.payment.status ?
                    Number($scope.payment.amount) : 0;

                $scope.payment.dataLoading = 1;
                return admin.setPayment(
                    $scope.sessionId,
                    amount
                ).then(function () {
                    $scope.payment.dataLoading = 0;
                    return toast.open({
                        'htmlText': 'Payment settings have been saved'
                    });
                });
            }
        };

        $scope.demo = {
            'status': storage.getDemo() || 0,
            'change': function () {
                $scope.demo.status = $scope.demo.status === 1 ? 0 : 1;
                storage.setDemo($scope.demo.status);
            }
        };

        function confirmInactive () {
            var text = [
                'Are you sure you want to ',
                $scope.inactivate.status ? 'disable' : 'enable',
                ' tracking for ',
                $scope.inactivate.name
            ].join('');

            return confirm(text);
        }

        $scope.inactivate = {
            'status': null,
            'name': '',
            'change': function () {
                if (confirmInactive()) {
                    $scope.inactivate.status = $scope.inactivate.status ? 0 : 1;
                    return admin.setTeamInactive(
                        $scope.sessionId,
                        $scope.inactivate.status
                    ).then(function () {
                        return toast.open({
                            'htmlText': [
                                'Tracking code is ',
                                $scope.inactivate.status ?
                                    'enabled' : 'disabled'
                            ].join('')
                        });
                    });
                }
            }
        };

        function getTeamInactive () {
            return admin.getTeamInactive(
                $scope.sessionId
            ).then(function (resp) {
                $scope.inactivate.status = Number(resp.status);
                $scope.inactivate.name = resp.name;
            });
        }

        function getPayment () {
            return admin.getPayment(
                $scope.sessionId
            ).then(function (resp) {
                $scope.payment.status = Boolean(resp.status);
                $scope.payment.amount = resp.amount;
                $scope.payment.name = resp.name;
            });
        }

        function animate () {
            $timeout(function () {
                $scope.addUser.animate();
                $scope.demo.animate();
                $scope.inactivate.animate();
                $scope.payment.animate();
            });
        }

        function init () {
            var promises = [];

            promises.push(getTeamInactive());
            promises.push(getPayment());

            $q.all(promises).then(function () {
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
