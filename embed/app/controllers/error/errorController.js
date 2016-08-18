/*global momentum*/
momentum.controller('ErrorController', [
    '$stateParams',
    '$scope',
    function ($stateParams, $scope) {
        $scope.viewLoaded = 0;
        $scope.stateParams = $stateParams;

        function init () {
            $scope.viewLoaded = 1;
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
