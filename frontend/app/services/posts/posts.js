/*global momentum, bvConfig*/
momentum.factory('post', ['$http',
function ($http) {
    var post = {};

    function getChartData (data) {
        var ret = [];

        if (!data) {
            return ret;
        }

        data.forEach(function (act, index) {
            ret.push({
                'x': index,
                'y': Number(act)
            });
        });
        return ret;
    }

    post.list = function (sessionId, limit) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/post/list'
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
                    'recommended': Number(posts[i].recommended),
                    'promoted': posts[i].promoted,
                    'dashboardUrl': [
                        bvConfig.docBase,
                        '/#/dashboard/content/',
                        posts[i].id
                    ].join('')
                });
            }

            return {'data': contents, 'interval': posts.interval};
        });
    };

    return post;
}]);
