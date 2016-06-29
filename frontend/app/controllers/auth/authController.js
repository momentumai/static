/*global momentum, window */
momentum.controller('AuthController', ['storage', 'auth', '$state', '$scope',
function (storage, auth, $state, $scope) {
    $scope.auth = {
        'dataLoading': 0,
        'error': '',
        'email': '',
        'password': '',
        'login': function () {
            $scope.auth.dataLoading = 1;
            $scope.auth.error = '';
            auth.login(
                $scope.auth.email,
                $scope.auth.password
            ).then(function (response) {
                if (response.data.errorMessage) {
                    $scope.auth.dataLoading = 0;
                    $scope.auth.error = response.data.errorMessage.split(
                        ':'
                    )[2];
                } else {
                    storage.storeAuthData(
                        response.data.session_id,
                        response.data.teams
                    ).then(function () {
                        $scope.auth.dataLoading = 0;
                        window.location.href = '/';
                    });
                }
            });
        }
    };
}]);
