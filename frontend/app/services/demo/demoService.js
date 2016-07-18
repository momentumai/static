/*global momentum, bvConfig, window, angular*/
momentum.factory('demo', [function () {
    var demo = {},
        state = {},
        hackScope = function () {
            var c = window.document.querySelector('main'),
                s = angular.element(c).scope(),
                p = s.$root.$$phase;

            s.posts[0].promoted = state.promoted;
            if (p !== '$apply' && p !== '$digest') {
                s.$apply();
            }
        },
        contentMap = {
            'dashboard/post/list': function () {},
            'dashboard/main': function () {},
            'dashboard/content/sources/history': function () {},
            'facebook/account/list': function () {},
            'promotion/campaign/list': function () {},
            'promotion/autoschedule': function () {},
            'promotion/audience/list': function () {},
            'promotion/currency': function () {},
            'promotion/post/preview': function () {},
            'promotion/create': function () {
                state.promoted = 1;
                hackScope();
            },
            'promotion/disable': function () {
                state.promoted = 0;
                hackScope();
            },
            'promotion/clone': function () {
                state.promoted = 1;
                hackScope();
            }
        };

    demo.isContain = function (url) {
        url = url.replace(bvConfig.endpoint, '');
        return url in contentMap;
    };

    demo.setState = function (key) {
        contentMap[key] && contentMap[key]();
    };

    demo.getState = function () {
        return state;
    };

    return demo;
}]);
