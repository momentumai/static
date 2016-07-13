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

    function getPostData (row) {
        return {
            'id': row.contentId,
            'src': row.url,
            'title':
                row.ogdata &&
                row.ogdata.title &&
                row.ogdata.title.trim() ||
                row.url,
            'url': row.url,
            'shareLink': row.shareLink,
            'img': row.ogdata && row.ogdata.image,
            'momentum': Math.round(row.momentum * 100),
            'chartData': row.stats && getChartData(
                row.stats.view &&
                row.stats.view.values ||
                null
            ) || null,
            'recommended': Number(row.recommended || 0),
            'promoted': row.promoted || 0,
            'dashboardUrl': [
                bvConfig.docBase,
                '/#/dashboard/main/content/',
                row.contentId
            ].join(''),
            'chart': row.chart,
            'stats': row.stats,
            'organic': row.organic,
            'team': row.team,
            'paid': row.paid,
            'source': row.source,
            'blacklist': row.blacklist,
            'og': row.ogdata || {}
        };
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
                contents.push(getPostData(posts[i]));
            }

            return {'data': contents};
        });
    };

    post.url = function (sessionId, url) {
        return $http.post([
            bvConfig.endpoint,
            'dashboard/post/url'
        ].join(''), {
            'session_id': sessionId,
            'url': url
        }).then(function (resp) {
            var post = resp.data;

            return Object.keys(post).length &&
                getPostData(post) || null;
        });
    };

    return post;
}]);
