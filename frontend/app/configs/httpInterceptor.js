/*global momentum, URI, btoa, bvConfig */
momentum.config([
    '$provide',
    '$httpProvider',
    function ($provide, $httpProvider) {
        function b64 (str) {
            return btoa(
                escape(encodeURIComponent(str))
            );
        }

        function getCache (params) {
            return b64(params.join('-'));
        }

        $provide.factory('httpInterceptor', ['$injector', '$q',
            function ($injector) {
                return {
                    'request': function (request) {
                        var cache,
                            storage = $injector.get('storage'),
                            demo = $injector.get('demo'),
                            uri = URI(request.url),
                            demoObj = {};

                        uri.removeQuery('cache');

                        if (request.method === 'POST') {
                            if (storage.getDemo() &&
                                demo.isContain(uri.toString())
                            ) {
                                demoObj.url = request.url.replace(
                                    bvConfig.endpoint,
                                    ''
                                );
                                demoObj.state = demo.getState();
                                demoObj.data = request.data;
                                request.data = demoObj;
                                request.url = [
                                    bvConfig.endpoint,
                                    'demo'
                                ].join('');

                                demo.setState(demoObj.url);
                                return request;
                            }

                            cache = request.data.cache;
                            if (cache) {
                                cache.push(storage.getCache());
                                uri.addQuery('cache', getCache(cache));
                                delete request.data.cache;
                            } else {
                                uri.addQuery('cache', getCache([
                                    String(Date.now())
                                ]));
                            }
                        }

                        request.url = uri.toString();

                        return request;
                    },
                    'response': function (response) {
                        var body,
                            status,
                            storage,
                            //message,
                            state = $injector.get('$state');

                        if (response.data.errorMessage) {
                            storage = $injector.get('storage');
                            storage.invalidateCache();
                            body = response.data.errorMessage.split(':');
                            status = Number(body[1]);
                            //message = body[2];
                            if (status === 401) {
                                state.go('auth');
                            }
                            /*if (status === 405 &&
                                !state.is('root.facebook')
                            ) {
                                state.go(
                                    'root.facebook',
                                    {
                                        'message': message
                                    }
                                );
                                throw null;
                            }*/
                        }

                        if (response.data.Type === 'Service') {
                            return $injector.get('$http')(response.config);
                        }

                        return response;
                    },
                    'responseError': function (response) {
                        return $injector.get('$http')(response.config);
                    }
                };
            }
        ]);

        $httpProvider.interceptors.push('httpInterceptor');
    }
]);
