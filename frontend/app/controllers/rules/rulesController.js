/*global momentum, angular*/
momentum.controller('RulesController', [
    'dialog',
    'toast',
    'rule',
    'fb',
    '$q',
    '$state',
    '$scope',
    function (dialog, toast, rule, fb, $q, $state, $scope) {
        $scope.groups = null;
        $scope.activeGroup = null;
        $scope.viewLoaded = 0;

        function init () {
            $scope.groups = null;
            return rule.list($scope.sessionId).then(function (ret) {
                ret = ret || {};
                $scope.groups = ret.groups;
                $scope.activeGroup = ret.active;
                $scope.activeGroup.open = 1;
                $scope.groups.isOpen = 0;
            }).then(function () {
                $scope.viewLoaded = 1;
            });
        }

        function getCurrency (model) {
            if (model.adaccount && model.adaccount.selected) {
                return fb.currency(
                    $scope.sessionId,
                    model.adaccount.selected
                );
            }
        }

        function getAudiences (model) {
            if (model.adaccount && model.adaccount.selected) {
                return fb.audiences(
                    $scope.sessionId,
                    model.adaccount.selected
                ).then(function (res) {
                    res.validators = [{
                        'message': 'Please fill out this field.',
                        'cond': function (item) {
                            return !item;
                        }
                    }];

                    return res;
                });
            }
        }

        function refreshModel (model) {
            var promises = [];

            if (!model.adaccount.selected) {
                model.audiences = {
                    'label': 'Audiences',
                    'validators': [{
                        'message': 'Please fill out this field.',
                        'cond': function (item) {
                            return !item;
                        }
                    }],
                    'selected': null,
                    'data': []
                };

                model.currency = {
                    'name': 'USD',
                    'offset': 100
                };

                model.budget = 20;

                return model;
            }

            promises.push(getAudiences(model));
            promises.push(getCurrency(model));

            return $q.all(promises).then(function (resp) {
                var offset = resp[1] && resp[1].offset || 100;

                model.audiences = resp[0];

                model.currency = resp[1];
                model.budget = Math.floor(
                    2000 /
                    offset
                );

                return model;
            });
        }

        function getOptionsModel (item) {
            var promises,
                ret;

            promises = {
                'assets': fb.listAssets($scope.sessionId)
            };

            ret = {};

            promises.assets = promises.assets.then(function (assets) {
                var validators = [{
                    'message': 'Please fill out this field.',
                    'cond': function (item) {
                        return !item;
                    }
                }];

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

                if (Object.keys(item.options).length && item.my) {
                    if (ret['adaccount'].data.filter(function (elem) {
                        return elem.id === item.options.ad_account;
                    }).length) {
                        ret['adaccount'].selected = item.options.ad_account;
                    } else {
                        ret['adaccount'].selected = null;
                    }
                }

                ret['page'].label = 'Pages:';
                ret['page'].validators = validators;

                ret['adaccount'].label = 'Ad accounts:';
                ret['adaccount'].change = function () {
                    return refreshModel(ret);
                };
                ret['adaccount'].validators = validators;
            });

            return $q.all(promises).then(function () {
                return ret;
            });
        }

        function removeNew (group) {
            var removable = [];

            group.items.forEach(function (item) {
                if (!String(item.id).indexOf('new_')) {
                    removable.push(item);
                }
            });

            removable.forEach(function (item) {
                group.items.splice(group.items.indexOf(item), 1);
            });
        }

        $scope.reset = function (group) {
            removeNew(group);
            group.items.forEach(function (item, index) {
                group.items[index] = group.items[index].$original;
                group.items[index].$original = angular.copy(
                    group.items[index]
                );
            });
        };

        $scope.open = function (group) {
            var isOpen = 0;

            if (group.open) {
                return false;
            }

            $scope.groups.forEach(function (g) {
                removeNew(g);

                if (g.id === group.id) {
                    g.items.forEach(function (item, index) {
                        g.items[index] = g.items[index].$original;
                        g.items[index].$original = angular.copy(
                            g.items[index]
                        );
                    });
                    g.open = 1;
                    isOpen = 1;
                } else {
                    g.open = 0;
                }
            });

            $scope.groups.isOpen = isOpen;
        };

        $scope.close = function () {
            $scope.groups.isOpen = 0;
            $scope.groups.forEach(function (g) {
                removeNew(g);
                g.open = 0;
            });
        };

        $scope.shareOptions = function (item) {
            var promise = $q.resolve();

            if (item.deleted) {
                return false;
            }

            if (!item.my) {
                promise = dialog.open({
                    'htmlText': '<span>This rule edited by other user.<br/>' +
                        'Are you sure you want to edit?</span>',
                    'okText': 'Proceed',
                    'destroy': false,
                    'cancelText': 'Cancel',
                    'showCancel': true
                });
            }

            function mergeModel (model, item) {
                var options = item.options;

                model.utm_source = options.utm_source || '';
                model.utm_medium = options.utm_medium || '';
                model.utm_campaign = options.utm_campaign || '';

                if (model.page.data.filter(function (elem) {
                    return elem.id === options.page_id;
                }).length) {
                    model.page.selected = options.page_id;
                } else {
                    model.page.selected = null;
                }
            }

            function setDefaults (model) {
                model.utm_source = 'facebook';
                model.utm_medium = 'momentum';
                model.utm_campaign = 'organic';
                model.new = 1;
            }

            promise.then(function () {
                return getOptionsModel(item).then(function (model) {
                    return refreshModel(model);
                }).then(function (model) {
                    if (Object.keys(item.options).length &&
                        item.my) {
                        mergeModel(model, item);
                    } else {
                        setDefaults(model);
                    }
                    return dialog.open({
                        'title': 'Rule options',
                        'template': 'shareRuleOptions.tpl.html',
                        'okText': 'Ok',
                        'showCancel': true,
                        'model': model,
                        'animate': item.my,
                        'dialogClass': 'rule-share-options-dialog'
                    }).then(function (model) {
                        var options = {
                            'page_id': model.page.selected,
                            'max_duration': model.max_duration,
                            'utm_source': model.utm_source,
                            'utm_medium': model.utm_medium,
                            'utm_campaign': model.utm_campaign
                        };

                        item.my = 1;
                        item.options = options;
                    });
                });
            });
        };

        $scope.options = function (item) {
            var promise = $q.resolve();

            if (item.deleted) {
                return false;
            }

            if (!item.my) {
                promise = dialog.open({
                    'htmlText': '<span>This rule edited by other user.<br/>' +
                        'Are you sure you want to edit?</span>',
                    'okText': 'Proceed',
                    'destroy': false,
                    'cancelText': 'Cancel',
                    'showCancel': true
                });
            }

            function mergeModel (model, item) {
                var options = item.options;

                model.max_duration = options.max_duration || 1;
                model.budget = options.budget &&
                    options.budget / (options.offset || 100) ||
                    model.budget;
                model.utm_source = options.utm_source || '';
                model.utm_medium = options.utm_medium || '';
                model.utm_campaign = options.utm_campaign || '';

                if (model.page.data.filter(function (elem) {
                    return elem.id === options.page_id;
                }).length) {
                    model.page.selected = options.page_id;
                } else {
                    model.page.selected = null;
                }

                if (model.audiences.data.filter(function (elem) {
                    return elem.id === options.audience;
                }).length) {
                    model.audiences.selected = options.audience;
                } else {
                    model.audiences.selected = null;
                }
            }

            function setDefaults (model) {
                model.utm_source = 'facebook';
                model.utm_medium = '';
                model.utm_campaign = '';
                model.max_duration = 1;
                model.new = 1;
            }

            promise.then(function () {
                return getOptionsModel(item).then(function (model) {
                    return refreshModel(model);
                }).then(function (model) {
                    if (Object.keys(item.options).length &&
                        item.my) {
                        mergeModel(model, item);
                    } else {
                        setDefaults(model);
                    }
                    return dialog.open({
                        'title': 'Rule options',
                        'template': 'ruleOptions.tpl.html',
                        'okText': 'Ok',
                        'showCancel': true,
                        'model': model,
                        'animate': item.my,
                        'dialogClass': 'rule-options-dialog'
                    }).then(function (model) {
                        var options = {
                            'ad_account': model.adaccount.selected,
                            'page_id': model.page.selected,
                            'audience': model.audiences.selected,
                            'max_duration': model.max_duration,
                            'budget': model.budget * model.currency.offset,
                            'utm_source': model.utm_source,
                            'utm_medium': model.utm_medium,
                            'utm_campaign': model.utm_campaign,
                            'meta': {
                                'page': (model.page.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.page.selected;
                                    }
                                )[0] || {}).label,
                                'audience': (model.audiences.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.audiences.selected;
                                    }
                                )[0] || {}).label,
                                'adaccount': (model.adaccount.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.adaccount.selected;
                                    }
                                )[0] || {}).label,
                                'currency': model.currency.name,
                                'offset': model.currency.offset
                            }
                        };

                        item.my = 1;
                        item.options = options;
                    });
                });
            });
        };

        $scope.changed = function (item) {
            if (item.deleted) {
                return false;
            }

            return !item.$original || !angular.equals(item, item.$original);
        };

        $scope.delete = function (group, item) {
            if (item.deleted) {
                return false;
            }

            group.items.forEach(function (act) {
                if (act.parent && act.parent.id === String(item.id)) {
                    act.parent = {
                        'id': 'all'
                    };
                }
            });

            if (!String(item.id).indexOf('new_')) {
                group.items.splice(group.items.indexOf(item), 1);
                return true;
            }

            item.deleted = 1;
        };

        $scope.add = function (group) {
            group.items.push({
                'id': 'new_' + Date.now(),
                'condition': 'NONE',
                'action': 'NONE',
                'metric': 'momentum',
                'my': 1,
                'value': 50,
                'parent': {
                    'id': 'all'
                },
                'options': {}
            });
        };

        $scope.actionChange = function (item) {
            if (item.action === 'promotion_start') {
                $scope.options(item);
            }
        };

        $scope.save = function (group) {
            $scope.viewLoaded = 0;
            return rule.saveGroup(
                $scope.sessionId,
                group
            ).then(function () {
                return init();
            }).then(function () {
                return toast.open({
                    'htmlText': 'Rules saved successfully'
                });
            });
        };

        $scope.haveAction = function (action, group) {
            return group.items.filter(function (act) {
                return !act.deleted && act.action === action;
            }).length;
        };

        $scope.condNoneCheck = function (item) {
            return item.condition === 'NONE';
        };

        $scope.actionNoneCheck = function (item) {
            return item.action === 'NONE';
        };

        $scope.emptyOptions = function (item) {
            if (['promotion_start', 'share'].indexOf(item.action) !== -1) {
                return !Object.keys(item.options || {}).length;
            }
            return 0;
        };

        $scope.getStopPromotionOptions = function (group) {
            var ret = [{'id': 'all', 'name': 'Any rule'}],
                i = 0;

            for (; i < group.items.length; i += 1) {
                if (!group.items[i].deleted &&
                        group.items[i].action === 'promotion_start') {
                    ret.push({
                        'id': String(group.items[i].id),
                        'name': 'Rule #' + (i + 1)
                    });
                }
            }

            return ret;
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
