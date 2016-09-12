/*global momentum*/
momentum.controller('MainController', [
    'post',
    '$state',
    '$scope',
    '$q',
    '$timeout',
    function (
        post,
        $state,
        $scope,
        $q,
        $timeout
    ) {
        var poller;

        $scope.posts = null;
        $scope.viewLoaded = 0;

        $scope.itemClick = function (id) {
            $scope.posts.forEach(function (content) {
                if (content.id === id) {
                    content.active = content.active ? 0 : 1;
                    if (content.active) {
                        $state.go('root.main.content.history', {
                            'contentId': content.id
                        });
                    } else {
                        $state.go('root.main.dashboard.history');
                        $scope.content = null;
                    }
                } else {
                    content.active = 0;
                }
            });
        };

        function checkContents (posts, contentId, redirect, first) {
            var hasPost = 0;

            if (!posts) {
                return;
            }

            posts.forEach(function (post) {
                if (post.id === contentId) {
                    post.active = 1;
                    hasPost = 1;
                    $scope.content = post;
                    if (redirect) {
                        $state.go('root.main.content.history', {
                            'contentId': contentId
                        });
                    }
                } else {
                    post.active = 0;
                }
            });

            if (!hasPost && ($scope.content || first)) {
                if (!$state.includes('root.main.dashboard')) {
                    $state.go('root.main.dashboard.history');
                }
                $scope.content = null;
            }
        }

        function oneMinutePoll (first) {
            var promises = {
                'posts': post.list($scope.sessionId, 20)
            };

            if (poller) {
                $timeout.cancel(poller);
            }

            promises.posts = promises.posts.then(function (posts) {
                $scope.posts = posts.data;
                checkContents(
                    $scope.posts,
                    $scope.stateParams.contentId,
                    0,
                    first
                );
            });

            $q.all(promises).finally(function () {
                $timeout(function () { $scope.viewLoaded = 1; });
                poller = $timeout(oneMinutePoll, 60000);
            });
        }

        if ($scope.loaded) {
            oneMinutePoll(1);
        } else {
            $scope.$on('loaded', oneMinutePoll.bind(null, 1));
        }

        $scope.$watch('stateParams.contentId', function (contentId) {
            if (contentId) {
                checkContents($scope.posts, contentId, 1, 0);
            }
        });

        $scope.$on('$destroy', function () {
            if (poller) {
                $timeout.cancel(poller);
            }
        });
    }
]);
