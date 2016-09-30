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

        $scope.activeTest = null;

        $scope.testList = {
            'data': [],
            'dataRaw': [],
            'offset': 0,
            'sum': 0,
            'cnt': 0,
            'over': function (t) {
                $scope.activeTest = t;
            },
            'leave': function () {
                $scope.activeTest = null;
            },
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
            },
            'edit': function (test) {
                var bData = test.budget_object,
                    model = {
                        'budget': bData.data / bData.currency.offset,
                        'currency': bData.currency.name,
                        'offset': bData.currency.offset
                    };

                model.name = test.name;
                model.from = new Date(test.from);
                model.to = new Date(model.from.getTime());
                model.to.setUTCFullYear(model.to.getUTCFullYear() + 1);
                model.until = new Date(test.to);

                dialog.open({
                    'template': 'testEditDialog.tpl.html',
                    'showCancel': true,
                    'okText': 'Save',
                    'model': model,
                    'dialogClass': 'promotion-form campaign-edit-dialog',
                    'destroy': false
                }).then(function () {
                    return experiments.editTest(
                        $scope.sessionId,
                        test.id,
                        {
                            'end_time': Math.floor(
                                model.until.getTime() / 1000
                            ),
                            'name_text': model.name,
                            'budget': model.offset * model.budget
                        }
                    ).then(function () {
                        dialog.destroy();
                        test.name = model.name;
                        test.budget = Number(
                            model.budget
                        ).toLocaleString('en-EN', {
                            'style': 'currency',
                            'currency': model.currency,
                            'maximumSignificantDigits': 4
                        });
                        test.budget_object.data = model.budget * model.offset;
                        test.to = model.until.toISOString();

                        return toast.open({
                            'htmlText': 'Test edited successfully'
                        });
                    }).catch(function (err) {
                        return dialog.open({
                            'htmlText': err
                        });
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
