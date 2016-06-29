/*global momentum, bvConfig*/
momentum.controller('MainController', [
    'content',
    'recommended',
    'fb',
    '$q',
    '$scope',
    function (content, recommended, fb, $q, $scope) {
        $scope.viewLoaded = 0;
        $scope.topPosts = null;
        $scope.currentPost = null;
        $scope.dashboardUrl = bvConfig.docBase;

        $scope.share = function (contentId) {
            content.getInfo(
                $scope.sessionId,
                contentId
            ).then(function (info) {
                fb.share(info.share_link);
            });
        };

        function init () {
            var promises = {
                'recommended': recommended.list(
                    $scope.sessionId,
                    2
                ),
                'currentTab': recommended.get(
                    $scope.sessionId,
                    $scope.tabUrl
                )
            };

            promises['recommended'].then(function (posts) {
                $scope.topPosts = posts.data;
            });

            promises['currentTab'].then(function (currentPost) {
                $scope.currentPost = currentPost;
            });

            return $q.all(promises).then(function () {
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
