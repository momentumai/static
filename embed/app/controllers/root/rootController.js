/*global momentum, window*/
momentum.controller('RootController', [
    '$stateParams',
    '$rootScope',
    '$q',
    '$state',
    '$scope',
    'redirect',
    'storage',
    'auth',
    'tab',
    function (
        $stateParams,
        $rootScope,
        $q,
        $state,
        $scope,
        redirect,
        storage,
        auth,
        tab
    ) {
        var promises = [];

        $scope.loaded = 0;
        $scope.state = $state;

        function destroyMomentum () {
            window.parent.postMessage('destroyMomentum', '*');
        }

        promises.push(storage.getSessionId());
        promises.push(tab.getUrl());

        $scope.stateParams = $stateParams;

        $q.all(promises).then(function (res) {
            if (!res[0]) {
                redirect.toAuth();
            }
            $scope.sessionId = res[0];
            $scope.tabUrl = res[1];
            return auth.getUser($scope.sessionId);
        }).then(function (user) {
            $scope.user = user;
            $scope.loaded = 1;
            $scope.$broadcast('loaded');

            if (!Number(user.is_super) && user.payment_amount) {
                redirect.toBilling();
            }
        });

        $rootScope.destroyMomentum =  destroyMomentum;
    }
]);
