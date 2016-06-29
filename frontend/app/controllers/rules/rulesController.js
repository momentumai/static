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
                );
            }
        }

        function refreshModel (model) {
            var promises = [];

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

        function getOptionsModel () {
            var promises,
                ret;

            promises = {
                'assets': fb.listAssets($scope.sessionId)
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
                    return refreshModel(ret);
                };
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

            promise.then(function () {
                return getOptionsModel().then(function (model) {
                    return refreshModel(model);
                }).then(function (model) {
                    model['max_duration'] = 1;

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
                            'meta': {
                                'page': model.page.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.page.selected;
                                    }
                                )[0].label,
                                'audience': model.audiences.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.audiences.selected;
                                    }
                                )[0].label,
                                'adaccount': model.adaccount.data.filter(
                                    function (elem) {
                                        return elem.id ===
                                            model.adaccount.selected;
                                    }
                                )[0].label,
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

            if (!String(item.id).indexOf('new_')) {
                group.items.splice(group.items.indexOf(item, 1));
                return true;
            }

            item.deleted = 1;
        };

        $scope.add = function (group) {
            group.items.push({
                'id': 'new_' + group.items.length,
                'condition': 'NONE',
                'action': 'NONE',
                'my': 1,
                'value': 50,
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

        $scope.condNoneCheck = function (item) {
            return item.condition === 'NONE';
        };

        $scope.actionNoneCheck = function (item) {
            return item.action === 'NONE';
        };

        $scope.emptyOptions = function (item) {
            if (item.action === 'promotion_start') {
                return !Object.keys(item.options).length;
            }
            return 0;
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
