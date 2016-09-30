/*global momentum */
momentum.controller('TestsController', [
    'category',
    'experiments',
    'toast',
    'dialog',
    '$rootScope',
    '$timeout',
    '$q',
    '$scope',
    function (
        category,
        experiments,
        toast,
        dialog,
        $rootScope,
        $timeout,
        $q,
        $scope
    ) {
        $scope.viewLoaded = 0;
        $scope.testList = {
            'data': [],
            'dataRaw': [],
            'offset': 0,
            'sum': 0,
            'cnt': 0,
            'next': function () {
                $scope.testList.offset = Math.min(
                    $scope.testList.offset + 8,
                    $scope.testList.cnt
                );
                $scope.testList.data = $scope.testList.dataRaw.slice(
                    $scope.testList.offset,
                    $scope.testList.offset + 8
                );
                $scope.testList.sum = $scope.testList.data.length;
            },
            'prev': function () {
                $scope.testList.offset = Math.max(
                    $scope.testList.offset - 8,
                    0
                );
                $scope.testList.data = $scope.testList.dataRaw.slice(
                    $scope.testList.offset,
                    $scope.testList.offset + 8
                );
                $scope.testList.sum = $scope.testList.data.length;
            },
            'toggle': function (test) {
                test.loading = true;
                experiments.editTest(
                    $scope.sessionId,
                    test.id,
                    {'active': !test.active}
                ).then(function () {
                    test.loading = false;
                    test.active = !test.active;
                }).catch(function (err) {
                    return dialog.open({
                        'htmlText': err
                    });
                });
            }
        };

        $scope.testAside = null;

        function animate () {
            $timeout(function () {
                $scope.testList.animate();
                $scope.testAside.animate();
            });
        }

        function init () {
            var promises = {};

            promises['exp'] = experiments.get(
                $scope.sessionId,
                $scope.stateParams.expId
            ).then(function (exp) {
                $rootScope.title = exp.name;

                $scope.testList.dataRaw = exp.tests;
                $scope.testList.cnt = exp.tests.length;
                $scope.testList.data = exp.tests.slice(0, 8);
                $scope.testList.sum = $scope.testList.data.length;

                $scope.testAside = exp;
            });

            $q.all(promises).then(function () {
                animate();
                $scope.viewLoaded = 1;
            });
        }

        $scope.$on('$destroy', function () {
            $rootScope.title = '';
        });

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
