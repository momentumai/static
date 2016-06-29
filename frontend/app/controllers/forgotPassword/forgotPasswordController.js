/*global momentum */
momentum.controller('ForgotPasswordController', [
    'auth',
    '$state',
    '$scope',
    'toast',
    'dialog',
    function (auth, $state, $scope, toast, dialog) {
        $scope.forgot = {
            'dataLoading': 0,
            'email': '',
            'send': function () {
                $scope.forgot.dataLoading = 1;
                auth.forgotPassword(
                    $scope.forgot.email
                ).then(function () {
                    toast.open({
                        'htmlText': 'Reminder email sent'
                    }).finally(function () {
                        $state.go('auth');
                    });
                }).catch(function (err) {
                    return dialog.open({
                        'htmlText': err
                    }).finally(function () {
                        $scope.forgot.dataLoading = 0;
                    });
                });
            }
        };
    }
]);
