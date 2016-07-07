/*global momentum */
momentum.controller('ContentHistoryController', [
    'content',
    'fb',
    'dialog',
    'storage',
    'utils',
    '$rootScope',
    '$scope',
    '$q',
    '$timeout',
    function (
        content,
        fb,
        dialog,
        storage,
        utils,
        $rootScope,
        $scope,
        $q,
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
        $scope.statsDirty = 0;

        $scope.sourceStats = null;
        $scope.content = {
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
                    $scope.content.campaigns.loading = 1;
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
                    $scope.content.campaigns.loading = 1;
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
                    $scope.stateParams.contentId,
                    10,
                    0
                ).then(function (campaigns) {
                    $scope.content.campaigns = campaigns;
                }).catch(function () {
                    var c = $scope.content;

                    c.campaigns = defaultCampaigns;
                    c.campaigns.errorMessage = 'Insufficient permission.';
                });
            });
        };

        $scope.next = function () {
            $scope.content.campaigns.loading = 1;
            return fb.getCampaigns(
                $scope.sessionId,
                $scope.stateParams.contentId,
                10,
                $scope.content.campaigns.offset + 10
            ).then(function (campaigns) {
                $scope.content.campaigns = campaigns;
            }).catch(function () {
                var c = $scope.content;

                c.campaigns = defaultCampaigns;
                c.campaigns.errorMessage = 'Insufficient permission.';
            });
        };

        $scope.prev = function () {
            $scope.content.campaigns.loading = 1;
            return fb.getCampaigns(
                $scope.sessionId,
                $scope.stateParams.contentId,
                10,
                $scope.content.campaigns.offset - 10
            ).then(function (campaigns) {
                $scope.content.campaigns = campaigns;
            }).catch(function () {
                var c = $scope.content;

                c.campaigns = defaultCampaigns;
                c.campaigns.errorMessage = 'Insufficient permission.';
            });
        };

        function animate () {
            $timeout(function () {
                $scope.content.campaigns.animate();
                $scope.sourceStats.forEach(function (stat) {
                    stat.animate();
                });
            });
        }

        function init () {
            var promises = {
                'shareStats': content.getShareStatDetails(
                    $scope.sessionId,
                    $scope.stateParams.contentId
                ),
                'campaigns': fb.getCampaigns(
                    $scope.sessionId,
                    $scope.stateParams.contentId,
                    10,
                    0
                )
            };

            promises.campaigns = promises.campaigns.then(function (data) {
                $scope.content.campaigns = data;
            }).catch(function () {
                var c = $scope.content;

                c.campaigns = defaultCampaigns;
                c.campaigns.errorMessage = 'Insufficient permission.';
            });

            promises.shareStats = promises.shareStats.then(function (data) {
                data.forEach(function (datum) {
                    datum.hasMore = 1;
                });
                $scope.sourceStats = data;
            });

            $q.all(promises).finally(function () {
                $scope.viewLoaded = 1;
                animate();
            });
        }

        $scope.isVisible = function (id) {
            var haveActive = 0,
                isActive = 0;

            $scope.sourceStats.forEach(function (stat) {
                if (stat.active) {
                    haveActive = 1;
                    if (stat.id === id) {
                        isActive = 1;
                    }
                }
            });

            return !haveActive || isActive;
        };

        $scope.switchState = function (id) {
            $scope.statsDirty = 1;
            $scope.sourceStats.forEach(function (stat) {
                var active;

                if (stat.id === id) {
                    active = stat.active ? 0 : 1;
                    if (active) {
                        stat.offset = 0;
                        stat.active = 1;
                    } else {
                        stat.active = 0;
                    }
                } else {
                    stat.active = 0;
                }
            });
        };

        $scope.switchPage = function (id, dir) {
            $scope.sourceStats.forEach(function (stat) {
                if (stat.id === id) {
                    stat.offset = Math.min(
                        stat.details.length,
                        Math.max(0, stat.offset + dir * 5)
                    );
                }
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
                    $scope.stateParams.contentId
                ).then(function (data) {
                    utils.downloadCSV(data);
                });
            }).finally(function () {
                dialog.destroy();
            });
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
