/*global momentum, window, document, bvConfig, FB*/
momentum.factory('fb', [
    '$q',
    '$http',
    function ($q, $http) {
        var fb = {};

        function updateQueryString (uri, key, value) {
            var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i'),
                separator = uri.indexOf('?') !== -1 ? '&' : '?';

            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + '=' + value + '$2');
            }
            return uri + separator + key + '=' + value;
        }

        fb.init = function () {
            window.fbAsyncInit = function () {
                FB.init({
                    'appId': bvConfig.facebook.appId,
                    'xfbml': true,
                    'version': 'v2.5'
                });
            };

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];

                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s); js.id = id;
                js.src = 'https://connect.facebook.net/en_US/sdk.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };

        fb.get = function (endpoint, token) {
            var url = [
                bvConfig.facebookEndpoint,
                endpoint
            ].join('');

            url = updateQueryString(url, 'access_token', token);

            return $http.get(url).then(function (resp) {
                if (resp.data.error) {
                    throw resp.data.error;
                }
                return resp.data;
            });
        };

        fb.post = function (endpoint, params, token) {
            var url = [
                bvConfig.facebookEndpoint,
                endpoint
            ].join('');

            url = updateQueryString(url, 'access_token', token);

            return $http.post(url, params).then(function (resp) {
                if (resp.data.error) {
                    throw resp.data.error;
                }
                return resp.data;
            });
        };

        fb.token = function (sessionId, accessToken) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/token'
            ].join(''), {
                'session_id': sessionId,
                'access_token': accessToken
            });
        };

        fb.login = function () {
            return $q(function (resolve) {
                FB.login(function (response) {
                    resolve(response.authResponse.accessToken || '');
                }, {
                    'scope': bvConfig.facebook.scope.join(', '),
                    'auth_type': 'rerequest'
                });
            });
        };

        fb.share = function (url) {
            var src = 'https://www.facebook.com/v2.5/dialog/share?' +
                'app_id=' +
                bvConfig.facebook.appId +
                '&display=popup' +
                '&href=' +
                encodeURIComponent(url),
                width = 575,
                height = 240,
                winTop = (window.screen.height / 2) - (height / 2),
                winLeft = (window.screen.width / 2) - (width / 2),
                paramString = 'top=' +
                    winTop +
                    ',left=' +
                    winLeft +
                    ',toolbar=0,status=0,width=' +
                    width +
                    ',height=' +
                    height;

            window.open(src, 'sharer', paramString);
        };

        fb.connected = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/token/get'
            ].join(''), {
                'session_id': sessionId
            }).then(function (response) {
                return response.data || 'invalid';
            });
        };

        fb.isAutomatable = function (sessionId, contentId) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/autoschedule'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId
            }).then(function (resp) {
                return resp.data;
            });
        };

        function toShortDate (timestamp) {
            var date = new Date(timestamp * 1000),
                months = [
                    'Jan.',
                    'Feb.',
                    'Mar.',
                    'Apr.',
                    'May',
                    'June',
                    'July',
                    'Aug.',
                    'Sept.',
                    'Oct.',
                    'Nov.',
                    'Dec.'
                ];

            return [
                date.getUTCDate(),
                months[date.getUTCMonth()]
            ].join(' ');
        }

        function getK (number) {
            if (number > 1000) {
                return Math.round(number / 1000) + 'k';
            }
            return String(Math.round(number));
        }

        function round (number) {
            var num = Number(number) || 0;

            if (num < 1) {
                return num.toPrecision(2);
            }

            return num.toPrecision(3);
        }

        fb.getCampaigns = function (sessionId, contentId, limit, offset) {
            var params = {
                'session_id': sessionId
            };

            if (Number(limit)) {
                params.limit = Number(limit);
            }

            if (Number(offset)) {
                params.offset = Number(offset);
            }

            if (contentId) {
                params.content_id = contentId;
            }

            params.cache = [
                sessionId,
                limit || 5,
                offset || 0,
                contentId || 0
            ];

            return $http.post([
                bvConfig.endpoint,
                'promotion/campaign/list'
            ].join(''), params).then(function (resp) {
                var campaigns = resp.data;

                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }

                campaigns.data.forEach(function (campaign) {
                    campaign.from = toShortDate(campaign.from);
                    campaign.to = toShortDate(campaign.to);
                    campaign.conversion = getK(campaign.conversion);
                    campaign.click = getK(campaign.click);
                    if (campaign.landing < 0) {
                        campaign.landing = 'N/A';
                    } else {
                        campaign.landing = round(campaign.landing);
                    }
                    if (campaign.lift > 10) {
                        campaign.lift = getK(campaign.lift);
                    } else {
                        campaign.lift = round(campaign.lift);
                    }
                });

                return resp.data;
            });
        };

        fb.disableCampaign = function (sessionId, campaignId) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/disable'
            ].join(''), {
                'session_id': sessionId,
                'campaign_id': Number(campaignId)
            }).then(function (resp) {
                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }
            });
        };

        fb.cloneCampaign = function (sessionId, campaignId) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/clone'
            ].join(''), {
                'session_id': sessionId,
                'campaign_id': Number(campaignId)
            }).then(function (resp) {
                if (resp.data.errorMessage) {
                    throw resp.data.errorMessage.split(':')[2];
                }
            });
        };

        fb.getContentOgData = function (sessionId, contentId) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/ogdata'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId,
                'cache': [
                    sessionId,
                    contentId
                ]
            }).then(function (resp) {
                return resp.data;
            });
        };

        fb.audiences = function (sessionId, adAccount) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/audience/list'
            ].join(''), {
                'session_id': sessionId,
                'ad_account': String(adAccount)
            }).then(function (res) {
                var data = res.data,
                    ret = {
                        'label': 'Audiences',
                        'data': [],
                        'selected': null
                    };

                if (data.errorMessage) {
                    throw data.errorMessage.split(':')[2];
                }

                Object.keys(data).forEach(function (id) {
                    if (!ret.selected) {
                        ret.selected = id;
                    }
                    ret.data.push({
                        'id': id,
                        'label': data[id]
                    });
                });

                return ret;
            });
        };

        fb.currency = function (sessionId, adAccount) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/currency'
            ].join(''), {
                'session_id': sessionId,
                'ad_account': String(adAccount),
                'cache': [
                    sessionId,
                    adAccount
                ]
            }).then(function (res) {
                return res.data;
            });
        };

        fb.saveSelectedAccount = function (sessionId, accountId) {
            return $http.post([
                bvConfig.endpoint,
                'auth/team/user/data/set'
            ].join(''), {
                'session_id': sessionId,
                'key': 'fb_ads_account_id',
                'value': accountId || ''
            });
        };

        fb.preview = function (sessionId, contentId, settings) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/post/preview'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId,
                'settings': settings
            }).then(function (res) {
                var ret = {},
                    data = res.data;

                if (data.errorMessage) {
                    throw data.errorMessage.split(':')[2];
                }

                ret.preview = data.preview;
                ret.creative_id = data.creative_id;
                ret.campaign = data.campaign;

                return ret;
            });
        };

        fb.createPromotion = function (sessionId, contentId, settings) {
            return $http.post([
                bvConfig.endpoint,
                'promotion/create'
            ].join(''), {
                'session_id': sessionId,
                'content_id': contentId,
                'settings': settings
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        fb.listFbAssets = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/query/asset/list'
            ].join(''), {
                'session_id': sessionId
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        fb.listAssets = function (sessionId) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/asset/get'
            ].join(''), {
                'session_id': sessionId
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        fb.importAssets = function (sessionId, businessId) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/asset/import'
            ].join(''), {
                'session_id': sessionId,
                'business_id': businessId
            }).then(function () {
                return {};
            });
        };

        fb.saveAssets = function (sessionId, assets) {
            return $http.post([
                bvConfig.endpoint,
                'facebook/asset/save'
            ].join(''), {
                'session_id': sessionId,
                'manual': {
                    'values': assets
                }
            }).then(function (res) {
                if (res.data.errorMessage) {
                    throw res.data.errorMessage.split(':')[2];
                }
                return res.data;
            });
        };

        fb.export = function (sessionId, year, month, contentId) {
            var params = {
                'session_id': sessionId,
                'year': Number(year),
                'month': Number(month)
            };

            params.cache = [
                sessionId,
                year,
                month
            ];

            if (contentId) {
                params['content_id'] = contentId;
                params.cache.push(contentId);
            }

            return $http.post([
                bvConfig.endpoint,
                'promotion/campaign/export'
            ].join(''), params).then(function (res) {
                return res.data;
            });
        };

        return fb;
    }
]);
