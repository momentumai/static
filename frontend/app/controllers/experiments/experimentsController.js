/*global momentum */
momentum.controller('ExperimentsController', [
    '$timeout',
    '$scope',
    function ($timeout, $scope) {
        $scope.viewLoaded = 0;
        $scope.experimentList = {
            'sum': 0,
            'cnt': 0
        };

        function animate () {
            $timeout(function () {
                $scope.experimentList.animate();
            });
        }

        function init () {
            animate();
            $scope.viewLoaded = 1;
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
