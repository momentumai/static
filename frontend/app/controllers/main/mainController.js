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
                        $state.go('root.main.content.info', {
                            'contentId': content.id
                        });
                    } else {
                        $state.go('root.main.dashboard.info');
                        $scope.content = null;
                    }
                } else {
                    content.active = 0;
                }
            });
        };

        function checkContents (posts, contentId, redirect) {
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
                        $state.go('root.main.content.info', {
                            'contentId': contentId
                        });
                    }
                } else {
                    post.active = 0;
                }
            });

            if (!hasPost) {
                $state.go('root.main.dashboard.info');
                $scope.content = null;
            }
        }

        function oneMinutePoll () {
            var promises = {
                'posts': post.list($scope.sessionId, 20)
            };

            if (poller) {
                $timeout.cancel(poller);
            }

            promises.posts = promises.posts.then(function (posts) {
                $scope.posts = posts.data;
                checkContents($scope.posts, $scope.stateParams.contentId);
            });

            $q.all(promises).then(function () {
                $timeout(function () { $scope.viewLoaded = 1; });
                poller = $timeout(oneMinutePoll, 60000);
            });
        }

        if ($scope.loaded) {
            oneMinutePoll();
        } else {
            $scope.$on('loaded', oneMinutePoll);
        }

        $scope.$watch('stateParams', function (stateParams) {
            if (stateParams) {
                checkContents($scope.posts, stateParams.contentId, 1);
            }
        });

        $scope.$on('$destroy', function () {
            if (poller) {
                $timeout.cancel(poller);
            }
        });
    }
]);
