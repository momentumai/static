/*global momentum, bvConfig */
momentum.controller('HelpController', [
    '$timeout',
    '$sce',
    '$scope',
    function ($timeout, $sce, $scope) {
        $scope.viewLoaded = 0;
        $scope.videoContainer = {
            'video': $sce.trustAsHtml(
                bvConfig.tutorialVideo
            )
        };

        function animate () {
            $timeout(function () {
                $scope.videoContainer.animate();
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
