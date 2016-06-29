/*global momentum */
momentum.controller('HistoryController', [
    'fb',
    'dialog',
    'storage',
    'utils',
    '$scope',
    '$timeout',
    function (
        fb,
        dialog,
        storage,
        utils,
        $scope,
        $timeout
    ) {
        var defaultCampaigns = {
            'data': [],
            'sum': 0,
            'currency': 'USD',
            'offset': 0,
            'cnt': 0
        };

        $scope.viewLoaded = 0;

        $scope.history = {
            'campaigns': null
        };

        $scope.toggle = function (id, active) {
            var promise;

            if (active) {
                promise = dialog.open({
                    'htmlText': 'Are you sure you ' +
                        'want to stop this campaign?',
                    'showCancel': true
                }).then(function () {
                    $scope.history.campaigns.loading = 1;
                    return fb.disableCampaign(
                        $scope.sessionId,
                        id
                    ).then(function () {
                        storage.invalidateCache();
                    });
                });
            } else {
                promise = dialog.open({
                    'htmlText': 'Are you sure you ' +
                        'want to clone this campaign?',
                    'showCancel': true
                }).then(function () {
                    $scope.history.campaigns.loading = 1;
                    return fb.cloneCampaign(
                        $scope.sessionId,
                        id
                    ).then(function () {
                        storage.invalidateCache();
                    });
                });
            }

            promise.catch(function (err) {
                if (typeof err === 'string') {
                    return dialog.open({
                        'htmlText': err
                    });
                }
            });

            promise.then(function () {
                storage.invalidateCache();
                return fb.getCampaigns(
                    $scope.sessionId,
                    null,
                    10,
                    0
                ).then(function (campaigns) {
                    $scope.history.campaigns = campaigns;
                }).catch(function () {
                    var h = $scope.history;

                    h.campaigns = defaultCampaigns;
                    h.campaigns.errorMessage = 'Insufficient permission.';
                });
            });
        };

        $scope.next = function () {
            $scope.history.campaigns.loading = 1;
            return fb.getCampaigns(
                $scope.sessionId,
                null,
                10,
                $scope.history.campaigns.offset + 10
            ).then(function (campaigns) {
                $scope.history.campaigns = campaigns;
            }).catch(function () {
                var h = $scope.history;

                h.campaigns = defaultCampaigns;
                h.campaigns.errorMessage = 'Insufficient permission.';
            });
        };

        $scope.prev = function () {
            $scope.history.campaigns.loading = 1;
            return fb.getCampaigns(
                $scope.sessionId,
                null,
                10,
                $scope.history.campaigns.offset - 10
            ).then(function (campaigns) {
                $scope.history.campaigns = campaigns;
            }).catch(function () {
                var h = $scope.history;

                h.campaigns = defaultCampaigns;
                h.campaigns.errorMessage = 'Insufficient permission.';
            });
        };

        $scope.export = function () {
            var model = {};

            model.months = utils.getMonths();

            return dialog.open({
                'title': 'Export as CSV',
                'template': 'monthSelector.tpl.html',
                'model': model,
                'showCancel': true,
                'dialogClass': 'auto-width',
                'destroy': false
            }).then(function () {
                var args = model.months.selected.split('-');

                return fb.export(
                    $scope.sessionId,
                    args[1],
                    args[0],
                    null
                ).then(function (data) {
                    utils.downloadCSV(data);
                });
            }).finally(function () {
                dialog.destroy();
            });
        };

        function animate () {
            $timeout(function () {
                $scope.history.campaigns.animate();
            });
        }

        function init () {
            return fb.getCampaigns(
                $scope.sessionId,
                null,
                10,
                0
            ).then(function (campaigns) {
                $scope.history.campaigns = campaigns;
            }).catch(function () {
                var h = $scope.history;

                h.campaigns = defaultCampaigns;
                h.campaigns.errorMessage = 'Insufficient permission.';
            }).finally(function () {
                $scope.viewLoaded = 1;
                animate();
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
