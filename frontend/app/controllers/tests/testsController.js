/*global momentum, angular */
momentum.controller('TestsController', [
    'category',
    'experiments',
    'toast',
    '$rootScope',
    '$timeout',
    '$q',
    '$scope',
    function (category, experiments, toast, $rootScope, $timeout, $q, $scope) {
        $scope.viewLoaded = 0;
        $scope.testListBase = {
            'sum': 0,
            'cnt': 0,
            'next': function () {
                var t = $scope.testList;

                t.loading = 1;
                experiments.tests.list(
                    $scope.sessionId,
                    $scope.stateParams.expId,
                    8,
                    Math.min(t.offset + 8, t.cnt)
                ).then(function (t) {
                    $scope.testList = angular.extend(
                        {},
                        $scope.testListBase,
                        t
                    );
                });
            },
            'prev': function () {
                var t = $scope.testList;

                t.loading = 1;
                experiments.tests.list(
                    $scope.sessionId,
                    $scope.stateParams.expId,
                    8,
                    Math.max(t.offset - 8, 0)
                ).then(function (t) {
                    $scope.testList = angular.extend(
                        {},
                        $scope.testListBase,
                        t
                    );
                });
            }
        };

        $scope.testList = $scope.testListBase;

        $scope.testAsideBase = {
            'save': function () {
                console.log($scope.testAside);
                return toast.open({
                    'htmlText': 'Experiment saved successfully'
                });
            }
        };
        $scope.testAside = $scope.testAsideBase;

        function animate () {
            $timeout(function () {
                $scope.testList.animate();
                $scope.testAside.animate();
            });
        }

        function init () {
            var promises = {};

            promises['tests'] = experiments.tests.list(
                $scope.sessionId,
                $scope.stateParams.expId,
                8,
                0
            ).then(function (tests) {
                $scope.testList = angular.extend(
                    {},
                    $scope.testListBase,
                    tests
                );
            });

            promises['exp'] = experiments.get(
                $scope.sessionId,
                $scope.stateParams.expId
            ).then(function (exp) {
                var model = {
                    'budget': exp.adset.lifetime_budget / exp.meta.offset,
                    'currency': exp.meta.currency
                };

                model.from = new Date(exp.adset.start_time);
                model.to = new Date(model.from.getTime());
                model.to.setUTCFullYear(model.to.getUTCFullYear() + 1);
                model.until = new Date(exp.adset.end_time);

                $rootScope.title = exp.name;

                $scope.testAside = angular.extend(
                    {},
                    $scope.testAsideBase,
                    model
                );
            });

            $q.all(promises).then(function () {
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
