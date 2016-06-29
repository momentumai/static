/*global momentum */
momentum.controller('PromotionController', [
    '$stateParams',
    '$state',
    'fb',
    '$q',
    '$scope',
    function ($stateParams, $state, fb, $q, $scope) {
        $scope.form = null;
        $scope.viewLoaded = 0;
        $scope.contentId = $stateParams.contentId;

        function getCurrency () {
            return fb.currency(
                $scope.sessionId,
                $scope.form.adaccount.selected
            );
        }

        function getAudiences () {
            return fb.audiences(
                $scope.sessionId,
                $scope.form.adaccount.selected
            ).then(function (res) {
                if (!res.data.length) {
                    throw 'You must have at least one saved audience';
                }
                return res;
            });
        }

        function refreshModel () {
            var promises = [];

            promises.push(getAudiences());
            promises.push(getCurrency());

            return $q.all(promises).then(function (resp) {
                $scope.form.audiences = resp[0];
                $scope.form.currency = resp[1];
                $scope.form.budget = Math.floor(
                    2000 /
                    resp[1].offset
                );
            });
        }

        function getSecondLevel (model) {
            $scope.form = model;

            return refreshModel();
        }

        function getPromotionModel (model) {
            var promises,
                ret;

            if (model) {
                return $q.resolve(model);
            }

            promises = {
                'assets': fb.listAssets($scope.sessionId),
                'status': fb.isAutomatable(
                    $scope.sessionId,
                    $scope.stateParams.contentId
                ),
                'og': fb.getContentOgData(
                    $scope.sessionId,
                    $scope.stateParams.contentId
                )
            };

            ret = {};

            promises.assets.then(function (assets) {
                (assets || []).forEach(function (item) {
                    ret[item.type] = ret[item.type] || {};
                    if (item.default) {
                        ret[item.type].selected = item.value;
                    }
                    ret[item.type].data = ret[item.type].data || [];
                    ret[item.type].label = item.type;
                    ret[item.type].data.push({
                        'label': item.display,
                        'id': item.value
                    });
                });

                ret['page'].label = 'Pages:';
                ret['adaccount'].label = 'Ad Accounts:';
                ret['adaccount'].change = function () {
                    return refreshModel();
                };
            });

            promises.status.then(function (status) {
                ret.automated = status !== 'inactive';
                ret.status = status;
            });

            promises.og.then(function (og) {
                ret.og = og;
            });

            return $q.all(promises).then(function () {
                var now = new Date(),
                    oneYearAfter,
                    oneDayAfter;

                now.setSeconds(0);
                now.setMilliseconds(0);
                now.setMinutes(now.getMinutes() + 1);

                oneYearAfter = new Date(now.getTime());
                oneDayAfter = new Date(now.getTime());

                oneYearAfter.setMonth(oneYearAfter.getMonth() + 12);
                oneDayAfter.setDate(oneDayAfter.getDate() + 1);

                ret.utm_source = 'facebook';
                ret.utm_medium = '';
                ret.utm_campaign = '';

                ret.from = oneDayAfter.toISOString();
                ret.to = oneYearAfter.toISOString();
                ret.until = oneDayAfter;
                ret.message = '';

                return ret;
            });
        }

        function updateForm () {
            return getPromotionModel().then(function (model) {
                return getSecondLevel(model);
            }).catch(function (err) {
                $state.go('error', {
                    'message': err
                });
            });
        }

        function init () {
            updateForm().then(function () {
                $scope.viewLoaded = 1;
            }).catch(function () {});
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
