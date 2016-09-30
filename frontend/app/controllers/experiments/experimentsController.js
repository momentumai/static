/*global momentum, angular */
momentum.controller('ExperimentsController', [
    'category',
    'experiments',
    'dialog',
    '$timeout',
    '$q',
    '$state',
    '$scope',
    function (category, experiments, dialog, $timeout, $q, $state, $scope) {
        $scope.viewLoaded = 0;

        $scope.experimentListStack = [];

        $scope.experimentListBase = {
            'sum': 0,
            'next': function () {
                var ex = $scope.experimentList;

                ex.loading = 1;
                experiments.list(
                    $scope.sessionId,
                    8,
                    ex.offset
                ).then(function (exp) {
                    $scope.experimentList = angular.extend(
                        {},
                        $scope.experimentListBase,
                        exp
                    );
                    $scope.experimentListStack.push($scope.experimentList);
                });
            },
            'prev': function () {
                var ex;

                $scope.experimentListStack.pop();
                ex = $scope.experimentListStack[
                    $scope.experimentListStack.length - 1
                ];

                ex.loading = 0;
                $scope.experimentList = ex;
            },
            'toggle': function (experiment) {
                experiment.loading = true;
                experiments.edit(
                    $scope.sessionId,
                    experiment.id,
                    {'active': !experiment.active}
                ).then(function () {
                    experiment.loading = false;
                    experiment.active = !experiment.active;
                }).catch(function (err) {
                    return dialog.open({
                        'htmlText': err
                    });
                });
            },
            'click': function (experiment) {
                $state.go('root.tests', {
                    'expId': experiment.id
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
                null,
                1
            ).then(function (exp) {
                $scope.experimentList = angular.extend(
                    {},
                    $scope.experimentListBase,
                    exp
                );

                $scope.experimentListStack.push($scope.experimentList);
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
