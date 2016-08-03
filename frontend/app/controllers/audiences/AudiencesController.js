/*global momentum */
momentum.controller('AudiencesController', [
    '$scope',
    'fb',
    function ($scope, fb) {
        $scope.viewLoaded = 0;

        $scope.audiences = [{
            'id': 'random_id',
            'name': 'Programozok akik hotfixelnek',
            'data': {
                'custom_audiences': [{'id': '6042873124795'}]
            }
        }, {
            'id': 'random_id2',
            'name': 'Programozok akik meg mindig hotfixelnek',
            'data': {
                'custom_audiences': [{'id': '6042873124795'}]
            }
        }, {
            'id': 'random_id3',
            'name': 'Programozok akik meg mindig hotfixelnek :(',
            'data': {
                'custom_audiences': [{'id': '6042873124795'}]
            }
        }];

        $scope.customAudiences = null;

        $scope.deleteCustomAudience = function (audience, id) {
            var d = audience.data;

            d.custom_audiences = d.custom_audiences.filter(function (act) {
                return act.id && act.id !== id;
            });
        };

        $scope.addCustomAudience = function (audience) {
            if (audience.$caValue) {
                audience.data.custom_audiences.push({
                    'id': audience.$caValue
                });
            }
            delete audience.$caValue;
        };

        $scope.filteredCustomAudiences = function (audience) {
            var ca = audience.data.custom_audiences.map(function (act) {
                return act.id;
            });

            return $scope.customAudiences.filter(function (act) {
                return !act.id || ca.indexOf(act.id) === -1;
            });
        };

        $scope.customAudienceByid = function (id) {
            var cad = $scope.customAudiences.filter(function (act) {
                return act.id && id && act.id === id;
            });

            return cad[0] && cad[0].name || 'Custom audience does not exist';
        };

        $scope.open = function (asset, audience) {
            var willOpen;

            if (audience.open) {
                return false;
            }

            $scope.assets.forEach(function (asset) {
                asset.audiences.isOpen = 0;
                asset.audiences.forEach(function (a) {
                    a.open = 0;
                });
            });

            asset.audiences.forEach(function (a) {
                if (a.id === audience.id) {
                    willOpen = a;
                }
            });

            if (willOpen) {
                return fb.get([
                    '/',
                    asset.id,
                    '/customaudiences',
                    '?fields=name'
                ].join(''),
                    $scope.user.fb_access_token
                ).then(function (res) {
                    $scope.customAudiences = res.data;
                    $scope.customAudiences.unshift({
                        'name': 'Add custom audence'
                    });
                    willOpen.open = 1;
                    asset.audiences.isOpen = 1;
                });
            }
        };

        function init () {
            fb.listAssets(
                $scope.sessionId
            ).then(function (a) {
                a = a.filter(function (act) {
                    return act.type === 'adaccount';
                }).sort(function (a, b) {
                    return Number(b.default) - Number(a.default);
                }).map(function (act) {
                    return {
                        'name': act.display,
                        'id': act.value,
                        'audiences': $scope.audiences
                    };
                });

                $scope.assets = a;
                $scope.viewLoaded = 1;
            });
            //fb.get('/me', $scope.user.fb_access_token);
        }

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
