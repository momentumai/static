/*global momentum */
momentum.controller('FacebookController', [
    'auth',
    'fb',
    '$timeout',
    '$scope',
    function (auth, fb, $timeout, $scope) {
        $scope.viewLoaded = 0;

        function loadConnected () {
            return fb.connected($scope.sessionId).then(function (state) {
                $scope.facebookConnected.state = state;
            });
        }

        function animate () {
            $timeout(function () {
                $scope.facebookConnected.animate();
            });
        }

        $scope.facebookConnected = {
            'state': '',
            'renew': function () {
                fb.login().then(function (accessToken) {
                    return fb.token(
                        $scope.sessionId,
                        accessToken
                    );
                }).then(function () {
                    return loadConnected();
                });
            }
        };

        function init () {
            loadConnected().then(function () {
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
