/*global momentum, angular */
momentum.controller('ExperimentWizardPreviewController', [
    'fb',
    '$timeout',
    '$scope',
    function (fb, $timeout, $scope) {
        $scope.viewLoaded = 0;
        $scope.previewList = {
            'data': []
        };

        function animate () {
            $timeout(function () {
                $scope.previewList.animate();
            });
        }

        function generatePreviews () {
            $scope.stateParams.config.texts.forEach(function (textSet) {
                $scope.stateParams.config.images.forEach(function (image) {
                    $scope.previewList.data.push(
                        angular.extend(
                            {
                                'image': image
                            },
                            textSet
                        )
                    );
                });
            });
        }

        function init () {
            fb.get(
                [
                    '/',
                    $scope.stateParams.config.page,
                    '?fields=name,picture'
                ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.pageData = {
                    'name': res.name,
                    'picture': res.picture &&
                        res.picture.data &&
                        res.picture.data.url
                };
                generatePreviews();
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
