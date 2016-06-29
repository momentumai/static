/*global momentum, bvConfig, angular */
momentum.factory('guide', [
    'utils',
    'fb',
    'teamUserData',
    'auth',
    'dialog',
    'toast',
    'storage',
    '$state',
    '$rootScope',
    '$q',
    function (
        utils,
        fb,
        teamUserData,
        auth,
        dialog,
        toast,
        storage,
        $state,
        $rootScope,
        $q
    ) {
        var guide = {},
            sessionId,
            user;

        $rootScope.hasSteps = false;

        $rootScope.guideSteps = {
            //'video': 'seen',
            'fb': '',
            'extension': '',
            'tracking_code': ''
        };

        $rootScope.guideStepProperties = {
            'video': {
                'title': 'Watch tutorial'
            },
            'fb': {
                'title': 'Facebook integration'
            },
            'extension': {
                'title': 'Install extension'
            },
            'tracking_code': {
                'title': 'Insert tracking code'
            }
        };

        function trackingCodeDialog (stepIterator) {
            var model = {};

            return auth.getCode(sessionId).then(function (resp) {
                model.code = resp;
            }).then(function () {
                return dialog.open({
                    'title': 'Insert tracking code',
                    'template': 'trackingCodeDialog.tpl.html',
                    'canHide': this.single || false,
                    'animate': this.single || false,
                    'destroy': false,
                    'okText': 'I\'m done',
                    'showCancel': true,
                    'cancelText': 'Skip',
                    'dialogClass': 'auto-width',
                    'model': model
                }).finally(function () {
                    return teamUserData.set(
                        sessionId,
                        'guide_tracking_code',
                        'skip'
                    );
                }).finally(function () {
                    $rootScope.guideSteps['tracking_code'] = 'skip';
                    return $rootScope.guide(stepIterator, null, true);
                });
            });
        }

        function extensionDialog (stepIterator) {
            var model = {
                'extensionUrl': bvConfig.extensionUrl
            };

            return dialog.open({
                'title': 'Install extension',
                'template': 'extensionInstallDialog.tpl.html',
                'animate': this.single || false,
                'canHide': this.single || false,
                'cancelAction': !this.single,
                'showCancel': true,
                'destroy': false,
                'okText': this.single ?
                    'I\'m done' :
                    'Next',
                'cancelText': 'Skip',
                'model': model
            }).finally(function () {
                return teamUserData.set(
                    sessionId,
                    'guide_extension',
                    'skip'
                ).then(function () {
                    $rootScope.guideSteps['extension'] = 'skip';
                    return $rootScope.guide(stepIterator, null, true);
                });
            });
        }

        function videoDialog (stepIterator) {
            return dialog.open({
                'title': 'Tutorial',
                'htmlText': bvConfig.tutorialVideo,
                'canHide': this.single || false,
                'destroy': false,
                'okText': 'Next',
                'dialogClass': 'auto-width'
            }).then(function () {
                return teamUserData.set(
                    sessionId,
                    'guide_video',
                    'viewed'
                );
            }).finally(function () {
                return $rootScope.guide(stepIterator, null, true);
            });
        }

        function fbDialog (stepIterator, forceManual) {
            var that = this;

            function getModel () {
                var promises = {},
                    fbAssets,
                    assets,
                    model = {};

                promises['fbAssets'] = fb.listFbAssets(
                    sessionId
                ).then(function (a) {
                    model.connected = 1;
                    fbAssets = a;
                }).catch(function () {});

                promises['assets'] = fb.listAssets(
                    sessionId
                ).then(function (a) {
                    assets = a;
                });

                return $q.all(promises).then(function () {
                    if (model.connected) {
                        model.assets = utils.mergeAssets(
                            fbAssets,
                            assets
                        );
                        model.assets.business = {
                            'label': 'Businesses',
                            'selected': model.assets.business[0] &&
                                model.assets.business[0].id || null,
                            'data': model.assets.business
                        };
                        if (!model.assets.business.selected || forceManual) {
                            model.noBusiness = 1;
                        }
                    }
                }).then(function () {
                    return model;
                });
            }

            return getModel().then(function (model) {
                function hasChecked () {
                    var hasEmpty = 0;

                    ['page', 'adaccount'].forEach(function (type) {
                        var hasC = 0;

                        model.assets[type].forEach(function (asset) {
                            if (asset.checked) {
                                hasC = 1;
                            }
                        });
                        if (!hasC) {
                            hasEmpty = 1;
                        }
                    });

                    return !hasEmpty;
                }

                model.fbConnect = function () {
                    model.connecting = 1;
                    fb.login().then(function (accessToken) {
                        return fb.token(
                            sessionId,
                            accessToken
                        ).then(function () {
                            return fbDialog.apply(that, [stepIterator]);
                        });
                    });
                };

                model.manually = function () {
                    model.switching = 1;
                    return fbDialog.apply(that, [stepIterator, true]);
                };

                model.switchDefault = function (type, id) {
                    model.assets[type].forEach(function (asset) {
                        asset.default = false;
                        if (asset.value === id) {
                            asset.default = true;
                            asset.checked = true;
                        }
                    });
                };

                model.checkChange = function (type, id) {
                    var val,
                        hasDefault,
                        checked = [];

                    model.assets[type].forEach(function (asset) {
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
                };

                return dialog.open({
                    'title': 'Facebook integration',
                    'template': 'fbIntDialog.tpl.html',
                    'animate': false,
                    'canHide': that.single || false,
                    'showCancel': true,
                    'cancelAction': !that.single,
                    'cancelText': 'Skip',
                    'destroy': false,
                    'okText': that.single ? 'Import' : 'Next',
                    'model': model,
                    'dialogClass': 'fb-int-dialog',
                    'isDisabled': function () {
                        var business = model.connected &&
                                !model.noBusiness &&
                                model.assets.business.selected,
                            manual = model.connected &&
                                model.noBusiness && hasChecked();

                        return !(business || manual);
                    }
                }).then(function () {
                    var isBusiness = !model.noBusiness,
                        promise,
                        checkFunc = function (e) {
                            return e.checked;
                        };

                    if (isBusiness) {
                        promise = fb.importAssets(
                            sessionId,
                            model.assets.business.selected
                        );
                    } else {
                        promise = fb.saveAssets(
                            sessionId,
                            model
                                .assets
                                .page
                                .filter(checkFunc)
                                .concat(
                                    model.assets
                                        .adaccount
                                        .filter(checkFunc)
                                )
                        );
                    }

                    return promise.then(function () {
                        return teamUserData.set(
                            sessionId,
                            'guide_fb',
                            'added'
                        );
                    }).then(function () {
                        $rootScope.guideSteps['fb'] = 'added';
                        if (that.single) {
                            toast.open({
                                'htmlText': 'Assets imported successfully'
                            });
                        }
                        return $rootScope.guide(stepIterator, null, true);
                    });
                }).catch(function () {
                    return teamUserData.set(
                        sessionId,
                        'guide_fb',
                        'skip'
                    ).then(function () {
                        $rootScope.guideSteps['fb'] = 'skip';
                        return $rootScope.guide(stepIterator, null, true);
                    });
                });
            });
        }

        function getStepIterator (guide) {
            var dataSource,
                order = Object.keys(
                    $rootScope.guideSteps
                ),
                act;

            dataSource = angular.extend(
                $rootScope.guideSteps,
                guide,
                {
                    'extension': storage.isExtensionInstalled() ?
                        'installed' : guide.extension || ''
                }
            );

            function getAct () {
                var act = null;

                order.forEach(function (step) {
                    if (!act && !dataSource[step]) {
                        act = step;
                    }
                });

                return act;
            }

            act = getAct();

            return {
                'act': function () {
                    if (!act) {
                        return null;
                    }
                    return act;
                },
                'next': function (result) {
                    if (result) {
                        dataSource[act] = result;
                    }
                    act = getAct();
                    return act;
                }
            };
        }

        $rootScope.guide = function (stepIterator, dialogName, next) {
            var dialogs = {
                'video': videoDialog,
                'fb': fbDialog,
                'extension': extensionDialog,
                'tracking_code': trackingCodeDialog
            };

            if (stepIterator && next) {
                stepIterator.next();
            }

            if (!stepIterator && dialogName) {
                return dialogs[dialogName].apply({
                    'single': true
                });
            }

            if (stepIterator && stepIterator.act()) {
                return dialogs[stepIterator.act()](
                    stepIterator
                );
            }
            $rootScope.hasSteps = !Number(user.is_super) && Object.keys(
                $rootScope.guideSteps
            ).filter(function (step) {
                return !$rootScope.guideSteps[step] ||
                    $rootScope.guideSteps[step] === 'skip';
            }).length > 0;

            dialog.destroy();

            if (user.payment_amount &&
                $state.includes('root.main')) {
                $state.go('root.billing');
            }
        };

        guide.show  = function (sId, u) {
            var stepIterator = getStepIterator(u.guide);

            sessionId = sId;
            user = u;

            return $rootScope.guide(stepIterator);
        };

        return guide;
    }
]);
