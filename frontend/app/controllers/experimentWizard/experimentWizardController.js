/*global momentum */
momentum.controller('ExperimentWizardController', [
    'dialog',
    'fb',
    'content',
    '$q',
    '$state',
    '$timeout',
    '$scope',
    function (dialog, fb, content, $q, $state, $timeout, $scope) {
        $scope.preview = function () {
            if (!$scope.imageList.data.length ||
                !$scope.textList.data.length) {
                return dialog.open({
                    'htmlText': 'One image and set of texts required'
                });
            }
            $state.go('root.experimentWizardPreview', {
                'config': {
                    'images': $scope.imageList.data,
                    'texts': $scope.textList.data
                },
                'content': $scope.content,
                'contentId': $scope.stateParams.contentId
            }, {
                'location': false
            });
        };

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
            var promises = {};

            promises['content'] = content.info(
                $scope.sessionId,
                $scope.stateParams.contentId
            );

            $q.all(promises).then(function (res) {
                var c = res.content,
                    textSet = {};

                $scope.content = c;

                if (c.image) {
                    $scope.imageList.data.push(c.image);
                }

                textSet.headline = (c.title || c.url).substr(
                    0,
                    80
                );

                if (c.description) {
                    textSet.desc = c.description.substr(
                        0,
                        200
                    );
                }

                $scope.textList.data.push(textSet);

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
