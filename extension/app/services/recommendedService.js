/*global momentum, bvConfig*/
momentum.factory('recommended', ['$http',
function ($http) {
    var recommended = {};

    function getChartData (data) {
        var ret = [];

        data.forEach(function (act, index) {
            ret.push({
                'x': index,
                'y': Number(act)
            });
        });
        return ret;
    }

    recommended.list = function (sessionId, limit) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/post/recommended/list'
        ].join(''), {
            'session_id': sessionId,
            'limit': limit,
            'cache': [
                sessionId,
                limit
            ]
        }).then(function (resp) {
            var contents = [],
                i,
                data = resp.data,
                posts = data.data;

            for (i = 0; i < posts.length; i += 1) {
                contents.push({
                    'id': posts[i].id,
                    'src': posts[i].url,
                    'title': (posts[i].title && posts[i].title.trim()) ||
                        posts[i].url,
                    'img': posts[i].img,
                    'momentum': Math.round(posts[i].momentum * 100),
                    'chartData': getChartData(posts[i].pageviews),
                    'recommended': posts[i].recommended,
                    'promoted': posts[i].promoted,
                    'dashboardUrl': [
                        bvConfig.docBase,
                        '/#/dashboard/main/content/',
                        posts[i].id
                    ].join('')
                });
            }

            return {'data': contents, 'interval': posts.interval};
        });
    };

    recommended.get = function (sessionId, url) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/post/get'
        ].join(''), {
            'session_id': sessionId,
            'url': url,
            'cache': [
                sessionId,
                url
            ]
        }).then(function (resp) {
            var post = resp.data;

            if (!post || post.errorMessage) {
                return null;
            }

            return {
                'id': post.id,
                'src': post.url,
                'title': (post.title && post.title.trim()) ||
                    post.url,
                'img': post.img,
                'momentum': Math.round(post.momentum * 100),
                'chartData': getChartData(post.pageviews),
                'promoted': post.promoted,
                'recommended': post.recommended,
                'dashboardUrl': [
                    bvConfig.docBase,
                    '/#/dashboard/main/content/',
                    post.id
                ].join('')
            };
        });
    };

    return recommended;
}]);
