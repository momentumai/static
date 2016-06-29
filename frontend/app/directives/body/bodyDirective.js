/*global momentum*/
momentum.directive('body', [
    'storage',
    '$state',
    'auth',
    function (storage, $state, auth) {
        return {
            'restrict': 'A',
            'templateUrl': 'body.tpl.html',
            'link': function ($scope) {
                $scope.logout = function () {
                    return auth.logout($scope.sessionId).then(function () {
                        return storage.clearAuthData();
                    }).then(function () {
                        $state.go('auth');
                    });
                };
            }
        };
    }
]);
