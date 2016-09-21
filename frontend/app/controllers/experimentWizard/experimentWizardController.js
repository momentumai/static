/*global momentum */
momentum.controller('ExperimentWizardController', [
    'dialog',
    'fb',
    '$state',
    '$timeout',
    '$scope',
    function (dialog, fb, $state, $timeout, $scope) {
        $scope.selectPage = {
            'pages': {
                'selected': null,
                'data': null
            },
            'submit': function () {
                if (!$scope.imageList.data.length ||
                    !$scope.textList.data.length) {
                    return dialog.open({
                        'htmlText': 'One image and set of texts required'
                    });
                }
                $state.go('root.experimentWizardPreview', {
                    'config': {
                        'page': $scope.selectPage.pages.selected,
                        'images': $scope.imageList.data,
                        'texts': $scope.textList.data
                    },
                    'contentId': $scope.stateParams.contentId
                }, {
                    'location': false
                });
            }
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
                $scope.selectPage.animate();
            });
        }

        function init () {
            return fb.listAssets(
                $scope.sessionId
            ).then(function (a) {
                a = a.filter(function (act) {
                    return act.type === 'page';
                }).sort(function (a, b) {
                    return Number(b.default) - Number(a.default);
                }).map(function (act) {
                    return {
                        'label': act.display,
                        'id': act.value
                    };
                });

                $scope.selectPage.pages.data = a;
                $scope.selectPage.pages.selected = a[0].id;
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
