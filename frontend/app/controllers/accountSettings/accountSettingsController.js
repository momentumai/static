/*global momentum, window */
momentum.controller('AccountSettingsController', [
    'auth',
    'account',
    'userData',
    'teamUserData',
    'dialog',
    'toast',
    'fb',
    'utils',
    'storage',
    '$q',
    '$timeout',
    '$state',
    '$rootScope',
    '$scope',
    function (
        auth,
        account,
        userData,
        teamUserData,
        dialog,
        toast,
        fb,
        utils,
        storage,
        $q,
        $timeout,
        $state,
        $rootScope,
        $scope
    ) {
        function animate () {
            $timeout(function () {
                $scope.fbInt.animate();
                $scope.notif.animate();
                $scope.pwChange.animate();
                $scope.teamSwitch.animate();
            });
        }

        function getIntegration () {
            return {
                'dataLoading': 0,
                'connected': $scope.user.fb_access_token ? 1 : 0,
                'connect': function () {
                    $scope.fbInt.dataLoading = 1;
                    fb.login().then(function (accessToken) {
                        return fb.token(
                            $scope.sessionId,
                            accessToken
                        ).then(function () {
                            $scope.fbInt.connected = 1;
                            $scope.user.fb_access_token = accessToken;
                            $scope.fbInt.dataLoading = 0;
                        });
                    });
                }
            };
        }

        function getNotif () {
            var isChrome = (/chrom(e|ium)/).test(
                    window.navigator.userAgent.toLowerCase()
                ),
                urls = {
                    'chrome': 'https://support.google.com/' +
                        'chrome/answer/6148059?hl=en-GB',
                    'firefox': 'https://support.mozilla.org/' +
                        'en-US/kb/push-notifications-firefox'
                };

            return {
                'supported': ('serviceWorker' in window.navigator),
                'helpURL': urls[isChrome ? 'chrome' : 'firefox']
            };
        }

        $scope.viewLoaded = 0;

        $scope.fbInt = null;

        $scope.notif = getNotif();

        $scope.teamSwitch = {
            'dataLoading': 0,
            'teams': null,
            'submit': function () {
                $scope.teamSwitch.dataLoading = 1;
                auth.setTeam(
                    $scope.sessionId,
                    $scope.teamSwitch.teams.selected
                ).then(function () {
                    $scope.teamSwitch.dataLoading = 0;
                    $state.go('root.main.dashboard.history');
                    window.location.reload(true);
                });
            }
        };

        $scope.pwChange = {
            'dataLoading': 0,
            'error': '',
            'oldPassword': '',
            'newPassword': '',
            'changePassword': function () {
                $scope.pwChange.dataLoading = 1;
                $scope.pwChange.error = '';

                account.changePassword(
                    $scope.sessionId,
                    $scope.pwChange.oldPassword,
                    $scope.pwChange.newPassword
                ).then(function (response) {
                    var error = response.data.errorMessage;

                    if (error) {
                        $scope.pwChange.error = error.split(':')[2];
                    } else {
                        $scope.pwChange.newPassword = '';
                        $scope.pwChange.oldPassword = '';
                        toast.open({
                            'htmlText': 'Password changed'
                        });
                    }
                }).finally(function () {
                    $scope.pwChange.dataLoading = 0;
                });
            }
        };

        function init () {
            var promises = {};

            promises['teams'] = auth.getTeams(
                $scope.sessionId
            ).then(function (teams) {
                $scope.teamSwitch.teams = teams;
            });

            return $q.all(promises).then(function () {
                $scope.fbInt = getIntegration();
                animate();
                $scope.viewLoaded = 1;
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }]
);
