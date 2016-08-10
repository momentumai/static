/*global momentum, angular */
momentum.controller('AudiencesController', [
    '$q',
    '$scope',
    'audience',
    'dialog',
    'toast',
    'fb',
    function ($q, $scope, audience, dialog, toast, fb) {
        $scope.viewLoaded = 0;

        $scope.assets = null;
        $scope.cache = {};
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

        function getConnections (aud) {
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections', []);

            return aud.meta.connections;
        }

        function getConnectionsFriend (aud) {
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections_friend', []);

            return aud.meta.connections_friend;
        }

        function getConnectionsExclude (aud) {
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections_exclude', []);

            return aud.meta.connections_exclude;
        }

        function getLocations (aud, exclude) {
            var loc = aud.data.geo_locations || {};

            if (exclude) {
                loc = aud.data.excluded_geo_locations || {};
            }

            return Object.keys(loc).reduce(function (prev, act) {
                prev = prev.concat(
                    loc[act].map(function (l) {
                        if (act === 'countries') {
                            return {
                                'id': l,
                                'type': 'countries',
                                'name': aud.meta[['countries', l].join('_')]
                            };
                        }

                        return {
                            'id': l.key,
                            'type': act,
                            'name': aud.meta[[act, l.key].join('_')]
                        };
                    })
                );

                return prev;
            }, []).filter(function (act) {
                return act.type !== 'location_types';
            });
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

        function getFlexibleSpec (aud) {
            var keys,
                result = [];

            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'details', {});

            keys = Object.keys(aud.meta.details).sort();

            keys.forEach(function (index) {
                var det = aud.meta.details[index];

                result.push(
                    Object.keys(det).reduce(function (prev, id) {
                        prev.push({
                            'id': id,
                            'name': det[id].name,
                            'type': det[id].type,
                            'path': det[id].path
                        });
                        return prev;
                    }, [])
                );
            });

            if (!result.length) {
                return [[]];
            }

            return result;
        }

        function getFlexibleSpecEx (aud) {
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'details_ex', {});

            return Object.keys(aud.meta.details_ex).reduce(function (prev, id) {
                prev.push({
                    'id': id,
                    'name': aud.meta.details_ex[id].name,
                    'type': aud.meta.details_ex[id].type,
                    'path': aud.meta.details_ex[id].path
                });
                return prev;
            }, []);
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

        function getLocationFormat (value) {
            var ret = [];

            ret.push(value.country_name);

            if (value.region) {
                ret.unshift(value.region);
            }

            ret.unshift(value.name);

            return ret.join(', ');
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

        $scope.deleteCustomAudience = function (audience, id, exclude) {
            var d = audience.data,
                ca,
                key = exclude ?
                    'excluded_custom_audiences' :
                    'custom_audiences';

            ca = d[key] || [];

            d[key] = ca.filter(function (act) {
                return act.id && act.id !== id;
            });
        };

        $scope.addCustomAudience = function (audience) {
            if (audience.$caValue) {
                makeIfFalsy(audience.data, audience.$custMethod, []);
                audience.data[audience.$custMethod].push({
                    'id': audience.$caValue
                });
            }
            delete audience.$caValue;
            $scope.verify(audience);
        };

        $scope.addCustomAudienceExclude = function (audience) {
            if (audience.$caExcludeValue) {
                makeIfFalsy(audience.data, 'excluded_custom_audiences', []);
                audience.data.excluded_custom_audiences.push({
                    'id': audience.$caExcludeValue
                });
            }
            delete audience.$caExcludeValue;
            $scope.verify(audience);
        };

        $scope.filteredCustomAudiences = function (audience) {
            var ad = audience.data,
                ca = ad.custom_audiences || [],
                cae = ad.excluded_custom_audiences || [],
                arr = ca.concat(cae);

            arr = arr.map(
                function (act) {
                    return act.id;
                }
            ) || [];

            return $scope.customAudiences.filter(function (act) {
                return !act.id || arr.indexOf(act.id) === -1;
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
                willOpen.$locationsEx = getLocations(willOpen, 1);
                willOpen.$locMethod = 'geo_locations';
                willOpen.$flexibleSpec = getFlexibleSpec(willOpen);
                willOpen.$flexibleSpecEx = getFlexibleSpecEx(willOpen);
                if (willOpen.$flexibleSpecEx.length) {
                    willOpen.$excludeOpen = 1;
                }
                willOpen.$langs = getLanguages(willOpen);
                willOpen.$gnValue = getGender(willOpen);
                willOpen.$loTypeValue = getlocationType(willOpen);
                willOpen.$cons = getConnections(willOpen);
                willOpen.$consFriend = getConnectionsFriend(willOpen);
                willOpen.$consExclude = getConnectionsExclude(willOpen);
                willOpen.$custMethod = 'custom_audiences';
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
                        'name': 'Choose an audience'
                    });
                    willOpen.open = 1;
                    asset.audiences.isOpen = 1;
                    $scope.verify(willOpen);
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

        $scope.queryDetail = function (value, self) {
            return fb.get([
                '/',
                self.audience.ad_account,
                '/targetingsearch?q=',
                value
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                return res.data;
            });
        };

        $scope.queryDetailSuggestion = function (ignore, self) {
            return fb.get([
                '/',
                self.audience.ad_account,
                '/targetingsuggestions'
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                return res.data;
            });
        };

        $scope.queryLocation = function (value) {
            var typeMap = {
                'country': 'countries',
                'region': 'regions',
                'city': 'cities',
                'zip': 'zips',
                'custom_location': 'custom_locations',
                'geo_market': 'geo_markets',
                'electoral_district': 'electoral_districts',
                'country_group': 'country_groups'
            };

            return fb.get([
                '/search?type=adgeolocation&q=',
                value
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                return res.data.map(function (act) {
                    act.type = typeMap[act.type];
                    act.display = getLocationFormat(act);
                    return act;
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

        function getPages () {
            if ($scope.cache.pages) {
                return $scope.cache.pages;
            }

            return fb.get(
                '/me/accounts?fields=id,name&is_promotable=true&limit=1000',
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.cache.pages = res.data.map(function (item) {
                    return {
                        'key': item.id,
                        'name': item.name,
                        'type': 'page'
                    };
                });

                return $scope.cache.pages;
            });
        }

        function getApplications () {
            if ($scope.cache.apps) {
                return $scope.cache.apps;
            }

            return fb.get(
                '/me/applications?type=developer&fields=id,name&limit=1000',
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.cache.apps = res.data.map(function (item) {
                    return {
                        'key': item.id,
                        'name': item.name,
                        'type': 'app'
                    };
                });

                return $scope.cache.apps;
            });
        }

        function getGroups () {
            if ($scope.cache.groups) {
                return $scope.cache.groups;
            }

            return fb.get([
                '/me/admined_groups?fields=id,name&limit=1000'
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.cache.groups = res.data.map(function (item) {
                    return {
                        'key': item.id,
                        'name': item.name,
                        'type': 'group'
                    };
                });

                return $scope.cache.groups;
            });
        }

        function getEvents () {
            if ($scope.cache.events) {
                return $scope.cache.events;
            }

            return fb.get([
                '/me/promotable_events?',
                'is_page_event=true&fields=id,name&limit=1000'
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                $scope.cache.events = res.data.map(function (item) {
                    return {
                        'key': item.id,
                        'name': item.name,
                        'type': 'event'
                    };
                });

                return $scope.cache.events;
            });
        }

        $scope.queryConnection = function (value) {
            var promises = [
                getPages(),
                getApplications(),
                getGroups(),
                getEvents()
            ];

            return $q.all(promises).then(function (results) {
                var data =  [].concat.apply([], results),
                    regex = new RegExp(value, 'gi');

                return data.filter(function (item) {
                    return item.name.search(regex) !== -1 || !value;
                });
            });
        };

        $scope.addAudienceDetail = function (self, value, internal) {
            var arr,
                flexSpec,
                flex;

            makeIfFalsy(self.audience.data, 'flexible_spec', []);
            flexSpec = self.audience.data.flexible_spec;

            if (!flexSpec[self.index]) {
                flexSpec.push({});
            }

            flex = flexSpec[self.index];

            makeIfFalsy(flex, value.type, []);
            makeIfFalsy(self.audience, 'meta', {});
            makeIfFalsy(self.audience.meta, 'details', {});
            makeIfFalsy(self.audience.meta.details, self.index, {});

            arr = flex[value.type];
            if (arr.indexOf(value.id) === -1) {
                arr.push(value.id);
                self.audience.meta.details[self.index][value.id] = {
                    'name': value.name,
                    'type': value.type,
                    'path': value.path.slice(0, -1).join('/')
                };
            }

            if (!internal) {
                self.flex.$detValue = '';
                self.audience.$flexibleSpec = getFlexibleSpec(self.audience);
                $scope.$apply();
            }
            $scope.verify(self.audience);
        };

        $scope.addAudienceDetailEx = function (self, value, internal) {
            var ex,
                arr;

            makeIfFalsy(self.audience.data, 'exclusions', {});
            ex = self.audience.data.exclusions;

            makeIfFalsy(ex, value.type, []);
            makeIfFalsy(self.audience, 'meta', {});
            makeIfFalsy(self.audience.meta, 'details_ex', {});

            arr = ex[value.type];

            if (arr.indexOf(value.id) === -1) {
                arr.push(value.id);
                self.audience.meta.details_ex[value.id] = {
                    'name': value.name,
                    'type': value.type,
                    'path': value.path.slice(0, -1).join('/')
                };
            }

            if (!internal) {
                self.audience.$detExValue = '';
                self.audience.$flexibleSpecEx = getFlexibleSpecEx(
                    self.audience
                );
                $scope.$apply();
            }
            $scope.verify(self.audience);
        };

        $scope.deleteDetail = function (audience, det, index) {
            var details = audience.meta.details[index],
                data = audience.data.flexible_spec[index],
                n = Object.keys(audience.meta.details).length,
                i;

            delete details[det.id];

            data[det.type] = data[det.type].filter(function (c) {
                return c !== det.id;
            });

            if (!data[det.type].length) {
                delete data[det.type];
            }

            if (!Object.keys(data).length) {
                audience.data.flexible_spec.splice(index, 1);
                delete audience.meta.details[index];
                for (i = index + 1; i < n; i += 1) {
                    audience.meta.details[i - 1] = audience.meta.details[i];
                }
                delete audience.meta.details[n - 1];
            }

            audience.$flexibleSpec = getFlexibleSpec(audience);
        };

        $scope.deleteDetailEx = function (audience, det) {
            var details = audience.meta.details_ex,
                data = audience.data.exclusions;

            delete details[det.id];

            data[det.type] = data[det.type].filter(function (c) {
                return c !== det.id;
            });

            if (!data[det.type].length) {
                delete data[det.type];
            }

            if (!Object.keys(data).length) {
                delete audience.meta.details_ex;
                audience.$excludeOpen = 0;
            }

            audience.$flexibleSpecEx = getFlexibleSpecEx(audience);
        };

        $scope.addNewDetailGroup = function (aud) {
            aud.meta.details[
                aud.data.flexible_spec.length
            ] = {};

            aud.$flexibleSpec = getFlexibleSpec(aud);
        };

        $scope.addAudienceConnection = function (aud, value) {
            var arr;

            makeIfFalsy(aud.data, 'connections', []);
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections', []);

            arr = aud.data.connections;
            if (arr.indexOf(value.key) === -1) {
                aud.data.connections.push(value.key);
                aud.meta.connections.push({
                    'id': value.key,
                    'name': value.name,
                    'type': value.type
                });
            }

            aud.$conValue = '';
            aud.$cons = getConnections(aud);

            $scope.$apply();
            $scope.verify(aud);
        };

        $scope.addAudienceConnectionFriend = function (aud, value) {
            var arr;

            makeIfFalsy(aud.data, 'friends_of_connections', []);
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections_friend', []);

            arr = aud.data.friends_of_connections;
            if (arr.indexOf(value.key) === -1) {
                aud.data.friends_of_connections.push(value.key);
                aud.meta.connections_friend.push({
                    'id': value.key,
                    'name': value.name,
                    'type': value.type
                });
            }

            aud.$conFriendValue = '';
            aud.$consFriend = getConnectionsFriend(aud);

            $scope.$apply();
            $scope.verify(aud);
        };

        $scope.addAudienceConnectionExclude = function (aud, value) {
            var arr;

            makeIfFalsy(aud.data, 'excluded_connections', []);
            makeIfFalsy(aud, 'meta', {});
            makeIfFalsy(aud.meta, 'connections_exclude', []);

            arr = aud.data.excluded_connections;
            if (arr.indexOf(value.key) === -1) {
                aud.data.excluded_connections.push(value.key);
                aud.meta.connections_exclude.push({
                    'id': value.key,
                    'name': value.name,
                    'type': value.type
                });
            }

            aud.$conExcludeValue = '';
            aud.$consExclude = getConnectionsExclude(aud);

            $scope.$apply();
            $scope.verify(aud);
        };

        $scope.deleteConnection = function (audience, lang) {
            var cons = audience.data.connections,
                meta = audience.meta.connections;

            audience.data.connections = cons.filter(function (act) {
                return act !== lang.id;
            });
            audience.meta.connections = meta.filter(function (act) {
                return act.id !== lang.id;
            });

            audience.$cons = getConnections(audience);
        };

        $scope.deleteConnectionFriend = function (audience, lang) {
            var cons = audience.data.friends_of_connections,
                meta = audience.meta.connections_friend;

            audience.data.friends_of_connections = cons.filter(function (act) {
                return act !== lang.id;
            });
            audience.meta.connections_friend = meta.filter(function (act) {
                return act.id !== lang.id;
            });

            audience.$consFriend = getConnectionsFriend(audience);
        };

        $scope.deleteConnectionExclude = function (audience, lang) {
            var cons = audience.data.excluded_connections,
                meta = audience.meta.connections_exclude;

            audience.data.excluded_connections = cons.filter(function (act) {
                return act !== lang.id;
            });
            audience.meta.connections_exclude = meta.filter(function (act) {
                return act.id !== lang.id;
            });

            audience.$consExclude = getConnectionsExclude(audience);
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
            $scope.verify(aud);
        };

        function checkLocation (aud, id, country) {
            function checkObject (obj) {
                return Object.keys(obj || {}).reduce(function (prev, param) {
                    prev += obj[param].filter(function (act) {
                        if (country) {
                            return act === id;
                        }
                        return act.key === id;
                    }).length;

                    return prev;
                }, 0);
            }

            return checkObject(aud.data.geo_locations) ||
                checkObject(aud.data.excluded_geo_locations);
        }

        $scope.addAudienceLocation = function (aud, value) {
            var hash = [value.type, value.key].join('_'),
                arr,
                elem;

            makeIfFalsy(aud.data, aud.$locMethod, {});
            makeIfFalsy(aud, 'meta', {});

            if (value.type === 'countries') {
                makeIfFalsy(aud.data[aud.$locMethod], 'countries', []);
                arr = aud.data[aud.$locMethod].countries;
                elem = checkLocation(aud, value.key, 1);
                if (arr.indexOf(value.key) === -1) {
                    aud.data[aud.$locMethod].countries.push(value.key);
                    aud.meta[hash] = value.name;
                }
            } else {
                makeIfFalsy(aud.data[aud.$locMethod], value.type, []);
                arr = aud.data[aud.$locMethod][value.type];
                elem = checkLocation(aud, value.key);
                if (!elem) {
                    arr.push({
                        'key': value.key
                    });
                    aud.meta[hash] = getLocationFormat(value);
                }
            }

            aud.$loValue = '';
            aud.$locations = getLocations(aud);
            aud.$locationsEx = getLocations(aud, 1);

            $scope.$apply();
            $scope.verify(aud);
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

        $scope.deleteLocation = function (audience, location, exclude) {
            var hash = [
                    location.type,
                    location.id
                ].join('_'),
                locs = audience.data.geo_locations;

            if (exclude) {
                locs = audience.data.excluded_geo_locations;
            }

            delete audience.meta[hash];

            if (location.type === 'countries') {
                locs.countries = locs.countries.filter(function (c) {
                    return c !== location.id;
                });
            } else {
                locs[location.type] = locs[location.type].filter(function (a) {
                    return a.key !== location.id;
                });
            }

            audience.$locations = getLocations(audience);
            audience.$locationsEx = getLocations(audience, 1);
        };

        function getDetailBrowseModel (aud) {
            var model = {};

            model.audience = aud;

            model.selected = [];

            model.query = function (key) {
                return model.data.filter(function (act) {
                    return act.key !== '__ROOT__' &&
                        act.parent === key;
                });
            };

            model.getChecked = function () {
                return model.data.filter(function (act) {
                    return act.checked;
                }).concat(model.selected);
            };

            model.formatNumber = function (num) {
                var n = Number(num);

                if (!n) {
                    return '?';
                }

                n = String(n);

                return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            };

            model.querySearch = function (value, item) {
                return fb.get([
                    '/',
                    model.audience.ad_account,
                    '/targetingsearch?q=',
                    value,
                    '&limit_type=',
                    item.type
                ].join(''),
                    $scope.user.fb_access_token
                ).then(function (res) {
                    return res.data;
                });
            };

            model.searchMouseEnter = function (item) {
                model.desc = item;
            };

            model.searchMouseLeave = function () {
                model.desc = null;
            };

            model.resetSearch = function () {
                model.desc = null;
                model.search = null;
                model.$searchValue = null;
            };

            model.searchClick = function (self, item) {
                model.$searchValue = null;
                model.desc = null;
                model.selected = model.selected.filter(function (act) {
                    return act.id !== item.id;
                });
                item.path.splice(-1, 1);
                model.selected.push(item);
            };

            model.delete = function (item) {
                item.checked = false;
                model.selected = model.selected.filter(function (act) {
                    return act.id !== item.id;
                });
            };

            return model;
        }

        $scope.openDetailBrowse = function (aud, index) {
            var model = getDetailBrowseModel(aud);

            return fb.get(
                [
                    '/',
                    aud.ad_account,
                    '/targetingbrowse?include_nodes=true'
                ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                model.data = res.data;
                return dialog.open({
                    'template': 'detailBrowserDialog.tpl.html',
                    'model': model,
                    'dialogClass': 'detail-browser',
                    'showCancel': true,
                    'okText': 'Add targets'
                }).then(function () {
                    var checked = model.getChecked();

                    checked.forEach(function (c) {
                        c.path.push(null);
                        $scope.addAudienceDetail({
                            'audience': aud,
                            'index': index
                        }, c, 1);
                    });

                    aud.$flexibleSpec = getFlexibleSpec(aud);
                });
            });
        };

        $scope.openDetailExcludeBrowse = function (aud) {
            var model = getDetailBrowseModel(aud);

            return fb.get(
                [
                    '/',
                    aud.ad_account,
                    '/targetingbrowse?include_nodes=true'
                ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                model.data = res.data;
                return dialog.open({
                    'template': 'detailBrowserDialog.tpl.html',
                    'model': model,
                    'dialogClass': 'detail-browser',
                    'showCancel': true,
                    'okText': 'Add targets'
                }).then(function () {
                    var checked = model.getChecked();

                    checked.forEach(function (c) {
                        c.path.push(null);
                        $scope.addAudienceDetailEx({
                            'audience': aud
                        }, c, 1);
                    });

                    aud.$flexibleSpecEx = getFlexibleSpecEx(aud);
                });
            });
        };

        $scope.verify = function (aud) {
            return fb.get([
                '/',
                aud.ad_account,
                '/reachestimate?optimize_for=LINK_CLICKS&targeting_spec=',
                JSON.stringify(aud.data)
            ].join(''),
                $scope.user.fb_access_token
            ).then(function (res) {
                aud.info = res.data;
                delete aud.error;
            }).catch(function (err) {
                aud.error = err;
                delete aud.info;
            });
        };

        if ($scope.loaded) {
            init();
        } else {
            $scope.$on('loaded', init);
        }
    }
]);
