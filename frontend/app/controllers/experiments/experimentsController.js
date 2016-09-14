/*global momentum, angular */
momentum.controller('ExperimentsController', [
    'category',
    'experiments',
    '$timeout',
    '$q',
    '$scope',
    function (category, experiments, $timeout, $q, $scope) {
        $scope.viewLoaded = 0;
        $scope.experimentListBase = {
            'sum': 0,
            'cnt': 0,
            'next': function () {
                var ex = $scope.experimentList;

                ex.loading = 1;
                experiments.list(
                    $scope.sessionId,
                    8,
                    Math.min(ex.offset + 8, ex.cnt)
                ).then(function (exp) {
                    $scope.experimentList = angular.extend(
                        {},
                        $scope.experimentListBase,
                        exp
                    );
                });
            },
            'prev': function () {
                var ex = $scope.experimentList;

                ex.loading = 1;
                experiments.list(
                    $scope.sessionId,
                    8,
                    Math.max(ex.offset - 8, 0)
                ).then(function (exp) {
                    $scope.experimentList = angular.extend(
                        {},
                        $scope.experimentListBase,
                        exp
                    );
                });
            }
        };

        $scope.experimentList = $scope.experimentListBase;
        $scope.experimentAside = {};

        function animate () {
            $timeout(function () {
                $scope.experimentList.animate();
                $scope.experimentAside.animate();
            });
        }

        function init () {
            var promises = {};

            promises['exp'] = experiments.list(
                $scope.sessionId,
                8,
                0
            ).then(function (exp) {
                $scope.experimentList = angular.extend(
                    {},
                    $scope.experimentListBase,
                    exp
                );
            });

            promises['cat'] = category.getSelected(
                $scope.sessionId
            ).then(function (res) {
                $scope.experimentAside.cat1 = res[0] || 'ALL';
                $scope.experimentAside.cat2 = res[1] || 'ALL';
                $scope.experimentAside.cat3 = res[2] || 'ALL';
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
