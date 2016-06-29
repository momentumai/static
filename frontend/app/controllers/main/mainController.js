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
            $scope.posts.forEach(function (post) {
                if (post.id === id) {
                    post.active = post.active ? 0 : 1;
                    if (post.active) {
                        $state.go('root.main.content.info', {
                            'contentId': String(id)
                        });
                    } else {
                        $state.go('root.main.dashboard.info');
                    }
                } else {
                    post.active = 0;
                }
            });
        };
        function oneMinutePoll () {
            var promises = {
                'posts': post.list($scope.sessionId, 20)
            };

            if (poller) {
                $timeout.cancel(poller);
            }

            promises.posts = promises.posts.then(function (posts) {
                $scope.posts = posts.data;
                $scope.posts.forEach(function (post) {
                    if (post.id === Number($scope.stateParams.contentId)) {
                        post.active = 1;
                    }
                });
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

        $scope.$on('$destroy', function () {
            if (poller) {
                $timeout.cancel(poller);
            }
        });
    }
]);
