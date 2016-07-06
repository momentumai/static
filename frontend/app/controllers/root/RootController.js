/*global momentum, window*/
momentum.controller('RootController', [
    '$state',
    '$stateParams',
    '$q',
    '$scope',
    '$rootScope',
    'storage',
    'auth',
    'dialog',
    'category',
    'guide',
    function (
        $state,
        $stateParams,
        $q,
        $scope,
        $rootScope,
        storage,
        auth,
        dialog,
        category,
        guide
    ) {
        $scope.sessionId = '0';

        function sendSessionId () {
            window.postMessage({
                'type': 'BVSID',
                'value': $scope.sessionId
            },
            '*');
        }

        $scope.state = $state;
        $scope.stateParams = $stateParams;
        $scope.loaded = 0;

        $scope.openFilters = function () {
            category.getWithSelected(
                $scope.sessionId
            ).then(function (data) {
                dialog.open({
                    'title': 'Filters',
                    'template': 'filterDialog.tpl.html',
                    'okText': 'Save',
                    'showCancel': true,
                    'destroy': false,
                    'model': data
                }).then(function () {
                    storage.invalidateCache();
                    return category.setSelected($scope.sessionId, {
                        'category': data.category.selected,
                        'subCategory': data.subCategory.selected,
                        'subSubCategory': data.subSubCategory.selected
                    }).then(function () {
                        window.location.reload(true);
                    });
                }).catch(function () {});
            });
        };

        storage.getSessionId().then(function (data) {
            $scope.sessionId = data;
            return auth.getUser(data);
        }).then(function (user) {
            $scope.user = user;
            $scope.loaded = 1;
            sendSessionId();

            $scope.$broadcast('loaded');

            if (!Number(user.is_super)) {
                return guide.show($scope.sessionId, user);
            }
        });

        $rootScope.$on(
            '$stateChangeStart',
            function (
                event,
                toState,
                toStateParams,
                fromState
            ) {
                if (!toState.name.indexOf('root.main') &&
                    $scope.user.payment_amount) {
                    event.preventDefault();
                    if (fromState.name.indexOf('root.billing')) {
                        $state.go('root.billing');
                    }
                }
                $scope.stateParams = toStateParams;
            }
        );
    }
]);
