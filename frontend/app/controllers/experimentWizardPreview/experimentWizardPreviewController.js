/*global momentum, angular, window */
momentum.controller('ExperimentWizardPreviewController', [
    'toast',
    'dialog',
    'experiments',
    'fb',
    '$state',
    '$timeout',
    '$q',
    '$scope',
    function (toast, dialog, experiments, fb, $state, $timeout, $q, $scope) {
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
            },
            'pages': {
                'label': 'Page',
                'data': [],
                'selected': null
            },
            'submit': function () {
                var endTime = new Date();

                endTime.setDate(endTime.getDate() + $scope.promote.days);
                $scope.viewLoaded = 0;

                return experiments.create($scope.sessionId, {
                    'name_text': $scope.promote.name,
                    'audience_id': $scope.promote.audiences.selected,
                    'adaccount': $scope.promote.accounts.selected,
                    'page': $scope.promote.pages.selected,
                    'budget': $scope.promote.budget * (
                        $scope.promote.currency &&
                            $scope.promote.currency.offset || 100
                    ),
                    'end_time': Math.floor(endTime.getTime() / 1000),
                    'content_id': $scope.stateParams.contentId,
                    'utm': {
                        'utm_source': $scope.promote.utm_source,
                        'utm_campaign': $scope.promote.utm_campaign,
                        'utm_medium': $scope.promote.utm_medium
                    },
                    'tests': $scope.previewList.data.map(function (act) {
                        return {
                            'description': act.desc,
                            'name': act.headline,
                            'message': act.message,
                            'image': act.image
                        };
                    })
                }).then(function () {
                    $state.go('root.experiments');
                    return toast.open({
                        'htmlText': 'Experiment created successfully'
                    });
                }).catch(function (err) {
                    $scope.viewLoaded = 1;
                    if (err) {
                        return dialog.open({
                            'htmlText': err
                        });
                    }
                });
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

        function pageChange () {
            if (!$scope.promote.pages.selected) {
                $scope.pageData = {
                    'name': 'Facebook page',
                    'picture': ''
                };
                $scope.pageData.url = getHost($scope.stateParams.content.url);
                return $q.resolve();
            }

            return fb.get(
                [
                    '/',
                    $scope.promote.pages.selected,
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
        }

        function init () {
            var promises = {};

            $scope.promote.name = $scope.stateParams.content.title;

            promises['assets'] = fb.listAssets(
                $scope.sessionId
            );

            promises['assets'] = promises['assets'].then(function (a) {
                var accounts = a.filter(function (act) {
                        return act.type === 'adaccount';
                    }).sort(function (a, b) {
                        return Number(b.default) - Number(a.default);
                    }).map(function (act) {
                        return {
                            'label': act.display,
                            'id': act.value
                        };
                    }),
                    pages = a.filter(function (act) {
                        return act.type === 'page';
                    }).sort(function (a, b) {
                        return Number(b.default) - Number(a.default);
                    }).map(function (act) {
                        return {
                            'label': act.display,
                            'id': act.value
                        };
                    });

                $scope.promote.accounts.data = accounts;
                $scope.promote.accounts.selected = accounts[0] &&
                    accounts[0].id;

                $scope.promote.pages.data = pages;
                $scope.promote.pages.selected = pages[0] && pages[0].id;

                $scope.promote.accounts.change = accountChange;
                $scope.promote.pages.change = pageChange;

                return $q.all([
                    accountChange(),
                    pageChange()
                ]);
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
