/*global momentum*/
momentum.controller('PromoteController', [
    '$stateParams',
    '$state',
    'fb',
    '$scope',
    function ($stateParams, $state, fb, $scope) {
        $scope.viewLoaded = 0;
        $scope.content = $stateParams.content;

        function init () {
            var model = $stateParams.model,
                params = {
                    'ad_account': model.adaccount.selected,
                    'auto': model.automated,
                    'budget': model.budget * model.currency.offset,
                    'audience': model.audiences.selected,
                    'page': model.page.selected,
                    'creative_id': model.creative_id,
                    'campaign': model.campaign
                };

            if (!params.auto) {
                params.end_time = new Date(
                    model.until
                ).getTime() / 1000;
            }

            return fb.createPromotion(
                $scope.sessionId,
                $scope.content.id,
                params
            ).then(function () {
                $scope.viewLoaded = 1;
            }).catch(function (err) {
                $state.go('error', {
                    'message': err
                });
            });
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
