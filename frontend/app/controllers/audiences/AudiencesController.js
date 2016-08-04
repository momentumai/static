/*global momentum, angular */
momentum.controller('AudiencesController', [
    '$q',
    '$scope',
    'audience',
    'toast',
    'fb',
    function ($q, $scope, audience, toast, fb) {
        $scope.viewLoaded = 0;

        $scope.assets = null;
        $scope.customAudiences = null;

        function makeIfFalsy (data, param, what) {
            data[param] = data[param] || what;
        }

        $scope.customAudienceValidator = function (customAudiences) {
            if (!customAudiences.length) {
                return true;
            }
            return false;
        };

        $scope.deleteCustomAudience = function (audience, id) {
            var d = audience.data,
                ca = d.custom_audiences || [];

            d.custom_audiences = ca.filter(function (act) {
                return act.id && act.id !== id;
            });
        };

        $scope.addCustomAudience = function (audience) {
            if (audience.$caValue) {
                makeIfFalsy(audience.data, 'custom_audiences', []);
                audience.data.custom_audiences.push({
                    'id': audience.$caValue
                });
            }
            delete audience.$caValue;
        };

        $scope.filteredCustomAudiences = function (audience) {
            var ad = audience.data,
                ca = ad.custom_audiences || [];

            ca = ca.map(
                function (act) {
                    return act.id;
                }
            ) || [];

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
                asset.audiences = asset.audiences.filter(function (a) {
                    return !a.new;
                });
                asset.audiences.forEach(function (a) {
                    a.open = 0;
                });
            });
        };

        $scope.create = function (asset) {
            var au = {
                'id': String(Date.now()),
                'new': 1,
                'ad_account': asset.id,
                'name': 'New audience',
                'data': {},
                'meta': {}
            };

            asset.audiences.push(au);

            au.$original = angular.copy(au);
            $scope.open(asset, au);
        };

        $scope.open = function (asset, audience) {
            var willOpen;

            if (audience.open) {
                return false;
            }

            $scope.assets.forEach(function (asset) {
                asset.audiences.isOpen = 0;

                asset.audiences = asset.audiences.filter(function (a) {
                    return !a.new || audience.id === a.id;
                });

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

            promises['au'] = audience.list(
                $scope.sessionId
            ).then(function (a) {
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

            return $q.all(promises).then(function () {
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
        }

        $scope.save = function (aud) {
            var a = angular.copy(aud);

            $scope.viewLoaded = 0;

            delete a.open;

            if (a.new) {
                delete a.new;
                delete a.id;
            }

            a.session_id = $scope.sessionId;

            return audience.save(a).then(function () {
                return init();
            }).then(function () {
                return toast.open({
                    'htmlText': 'Audience saved successfully'
                });
            });
        };

        $scope.queryLocation = function (value) {
            return fb.get([
                '/search?type=adgeolocation&q=',
                value
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                return res.data.filter(function (act) {
                    return [
                        'city',
                        'country',
                        'region',
                        'zip'
                    ].indexOf(act.type) !== -1;
                });
            });
        };

        function getLocations (aud) {
            var loc = aud.data.geo_locations || {},
                cities = loc.cities || [],
                regions = loc.regions || [],
                zips = loc.zips || [],
                countries = loc.countries || [];

            return [].concat(
                cities.map(function (act) {
                    return {
                        'id': act.key,
                        'type': 'city',
                        'name': aud.meta[[
                            'city',
                            act.key
                        ].join('_')]
                    };
                }),
                regions.map(function (act) {
                    return {
                        'id': act.key,
                        'type': 'region',
                        'name': aud.meta[[
                            'region',
                            act.key
                        ].join('_')]
                    };
                }),
                zips.map(function (act) {
                    return {
                        'id': act.key,
                        'type': 'zip',
                        'name': aud.meta[[
                            'zip',
                            act.key
                        ].join('_')]
                    };
                }),
                countries.map(function (act) {
                    return {
                        'id': act,
                        'type': 'country',
                        'name': aud.meta[[
                            'country',
                            act
                        ].join('_')]
                    };
                })
            );
        }

        $scope.addAudienceLocation = function (aud, value) {
            var hash = [value.type, value.key].join('_'),
                arr,
                elem;

            makeIfFalsy(aud.data, 'geo_locations', {});
            makeIfFalsy(aud, 'meta', {});

            if (value.type === 'country') {
                makeIfFalsy(aud.data.geo_locations, 'countries', []);
                arr = aud.data.geo_locations.countries;
                if (arr.indexOf(value.key) === -1) {
                    aud.data.geo_locations.countries.push(value.key);
                    aud.meta[hash] = value.name;
                }
            } else if (value.type === 'region') {
                makeIfFalsy(aud.data.geo_locations, 'regions', []);
                arr = aud.data.geo_locations.regions;
                elem = arr.filter(function (e) {
                    return e.key === value.key;
                })[0];
                if (!elem) {
                    arr.push({
                        'key': value.key
                    });
                    aud.meta[hash] = [
                        value.name,
                        value.country_name
                    ].join(', ');
                }
            } else if (value.type === 'city') {
                makeIfFalsy(aud.data.geo_locations, 'cities', []);
                arr = aud.data.geo_locations.cities;
                elem = arr.filter(function (e) {
                    return e.key === value.key;
                })[0];
                if (!elem) {
                    arr.push({
                        'key': value.key
                    });
                    aud.meta[hash] = [
                        value.name,
                        value.region,
                        value.country_name
                    ].join(', ');
                }
            } else if (value.type === 'zip') {
                makeIfFalsy(aud.data.geo_locations, 'zips', []);
                arr = aud.data.geo_locations.zips;
                elem = arr.filter(function (e) {
                    return e.key === value.key;
                })[0];
                if (!elem) {
                    arr.push({
                        'key': value.key
                    });
                    aud.meta[hash] = [
                        value.name,
                        value.region,
                        value.country_name
                    ].join(', ');
                }
            }

            aud.$loValue = '';
            aud.$locations = getLocations(aud);

            $scope.$apply();
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
