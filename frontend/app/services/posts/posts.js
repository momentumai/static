/*global momentum, bvConfig*/
momentum.factory('post', ['$http',
function ($http) {
    var post = {};

    function getChartData (data) {
        var ret = [];

        if (!data) {
            return ret;
        }

        Object.keys(data).sort().forEach(function (act, index) {
            ret.push({
                'x': index,
                'y': Number(data[act])
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
                posts = resp.data;

            for (i = 0; i < posts.length; i += 1) {
                contents.push({
                    'id': posts[i].contentId,
                    'src': posts[i].url,
                    'title':
                        posts[i].public &&
                        posts[i].public.title &&
                        posts[i].public.title.trim() ||
                        posts[i].url,
                    'img': posts[i].public && posts[i].public.image,
                    'momentum': Math.round(posts[i].momentum * 100),
                    'chartData': getChartData(
                        posts[i].stats.view &&
                        posts[i].stats.view.values ||
                        null
                    ),
                    'recommended': Number(posts[i].recommended || 0),
                    'promoted': posts[i].promoted || 0,
                    'dashboardUrl': [
                        bvConfig.docBase,
                        '/#/dashboard/content/',
                        posts[i].contentId
                    ].join('')
                });
            }

            return {'data': contents};
        });
    };

    return post;
}]);
