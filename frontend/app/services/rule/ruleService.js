/*global momentum, bvConfig, angular*/
momentum.factory('rule', ['category', '$q', '$http',
    function (category, $q, $http) {
        var rule = {},
            moduleMap = {
                'slack|alert_make': 'top_not_alerted',
                'promotion_stop|alert_remove': 'alerted',
                'promotion_start': 'top_not_promoted',
                'promotion_stop|promotion_finish': 'promoted',
                'share': 'top_not_shared'
            };

        function getKey (item) {
            var ret = [];

            [
                item.cat1,
                item.cat2,
                item.cat3
            ].forEach(function (cat) {
                if (cat !== 'NONE') {
                    ret.push(decodeURIComponent(cat));
                }
            });

            return ret.length && ret.join(', ') || 'Global';
        }

        function transform (items) {
            var ret = [];

            items.forEach(function (item) {
                var root = item.definition.OR[0],
                    metric = Object.keys(root)[0],
                    actions = item.definition.action.slice(0),
                    act;

                if (item.deleted) {
                    return;
                }

                actions.sort(function (a, b) {
                    return a < b;
                });

                act = {
                    'id': item.id,
                    'value': root[metric][Object.keys(root[metric])[0]],
                    'condition': Object.keys(root[metric])[0],
                    'action': actions.join('|'),
                    'metric': metric,
                    'options': Object.keys(item.options).length &&
                        item.options || {},
                    'my': Number(item.my),
                    'name': item.name,
                    'parent': item.parent && {
                        'id': String(item.parent)
                    } || {
                        'id': 'all'
                    }
                };

                act.$original = angular.copy(act);

                ret.push(act);
            });

            return ret;
        }

        function group (items, cats) {
            var g = {},
                ret = [],
                activeGroup;

            function transformCats (cats) {
                var i = 0,
                    ret = cats.slice(0);

                for (; i < ret.length; i += 1) {
                    if (ret[i] === 'all') {
                        ret[i] = 'NONE';
                    }
                }

                return ret;
            }

            cats = transformCats(cats);

            items.forEach(function (item) {
                var key = getKey(item);

                g[key] = g[key] || [];

                g[key].push(item);
            });

            Object.keys(g).forEach(function (group) {
                ret.push({
                    'id': group,
                    'items': g[group],
                    'cat1': g[group][0].cat1,
                    'cat2': g[group][0].cat2,
                    'cat3': g[group][0].cat3
                });
            });

            ret.sort(function (a, b) {
                if (a === 'Global' || b === 'Global') {
                    return 1;
                }

                return a > b;
            });

            ret.forEach(function (group) {
                group.items = transform(group.items);
                if (group.cat1 === cats[0] &&
                    group.cat2 === cats[1] &&
                    group.cat3 === cats[2]) {
                    activeGroup = group;
                }
            });

            ret.splice(ret.indexOf(activeGroup), 1);

            activeGroup.active = 1;

            return {
                'active': activeGroup,
                'groups': ret
            };
        }

        rule.list = function (sessionId) {
            return category.getWithSelected(
                sessionId
            ).then(function (data) {
                return $http.post([
                    bvConfig.endpoint,
                    'rule/list'
                ].join(''), {
                    'session_id': sessionId
                }).then(function (res) {
                    res.data.forEach(function (act) {
                        act.definition = JSON.parse(
                            act.definition
                        );
                        act.options = JSON.parse(
                            act.options
                        );
                    });
                    return group(res.data, [
                        data.category.selected,
                        data.subCategory.selected,
                        data.subSubCategory.selected
                    ]);
                });
            });
        };

        function transformItem (group, item) {
            var req = {};

            req.id = item.id || '';
            req.name = item.name || '';
            req.cat1 = group.cat1;
            req.cat2 = group.cat2;
            req.cat3 = group.cat3;
            req.definition = {
                'OR': [{}],
                'action': item.action.split('|')
            };

            req.definition.OR[0][item.metric] = {};
            req.definition.OR[0][item.metric][item.condition] = item.value;

            req.definition = JSON.stringify(req.definition, null, 4);

            req.module = moduleMap[item.action];

            if (item.parent && item.parent.id && item.parent.id !== 'all') {
                req.parent = item.parent.id;
            } else {
                req.parent = null;
            }

            req.my = item.my;

            if (Object.keys(item.options).length) {
                req.options = JSON.stringify(item.options, null, 4);
            }

            return req;
        }

        rule.saveGroup = function (sessionId, group) {
            var newElements = [],
                deletedElements = [],
                updatedElements = [];

            group.items.forEach(function (item) {
                if (!item.$original) {
                    newElements.push(transformItem(group, item));
                    return;
                }

                if (item.deleted) {
                    deletedElements.push({
                        'id': item.id
                    });
                    return;
                }

                if (!angular.equals(item, item.$original)) {
                    updatedElements.push(transformItem(group, item));
                    return;
                }
            });

            if (!newElements.length &&
                !deletedElements.length &&
                !updatedElements.length) {
                return $q.resolve();
            }

            return $http.post([
                bvConfig.endpoint,
                'rule/save'
            ].join(''), {
                'session_id': sessionId,
                'data': {
                    'add': newElements,
                    'delete': deletedElements,
                    'update': updatedElements
                }
            }).then(function (res) {
                return res.data;
            });
        };

        return rule;
    }
]);
