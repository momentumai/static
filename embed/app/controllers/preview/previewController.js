/*global momentum */
momentum.controller('PreviewController', [
    '$q',
    '$stateParams',
    '$state',
    'fb',
    'content',
    '$scope',
    function ($q, $stateParams, $state, fb, content, $scope) {
        $scope.viewLoaded = 0;
        $scope.model = $stateParams.model;
        $scope.content = $stateParams.content;

        function loadPreview (info) {
            var model = $scope.model,
                name = model.og.title ||
                    info.title ||
                    info.url,
                byId = function (array, id) {
                    return array.filter(
                        function (act) {
                            return act.id === id;
                        }
                    )[0] || {};
                },
                meta = {
                    'page': byId(
                        model.page.data,
                        model.page.selected
                    ).label,
                    'audience': byId(
                        model.audiences.data,
                        model.audiences.selected
                    ).label,
                    'adaccount': byId(
                        model.adaccount.data,
                        model.adaccount.selected
                    ).label,
                    'currency': model.currency.name,
                    'offset': model.currency.offset
                };

            if (!model.audiences.selected) {
                return $q.reject('You must have at least one saved audience');
            }

            model.preview = {
                'ad_account': model.adaccount.selected,
                'page_id': model.page.selected,
                'description': model.og.description || '',
                'name': name,
                'message': model.message,
                'caption': model.og.site_name || '',
                'image': model.og.image || '',
                'link': info.url,
                'utm_source': model.utm_source,
                'utm_medium': model.utm_medium,
                'utm_campaign': model.utm_campaign
            };

            model.preview['end_time'] = new Date(
                model.until
            ).getTime() / 1000;

            model.preview.meta = meta;

            return fb.preview(
                $scope.sessionId,
                $scope.content.id,
                model.preview
            ).then(function (data) {
                model.previewHtml = data.preview;
                model.creative_id = data.creative_id;
                model.campaign = data.campaign;
            });
        }

        $scope.promote = function () {
            $state.go('promote', {
                'model': $scope.model,
                'content': $scope.content
            });
        };

        function init () {
            loadPreview($scope.content).then(function () {
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
