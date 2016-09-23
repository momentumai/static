/*global momentum, angular, window */
momentum.controller('ExperimentWizardPreviewController', [
    'fb',
    '$timeout',
    '$q',
    '$scope',
    function (fb, $timeout, $q, $scope) {
        $scope.viewLoaded = 0;

        $scope.promote = {
            'name': '',
            'budget': 20,
            'days': 1,
            'utm_source': 'facebook',
            'utm_medium': '',
            'utm_campaign': '',
            'accounts': {
                'label': 'Ad account',
                'data': [],
                'selected': null
            },
            'audiences': {
                'label': 'Audience',
                'data': [],
                'selected': null
            }
        };

        $scope.previewList = {
            'data': [],
            'remove': function (index) {
                $scope.previewList.data.splice(index, 1);
            },
            'range': function (n) {
                return new Array(n);
            }
        };

        function animate () {
            $timeout(function () {
                $scope.previewList.animate();
                $scope.promote.animate();
            });
        }

        function generatePreviews () {
            $scope.stateParams.config.texts.forEach(function (textSet) {
                $scope.stateParams.config.images.forEach(function (image) {
                    $scope.previewList.data.push(
                        angular.extend(
                            {
                                'image': image
                            },
                            textSet
                        )
                    );
                });
            });
        }

        function getHost (url) {
            var l = window.document.createElement('a');

            l.href = 'http://' + url;
            return l.hostname;
        }

        function accountChange () {
            var promises = {};

            promises['audiences'] = fb.audiences(
                $scope.sessionId,
                $scope.promote.accounts.selected
            );

            promises['currency'] = fb.currency(
                $scope.sessionId,
                $scope.promote.accounts.selected
            );

            return $q.all(promises).then(function (res) {
                var offset = res.currency && res.currency.offset || 100;

                $scope.promote.audiences.data = res.audiences.data;
                $scope.promote.audiences.selected = res.audiences.data[0] &&
                    res.audiences.data[0].id || null;

                $scope.promote.currency = res.currency;
                $scope.promote.budget = Math.floor(
                    2000 /
                    offset
                );
            });
        }

        function init () {
            var promises = {};

            $scope.promote.name = $scope.stateParams.content.title;

            promises['assets'] = fb.listAssets(
                $scope.sessionId
            );

            promises['assets'] = promises['assets'].then(function (a) {
                a = a.filter(function (act) {
                    return act.type === 'adaccount';
                }).sort(function (a, b) {
                    return Number(b.default) - Number(a.default);
                }).map(function (act) {
                    return {
                        'label': act.display,
                        'id': act.value
                    };
                });

                $scope.promote.accounts.data = a;
                $scope.promote.accounts.selected = a[0].id;

                $scope.promote.accounts.change = accountChange;

                return accountChange();
            });

            promises['fb'] = fb.get(
                [
                    '/',
                    $scope.stateParams.config.page,
                    '?fields=name,picture'
                ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.pageData = {
                    'name': res.name,
                    'picture': res.picture &&
                        res.picture.data &&
                        res.picture.data.url
                };
                $scope.pageData.url = getHost($scope.stateParams.content.url);
            });

            return $q.all(promises).then(function () {
                generatePreviews();
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
