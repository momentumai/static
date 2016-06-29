/*global momentum */
momentum.controller('PasswordSetupController', [
    'auth',
    '$state',
    '$scope',
    '$stateParams',
    'toast',
    'dialog',
    function (auth, $state, $scope, $stateParams, toast, dialog) {
        $scope.setup = {
            'dataLoading': 0,
            'password': '',
            'send': function () {
                $scope.setup.dataLoading = 1;
                auth.setupPassword(
                    $stateParams.email,
                    $stateParams.token,
                    $scope.setup.password
                ).then(function () {
                    toast.open({
                        'htmlText': 'New password saved'
                    });
                }).catch(function (err) {
                    dialog.open({
                        'htmlText': err
                    }).finally(function () {
                        $scope.setup.dataLoading = 0;
                    });
                });
            }
        };
    }
]);
