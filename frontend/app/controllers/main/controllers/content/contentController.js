/*global momentum, FB*/
momentum.controller('ContentController', [
    'dialog',
    'toast',
    'fb',
    'content',
    '$rootScope',
    '$scope',
    '$state',
    '$q',
    function (
        dialog,
        toast,
        fb,
        content,
        $rootScope,
        $scope,
        $state,
        $q
    ) {
        $scope.menuOpen = null;
        $scope.form = null;

        function getCurrency () {
            if ($scope.form.adaccount && $scope.form.adaccount.selected) {
                return fb.currency(
                    $scope.sessionId,
                    $scope.form.adaccount.selected
                );
            }
        }

        function getAudiences () {
            if ($scope.form.adaccount && $scope.form.adaccount.selected) {
                return fb.audiences(
                    $scope.sessionId,
                    $scope.form.adaccount.selected
                );
            }
        }

        function refreshModel (back) {
            var promises = [];

            if (back) {
                return $q.resolve();
            }

            promises.push(getAudiences());
            promises.push(getCurrency());

            return $q.all(promises).then(function (resp) {
                var offset = resp[1] && resp[1].offset || 100;

                $scope.form.audiences = resp[0];
                $scope.form.currency = resp[1];
                $scope.form.budget = Math.floor(
                    2000 /
                    offset
                );
            });
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
                    $scope.content.id
                )
            };

            ret = {};

            promises.assets = promises.assets.then(function (assets) {
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

                if (!ret['page'] ||
                    !ret['page'].data ||
                    !ret['page'].data.length ||
                    !ret['adaccount'] ||
                    !ret['adaccount'].data ||
                    !ret['adaccount'].data.length
                ) {
                    $state.go('root.account-settings');
                    return $q.reject('Choose at least one ' +
                        'ad account and page.');
                }
                if (!ret['page'].selected) {
                    ret['page'].selected = ret['page'].data[0].id;
                }
                if (!ret['adaccount'].selected) {
                    ret['adaccount'].selected = ret['adaccount'].data[0].id;
                }

                ret['page'].label = 'Pages:';
                ret['adaccount'].label = 'Ad accounts:';
                ret['adaccount'].change = function () {
                    return refreshModel();
                };
            });

            promises.status = promises.status.then(function (status) {
                ret.automated = status !== 'inactive';
                ret.status = status;
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

        function getSecondLevel (model, back) {
            $scope.form = model;
            return refreshModel(back);
        }

        $scope.share = function () {
            FB.ui({
                'method': 'share',
                'href': $scope.content.shareLink
            }, function () {});
        };

        $scope.showMenu = function () {
            $scope.menuOpen = 1;
        };

        $scope.hideMenu = function () {
            $scope.menuOpen = 0;
        };

        function loadPreview (model) {
            if (!model.preview.meta.audience) {
                dialog.destroy();
                $state.go('root.audiences');
                throw 'You must have at least one audience';
            }

            return fb.preview(
                $scope.sessionId,
                $scope.content.id,
                model.preview
            ).then(function (data) {
                model.previewHtml = data.preview;
                model.creative_id = data.creative_id;
                model.campaign = data.campaign;
            });
        }

        $scope.promotion = function () {
            $state.go('root.experimentWizard', {
                'contentId': $scope.stateParams.contentId
            });
        };

        $scope.promotionBackup = function (model) {
            var back = model && true || false;

            getPromotionModel(model).then(function (model) {
                return getSecondLevel(model, back);
            }).then(function () {
                var model = $scope.form;

                return dialog.open({
                    'title': 'Promote content',
                    'template': 'promoteDialog.tpl.html',
                    'okText': 'Preview',
                    'showCancel': true,
                    'model': model,
                    'destroy': false,
                    'animate': !back,
                    'dialogClass': 'promote-dialog'
                }).then(function () {
                    var name = $scope.content.og.title ||
                        $scope.content.title ||
                        $scope.content.url,
                        byId = function (array, id) {
                            return array.filter(
                                function (act) {
                                    return act.id === id;
                                }
                            )[0] || {};
                        },
                        meta = {
                            'page': byId(
                                model.page.data,
                                model.page.selected
                            ).label,
                            'audience': byId(
                                model.audiences.data,
                                model.audiences.selected
                            ).label,
                            'adaccount': byId(
                                $scope.form.adaccount.data,
                                $scope.form.adaccount.selected
                            ).label,
                            'currency': model.currency.name,
                            'offset': model.currency.offset
                        };

                    model.preview = {
                        'ad_account': $scope.form.adaccount.selected,
                        'page_id': model.page.selected,
                        'description': $scope.content.og.description || '',
                        'name': name,
                        'message': model.message,
                        'caption': $scope.content.og.site_name || '',
                        'image': $scope.content.og.image || '',
                        'link': $scope.content.url,
                        'utm_source': model.utm_source,
                        'utm_medium': model.utm_medium,
                        'utm_campaign': model.utm_campaign
                    };

                    model.preview['end_time'] = new Date(
                        model.until
                    ).getTime() / 1000;

                    model.preview.meta = meta;

                    return loadPreview(model).then(function () {
                        return dialog.open({
                            'title': 'Preview content',
                            'template': 'previewDialog.tpl.html',
                            'okText': 'Promote',
                            'cancelText': 'Back',
                            'showCancel': true,
                            'animate': false,
                            'model': model,
                            'cancelAction': true,
                            'destroy': false,
                            'dialogClass': 'promote-dialog'
                        }).then(function () {
                            var params = {
                                'ad_account': $scope
                                    .form
                                    .adaccount
                                    .selected,
                                'auto': model.automated,
                                'budget': model.budget *
                                    model.currency.offset,
                                'audience': model.audiences.selected,
                                'page': model.page.selected,
                                'creative_id': model.creative_id,
                                'campaign': model.campaign
                            };

                            if (!params.auto) {
                                params.end_time = new Date(
                                    model.until
                                ).getTime() / 1000;
                            }

                            return fb.createPromotion(
                                $scope.sessionId,
                                $scope.content.id,
                                params
                            );
                        }).then(function (resp) {
                            var htmlText = 'Promotion created';

                            if (resp === 'success') {
                                dialog.destroy();
                                return toast.open({
                                    'htmlText': htmlText
                                });
                            }
                        }).catch(function (err) {
                            if (err && err === true) {
                                $scope.promotion(model);
                            } else if (err) {
                                return dialog.open({
                                    'htmlText': err
                                });
                            }
                        });
                    });
                });
            }).catch(function (err) {
                if (err && err !== true) {
                    return dialog.open({
                        'htmlText': err
                    });
                }
            });
        };

        $scope.blacklist = function () {
            var state = $scope.content.blacklist ? 'enable' : 'disable';

            return dialog.open({
                'htmlText': 'Are you sure you want to ' +
                    state + ' tracking for this URL?',
                'showCancel': true,
                'okText': state
            }).then(function () {
                return content.blacklist(
                    $scope.sessionId,
                    $scope.content.url,
                    !$scope.content.blacklist
                );
            }).then(function () {
                $scope.content.blacklist = !$scope.content.blacklist;
                return toast.open({
                    'htmlText': 'URL tracking ' +
                        state +
                        'd'
                });
            });
        };

        $scope.$watch('content', function (content) {
            if (content) {
                $rootScope.title = content.title;
            }
        });

        $scope.$on('$destroy', function () {
            $rootScope.title = '';
        });
    }
]);
