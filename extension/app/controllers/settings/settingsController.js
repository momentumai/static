/*global momentum */
momentum.controller('SettingsController', [
    'storage',
    '$scope',
    function (storage, $scope) {
        $scope.notif = {};
        $scope.notif.enabled = true;

        $scope.notif.changeNotifStatus = function () {
            storage.changeNotifStatus(!$scope.notif.enabled);
        };

        function init () {
            storage.getNotifStatus().then(function (status) {
                $scope.notif.enabled = !status;
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
