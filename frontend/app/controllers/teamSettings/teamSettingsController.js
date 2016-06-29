/*global momentum, window */
momentum.controller('TeamSettingsController', [
    'auth',
    'toast',
    'dialog',
    '$q',
    '$timeout',
    '$scope',
    function (auth, toast, dialog, $q, $timeout, $scope) {
        function updateUsers () {
            return auth.getUsers($scope.sessionId).then(function (users) {
                $scope.usersContainer.users.length = 0;
                $scope.usersContainer.users.push.apply(
                    $scope.usersContainer.users,
                    users
                );
            });
        }

        function getCode () {
            return auth.getCode($scope.sessionId).then(function (resp) {
                $scope.codeContainer.code = resp;
            });
        }

        function animate () {
            $timeout(function () {
                $scope.usersContainer.animate();
                $scope.codeContainer.animate();
            });
        }

        $scope.usersContainer = {
            'switchProgress': 0,
            'users': [],
            'removeUser': function (id, email) {
                dialog.open({
                    'title': 'Remove user?',
                    'htmlText': '<div>{{model.email}}</div>',
                    'okText': 'Remove',
                    'cancelText': 'Cancel',
                    'showCancel': true,
                    'model': {
                        'email': email
                    }
                }).then(function () {
                    return auth.removeUser(
                        $scope.sessionId,
                        id
                    ).then(function (users) {
                        $scope.usersContainer.users.length = 0;
                        $scope.usersContainer.users.push.apply(
                            $scope.usersContainer.users,
                            users
                        );
                    }).then(function () {
                        return toast.open({
                            'htmlText': email + ' removed'
                        });
                    });
                }).catch(function () {});
            },
            'addUser': function () {
                dialog.open({
                    'title': 'Invite user',
                    'template': 'inviteUserDialog.tpl.html',
                    'okText': 'Invite',
                    'cancelText': 'Cancel',
                    'showCancel': true,
                    'model': {}
                }).then(function (data) {
                    return auth.inviteUser(
                        $scope.sessionId,
                        data.email
                    ).then(function (users) {
                        $scope.usersContainer.users.length = 0;
                        $scope.usersContainer.users.push.apply(
                            $scope.usersContainer.users,
                            users
                        );
                    }).then(function () {
                        return toast.open({
                            'htmlText': data.email + ' added'
                        });
                    });
                }).catch(function () {});
            },
            'switchState': function (id, state) {
                $scope.switchProgress = 1;
                return auth.switchAdminState(
                    $scope.sessionId,
                    id,
                    state
                ).then(function () {
                    updateUsers().then(function () {
                        $scope.switchProgress = 0;
                    });
                }).then(function () {
                    return toast.open({
                        'htmlText': 'Permission changed'
                    });
                });
            }
        };

        $scope.codeContainer = {
            'code': '',
            'copy': function () {
                var copyTextarea;

                copyTextarea = window
                    .document
                    .getElementById('tr-code');
                copyTextarea.select();

                try {
                    window.document.execCommand('copy');
                    return toast.open({
                        'htmlText': 'Copied to clipboard'
                    });
                } catch (err) {
                    return toast.open({
                        'htmlText': 'Can\'t copy to clipboard. Use Ctrl/Cmd-C'
                    });
                }
            }
        };

        $scope.viewLoaded = 0;

        function init () {
            var promises = {
                'users': updateUsers(),
                'code': getCode()
            };

            return $q.all(promises).then(function () {
                animate();
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
