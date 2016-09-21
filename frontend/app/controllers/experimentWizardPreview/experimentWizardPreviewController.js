/*global momentum */
momentum.controller('ExperimentWizardPreviewController', [
    '$timeout',
    '$scope',
    function ($timeout, $scope) {
        $scope.viewLoaded = 0;

        function animate () {
            $timeout(function () {
                //ignore
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
