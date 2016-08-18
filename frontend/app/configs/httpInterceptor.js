/*global momentum, URI, bvConfig, window */
momentum.config([
    '$provide',
    '$httpProvider',
    function ($provide, $httpProvider) {
        $provide.factory('httpInterceptor', ['$injector', '$q',
            function ($injector) {
                return {
                    'request': function (request) {
                        var storage = $injector.get('storage'),
                            demo = $injector.get('demo'),
                            uri = URI(request.url),
                            demoObj = {};

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
                        }

                        request.url = uri.toString();

                        return request;
                    },
                    'response': function (response) {
                        var body,
                            status,
                            storage,
                            state = $injector.get('$state');

                        if (response.data.errorMessage) {
                            storage = $injector.get('storage');
                            storage.invalidateCache();
                            body = response.data.errorMessage.split(':');
                            status = Number(body[1]);
                            if (status === 401) {
                                storage.clearAuthData().then(function () {
                                    state.go('auth');
                                    window.location.reload(true);
                                });
                            }
                        }

                        if (response.data.Type === 'Service') {
                            return $injector.get('$http')(response.config);
                        }

                        return response;
                    },
                    'responseError': function (response) {
                        var fb = 'https://graph.facebook.com/';

                        if (response.config.url.startsWith(fb)) {
                            return response;
                        }
                        return $injector.get('$http')(response.config);
                    }
                };
            }
        ]);

        $httpProvider.interceptors.push('httpInterceptor');
    }
]);
