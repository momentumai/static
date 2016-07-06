/*global momentum, bvConfig*/
momentum.factory('category', [
    '$q',
    '$http',
    function ($q, $http) {
        var category = {};

        category.list = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'dashboard/category/list'
            ].join(''), {
                'session_id': sessionId,
                'cache': [
                    sessionId
                ]
            }).then(function (response) {
                return response.data;
            });
        };

        category.getWithSelected = function (sessionId) {
            return $q.all([
                category.getSelected(sessionId),
                category.list(sessionId)
            ]).then(function (res) {
                var selectedCats = res[0],
                    catMap = res[1],
                    ret = {
                        'category': {
                            'data': null,
                            'selected': null,
                            'label': 'Filter by category'
                        },
                        'subCategory': {
                            'data': [{
                                'id': 'all',
                                'label': 'ALL'
                            }],
                            'selected': 'all',
                            'label': 'Filter by sub category'
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

                function loadSubSubCategory () {
                    ret.subSubCategory.data = [{
                        'id': 'all',
                        'label': 'ALL'
                    }].concat(Object.keys(
                        catMap[ret.category.selected] &&
                        catMap[
                            ret.category.selected
                        ][ret.subCategory.selected] ||
                        {}
                    ).reduce(function (prev, act) {
                        prev.push({
                            'id': act,
                            'label': decodeURIComponent(act)
                        });
                        return prev;
                    }, []));

                    ret.subSubCategory.selected = 'all';
                }

                function loadSubCategory () {
                    ret.subCategory.data = [{
                        'id': 'all',
                        'label': 'ALL'
                    }].concat(Object.keys(
                        catMap[ret.category.selected] || {}
                    ).reduce(function (prev, act) {
                        prev.push({
                            'id': act,
                            'label': decodeURIComponent(act)
                        });
                        return prev;
                    }, []));

                    ret.subCategory.selected = 'all';

                    loadSubSubCategory ();
                }

                ret.category.data = [{
                    'id': 'all',
                    'label': 'ALL'
                }].concat(Object.keys(
                    catMap
                ).reduce(function (prev, act) {
                    prev.push({
                        'id': act,
                        'label': decodeURIComponent(act)
                    });
                    return prev;
                }, []));

                ret.category.selected = Object.keys(
                    catMap
                ).filter(function (act) {
                    return act === selectedCats[0];
                })[0] && selectedCats[0] || 'all';

                loadSubCategory();

                ret.subCategory.selected = Object.keys(
                    catMap[ret.category.selected] || {}
                ).filter(function (act) {
                    return act === selectedCats[1];
                })[0] && selectedCats[1] || 'all';

                loadSubSubCategory();

                ret.subSubCategory.selected = Object.keys(
                    catMap[ret.category.selected] &&
                    catMap[ret.category.selected][ret.subCategory.selected] ||
                    {}
                ).filter(function (act) {
                    return act === selectedCats[2];
                })[0] && selectedCats[2] || 'all';

                ret.category.change = loadSubCategory;
                ret.subCategory.change = loadSubSubCategory;

                return ret;
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
