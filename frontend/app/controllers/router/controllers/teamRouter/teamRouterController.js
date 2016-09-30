/*global momentum, window*/
momentum.controller('TeamRouterController', [
    '$scope',
    '$state',
    '$stateParams',
    'storage',
    'category',
    'auth',
    function (
        $scope,
        $state,
        $stateParams,
        storage,
        category,
        auth
    ) {
        $scope.text = 'Switching team...';
        $scope.sessionId = null;

        storage.getSessionId().then(function (sessionId) {
            $scope.sessionId = sessionId;
            return auth.setTeam(sessionId, $stateParams.teamId);
        }).then(function () {
            $scope.text = 'Changing filters...';
            return category.setSelected($scope.sessionId, {
                'category': 'all',
                'subCategory': 'all',
                'subSubCategory': 'all'
            });
        }).then(function () {
            if ($stateParams.redirect) {
                $scope.text = 'Redirecting...';
                window.location.href = decodeURIComponent(
                    $stateParams.redirect
                );
            } else {
                $state.go('root.main.dashboard.history');
            }
            window.location.reload(true);
        }).catch(function () {
            $scope.text = 'The page cannot be displayed.';
        });
    }
]);
