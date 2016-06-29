/*global momentum */
momentum.controller('AccountSettingsController', [
    'auth',
    'account',
    'userData',
    'teamUserData',
    'dialog',
    'toast',
    'fb',
    'utils',
    'storage',
    '$q',
    '$timeout',
    '$state',
    '$rootScope',
    '$scope',
    function (
        auth,
        account,
        userData,
        teamUserData,
        dialog,
        toast,
        fb,
        utils,
        storage,
        $q,
        $timeout,
        $state,
        $rootScope,
        $scope
    ) {
        function animate () {
            $timeout(function () {
                $scope.fbInt.animate();
                $scope.pwChange.animate();
                $scope.teamSwitch.animate();
            });
        }

        function reloadAssets () {
            var promises = {},
                fbAssets,
                assets;

            promises['fbAssets'] = fb.listFbAssets(
                $scope.sessionId
            ).then(function (a) {
                $scope.fbInt.connected = 1;
                fbAssets = a;
            }).catch(function () {});

            promises['assets'] = fb.listAssets(
                $scope.sessionId
            ).then(function (a) {
                assets = a;
            });

            return $q.all(promises).then(function () {
                if ($scope.fbInt.connected) {
                    $scope.fbInt.assets = utils.mergeAssets(
                        fbAssets,
                        assets
                    );
                }
            });
        }

        $scope.viewLoaded = 0;

        $scope.fbInt = {
            'dataLoading': 0,
            'connected': 0,
            'assets': null,
            'submit': function () {
                var assets = $scope.fbInt.assets,
                    checkFunc = function (e) {
                        return e.checked;
                    },
                    pages = assets.page.filter(checkFunc),
                    adaccounts = assets.adaccount.filter(checkFunc),
                    req = pages.concat(adaccounts);

                if (!pages.length || !adaccounts.length) {
                    return dialog.open({
                        'htmlText': 'Choose at least one ad account and page.'
                    });
                }

                $scope.fbInt.dataLoading = 1;
                return fb.saveAssets(
                    $scope.sessionId,
                    req
                ).then(function (data) {
                    if (data.length !== req.length) {
                        return reloadAssets().then(function () {
                            $scope.fbInt.dataLoading = 0;
                            return dialog.open({
                                'htmlText': 'Can\'t save one or more assets.'
                            });
                        });
                    }
                    $scope.fbInt.dataLoading = 0;
                    toast.open({
                        'htmlText': 'Assets saved'
                    });
                    return teamUserData.set(
                        $scope.sessionId,
                        'guide_fb',
                        'added'
                    ).then(function () {
                        $rootScope.guideSteps['fb'] = 'added';
                        return $rootScope.guide();
                    });
                });
            },
            'connect': function () {
                $scope.fbInt.dataLoading = 1;
                fb.login().then(function (accessToken) {
                    return fb.token(
                        $scope.sessionId,
                        accessToken
                    ).then(function () {
                        return reloadAssets().then(function () {
                            $scope.fbInt.dataLoading = 0;
                        });
                    });
                });
            },
            'switchDefault': function (type, id) {
                $scope.fbInt.assets[type].forEach(function (asset) {
                    asset.default = false;
                    if (asset.value === id) {
                        asset.default = true;
                        asset.checked = true;
                    }
                });
            },
            'checkChange': function (type, id) {
                var val,
                    hasDefault,
                    checked = [];

                $scope.fbInt.assets[type].forEach(function (asset) {
                    val = asset.checked;
                    if (asset.value === id) {
                        if (val) {
                            asset.checked = true;
                            val = true;
                        } else {
                            asset.checked = false;
                            asset.default = false;
                        }
                    }
                    if (val) {
                        checked.push(asset);
                    }
                });

                checked.forEach(function (asset) {
                    if (asset.default) {
                        hasDefault = true;
                    }
                });

                if (!hasDefault && checked.length) {
                    checked[0].default = 1;
                }
            }
        };

        $scope.teamSwitch = {
            'dataLoading': 0,
            'teams': null,
            'submit': function () {
                $scope.teamSwitch.dataLoading = 1;
                auth.setTeam(
                    $scope.sessionId,
                    $scope.teamSwitch.teams.selected
                ).then(function () {
                    $scope.teamSwitch.dataLoading = 0;
                    storage.invalidateCache();
                    $state.go('root.main.dashboard.info');
                });
            }
        };

        $scope.pwChange = {
            'dataLoading': 0,
            'error': '',
            'oldPassword': '',
            'newPassword': '',
            'changePassword': function () {
                $scope.pwChange.dataLoading = 1;
                $scope.pwChange.error = '';

                account.changePassword(
                    $scope.sessionId,
                    $scope.pwChange.oldPassword,
                    $scope.pwChange.newPassword
                ).then(function (response) {
                    var error = response.data.errorMessage;

                    if (error) {
                        $scope.pwChange.error = error.split(':')[2];
                    } else {
                        $scope.pwChange.newPassword = '';
                        $scope.pwChange.oldPassword = '';
                        toast.open({
                            'htmlText': 'Password changed'
                        });
                    }
                }).finally(function () {
                    $scope.pwChange.dataLoading = 0;
                });
            }
        };

        function init () {
            var promises = {};

            promises['teams'] = auth.getTeams(
                $scope.sessionId
            ).then(function (teams) {
                $scope.teamSwitch.teams = teams;
            });

            promises['assets'] = reloadAssets();

            return $q.all(promises).then(function () {
                animate();
                $scope.viewLoaded = 1;
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }]
);
