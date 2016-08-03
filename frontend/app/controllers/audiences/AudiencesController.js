/*global momentum, angular */
momentum.controller('AudiencesController', [
    '$q',
    '$scope',
    'audience',
    'fb',
    function ($q, $scope, audience, fb) {
        $scope.viewLoaded = 0;

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

            return cad[0] && cad[0].name || 'Choose a custom audience';
        };

        $scope.close = function () {
            $scope.assets.forEach(function (asset) {
                asset.audiences.isOpen = 0;
                asset.audiences.forEach(function (a) {
                    a.open = 0;
                });
            });
        };

        $scope.open = function (asset, audience) {
            var willOpen;

            if (audience.open) {
                return false;
            }

            $scope.assets.forEach(function (asset) {
                asset.audiences.isOpen = 0;
                asset.audiences.forEach(function (a, index) {
                    a.open = 0;
                    asset.audiences[index] = asset.audiences[index].$original;
                    asset.audiences[index].$original = angular.copy(
                        asset.audiences[index]
                    );
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
                        'name': 'Add custom audience'
                    });
                    willOpen.open = 1;
                    asset.audiences.isOpen = 1;
                });
            }
        };

        function init () {
            var promises = {},
                assets,
                aus;

            promises['au'] = audience.list().then(function (a) {
                aus = a;
            });

            promises['fb'] = fb.listAssets(
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
                        'audiences': []
                    };
                });

                assets = a;
            });

            $q.all(promises).then(function () {
                Object.keys(aus).forEach(function (id) {
                    var asset = assets.filter(function (act) {
                        return act.id === id;
                    })[0];

                    if (asset) {
                        asset.audiences = aus[id];
                    }
                });

                $scope.assets = assets;
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
