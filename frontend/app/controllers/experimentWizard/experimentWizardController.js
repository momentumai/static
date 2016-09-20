/*global momentum */
momentum.controller('ExperimentWizardController', [
    '$timeout',
    '$scope',
    function ($timeout, $scope) {
        $scope.addImage = {
            'link': '',
            'submit': function () {
                $scope.imageList.data.push($scope.addImage.link);
                $scope.addImage.link = '';
            },
            'max5': function () {
                return $scope.imageList.data.length > 4;
            }
        };

        $scope.addText = {
            'submit': function () {
                $scope.textList.data.push({
                    'message': $scope.addText.message,
                    'headline': $scope.addText.headline,
                    'desc': $scope.addText.desc
                });
                $scope.addText.message = '';
                $scope.addText.headline = '';
                $scope.addText.desc = '';
            },
            'max5': function () {
                return $scope.textList.data.length > 4;
            }
        };

        $scope.imageList = {
            'data': [],
            'remove': function (index) {
                $scope.imageList.data.splice(index, 1);
            },
            'removeAll': function () {
                $scope.imageList.data.length = 0;
            },
            'range': function (n) {
                return new Array(n);
            }
        };

        $scope.textList = {
            'data': [],
            'remove': function (index) {
                $scope.textList.data.splice(index, 1);
            },
            'removeAll': function () {
                $scope.textList.data.length = 0;
            },
            'range': function (n) {
                return new Array(n);
            }
        };

        function animate () {
            $timeout(function () {
                $scope.addImage.animate();
                $scope.imageList.animate();
                $scope.addText.animate();
                $scope.textList.animate();
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
