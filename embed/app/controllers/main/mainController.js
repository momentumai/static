/*global momentum, bvConfig*/
momentum.controller('MainController', [
    'post',
    'fb',
    '$q',
    '$scope',
    function (post, fb, $q, $scope) {
        $scope.viewLoaded = 0;
        $scope.topPosts = null;
        $scope.currentPost = null;
        $scope.dashboardUrl = bvConfig.docBase;
        $scope.content = null;

        $scope.share = function (content) {
            fb.share(content.shareLink);
        };

        function init () {
            var promises = {
                'recommended': post.list(
                    $scope.sessionId
                ),
                'current': post.url(
                    $scope.sessionId,
                    $scope.tabUrl
                )
            };

            promises['recommended'].then(function (posts) {
                $scope.topPosts = posts.data.slice(0, 2).filter(function (act) {
                    return act.recommended;
                });
            });

            return $q.all(promises).then(function (res) {
                var min,
                    hasCurrent;

                res['recommended'].data.forEach(function (act) {
                    if ($scope.tabUrl.indexOf(act.url) !== -1) {
                        hasCurrent = 1;
                        $scope.currentPost = act;
                    }
                    min = act.momentum;
                });

                if (!hasCurrent && res['current']) {
                    min = Number(min);
                    $scope.currentPost = res['current'];
                    $scope.currentPost.momentum = min && ('<' + min) || '0';
                }

                $scope.viewLoaded = 1;
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
