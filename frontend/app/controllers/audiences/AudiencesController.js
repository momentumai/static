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
        function getLanguages (aud) {
            var lang = aud.data.locales || [];

            return lang.map(function (act) {
                return {
                    'id': act,
                    'name': aud.meta[[
                        'locale',
                        act
                    ].join('_')]
                };
            });
        }

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

        function getGender (aud) {
            var g = aud.data.genders || [],
                c;

            c = g.join();

            if (c.length === 1) {
                return c;
            }

            return '0';
        }
        function getlocationType (aud) {
            var l = aud.data.geo_locations &&
                aud.data.geo_locations.location_types;

            if (!l || l.indexOf('recent') !== -1 && l.indexOf('home') !== -1) {
                return '1';
            } else if (l.indexOf('travel_in') !== -1) {
                return '4';
            } else if (l.indexOf('recent') !== -1) {
                return '3';
            } else if (l.indexOf('home') !== -1) {
                return '2';
            }
            return '1';
        }

        function getAgeData () {
            var ret = [],
                i = 13;

            for (; i < 66; i += 1) {
                ret.push({
                    'id': i,
                    'name': i === 65 ? '65+' : String(i)
                });
            }

            return ret;
        }

        $scope.ageData = getAgeData();

        $scope.ageMinChange = function (aud) {
            if (aud.$ageMinValue > aud.$ageMaxValue) {
                aud.$ageMaxValue = aud.$ageMinValue;
            }
        };

        $scope.ageMaxChange = function (aud) {
            if (aud.$ageMaxValue < aud.$ageMinValue) {
                aud.$ageMinValue = aud.$ageMaxValue;
            }
        };

        $scope.audienceValidator = function (audience) {
            var d = audience.data,
                len = (d.geo_locations && Object.keys(
                    d.geo_locations
                ).reduce(function (prev, key) {
                    return prev + d.geo_locations[key].length;
                }, 0) || 0) + (
                    d.custom_audiences &&
                    d.custom_audiences.length || 0
                );

            return (!len);
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

        $scope.close = function (aud) {
            aud.name = aud.$original.name;
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
                willOpen.$ageMinValue = willOpen.data.age_min || 18;
                willOpen.$ageMaxValue = willOpen.data.age_max || 65;
                willOpen.$locations = getLocations(willOpen);
                willOpen.$langs = getLanguages(willOpen);
                willOpen.$gnValue = getGender(willOpen);
                willOpen.$loTypeValue = getlocationType(willOpen);
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
            var a = angular.copy(aud),
                genderMap = {
                    '0': [1, 2],
                    '1': [1],
                    '2': [2]
                },
                locationMap = {
                    '1': ['recent', 'home'],
                    '2': ['home'],
                    '3': ['recent'],
                    '4': ['travel_in']
                };

            $scope.viewLoaded = 0;

            delete a.open;

            if (a.new) {
                delete a.new;
                delete a.id;
            }

            a.data.genders = genderMap[aud.$gnValue];
            a.data.age_min = aud.$ageMinValue;
            a.data.age_max = aud.$ageMaxValue;
            a.data.geo_locations = a.data.geo_locations || {};
            a.data.geo_locations.location_types =
                locationMap[aud.$loTypeValue];

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

        $scope.queryLanguage = function (value) {
            return fb.get([
                '/search?type=adlocale&q=',
                value
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                return res.data;
            });
        };

        $scope.addAudienceLanguage = function (aud, value) {
            var hash = ['locale', value.key].join('_'),
                arr;

            makeIfFalsy(aud.data, 'locales', []);
            makeIfFalsy(aud, 'meta', {});

            arr = aud.data.locales;
            if (arr.indexOf(value.key) === -1) {
                aud.data.locales.push(value.key);
                aud.meta[hash] = value.name;
            }

            aud.$langValue = '';
            aud.$langs = getLanguages(aud);

            $scope.$apply();
        };

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

        $scope.deleteLanguage = function (audience, lang) {
            var hash = [
                    'locale',
                    lang.id
                ].join('_'),
                langs = audience.data.locales;

            delete audience.meta[hash];

            audience.data.locales = langs.filter(function (c) {
                return c !== lang.id;
            });

            audience.$langs = getLanguages(audience);
        };

        $scope.deleteLocation = function (audience, location) {
            var hash = [
                    location.type,
                    location.id
                ].join('_'),
                locs = audience.data.geo_locations,
                typeMap = {
                    'region': 'regions',
                    'zip': 'zips',
                    'city': 'cities'
                };

            delete audience.meta[hash];

            if (location.type === 'country') {
                locs.countries = locs.countries.filter(function (c) {
                    return c !== location.id;
                });
            } else {
                locs[typeMap[location.type]] = locs[
                    typeMap[location.type]
                ].filter(function (a) {
                    return a.key !== location.id;
                });
            }

            audience.$locations = getLocations(audience);
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
