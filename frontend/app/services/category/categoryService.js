/*global momentum, bvConfig*/
momentum.factory('category', [
    '$q',
    '$http',
    function ($q, $http) {
        var category = {};

        category.list = function (sessionId, parent) {
            return $http.post([
                bvConfig.endpoint,
                'dashboard/category/list'
            ].join(''), {
                'session_id': sessionId,
                'parent': Number(parent) || 0,
                'cache': [
                    sessionId,
                    String(parent || 0)
                ]
            }).then(function (response) {
                return response.data;
            });
        };

        category.getWithSelected = function (sessionId) {
            return category.getSelected(sessionId).then(function (cats) {
                var cat1 = cats[0],
                    cat2 = cats[1],
                    cat3 = cats[2],
                    promises = {},
                    res = {
                        'category': {
                            'data': null,
                            'selected': null,
                            'label': 'Filter by category',
                            'change': function () {
                                res.subSubCategory.selected = 'all';
                                res.subCategory.selected = 'all';
                                res.subSubCategory.data = [{
                                    'id': 'all',
                                    'label': 'ALL'
                                }];
                                if (res.category.selected === 'all') {
                                    res.subCategory.data = [{
                                        'id': 'all',
                                        'label': 'ALL'
                                    }];
                                } else {
                                    res.subCategory.disabled = 1;
                                    category.list(
                                        sessionId,
                                        res.category.selected
                                    ).then(function (data) {
                                        res.subCategory.data = data;
                                        res.subCategory.disabled = 0;
                                    });
                                }
                            }
                        },
                        'subCategory': {
                            'data': [{
                                'id': 'all',
                                'label': 'ALL'
                            }],
                            'selected': 'all',
                            'label': 'Filter by sub category',
                            'change': function () {
                                res.subSubCategory.selected = 'all';
                                if (res.subCategory.selected === 'all') {
                                    res.subSubCategory.data = [{
                                        'id': 'all',
                                        'label': 'ALL'
                                    }];
                                } else {
                                    res.subSubCategory.disabled = 1;
                                    category.list(
                                        sessionId,
                                        res.subCategory.selected
                                    ).then(function (data) {
                                        res.subSubCategory.data = data;
                                        res.subSubCategory.disabled = 0;
                                    });
                                }
                            }
                        },
                        'subSubCategory': {
                            'data': [{
                                'id': 'all',
                                'label': 'ALL'
                            }],
                            'selected': 'all',
                            'label': 'Filter by sub sub category'
                        }
                    };

                promises['root'] = category.list(
                    sessionId,
                    0
                ).then(function (data) {
                    res.category.data = data;
                    res.category.selected = cat1 || 'all';
                });

                if (cat1) {
                    promises['sub'] = category.list(
                        sessionId,
                        cat1
                    ).then(function (data) {
                        res.subCategory.data = data;
                        res.subCategory.selected = cat2 || 'all';
                    });
                }

                if (cat2) {
                    promises['subSub'] = category.list(
                        sessionId,
                        cat2
                    ).then(function (data) {
                        res.subSubCategory.data = data;
                        res.subSubCategory.selected = cat3 || 'all';
                    });
                }

                return $q.all(promises).then(function () {
                    return res;
                });
            });
        };

        category.getSelected = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'auth/team/user/data/get'
            ].join(''), {
                'session_id': sessionId,
                'key': 'filter'
            }).then(function (response) {
                var categories = [];

                if (response.data) {
                    try {
                        categories = JSON.parse(response.data);
                    } catch (ignore) {
                        //ignore
                    }
                }

                return categories;
            });
        };

        category.setSelected = function (sessionId, selected) {
            var categories = [];

            if (selected.category !== 'all') {
                categories.push(selected.category);
                if (selected.subCategory !== 'all') {
                    categories.push(selected.subCategory);
                    if (selected.subSubCategory !== 'all') {
                        categories.push(selected.subSubCategory);
                    }
                }
            }

            return $http.post([
                bvConfig.endpoint,
                'auth/team/user/data/set'
            ].join(''), {
                'session_id': sessionId,
                'key': 'filter',
                'value': JSON.stringify(categories)
            }).then(function () {
                return {};
            });
        };

        return category;
    }
]);
