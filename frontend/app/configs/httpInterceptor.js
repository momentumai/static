/*global momentum, URI, bvConfig, window */
momentum.config([
    '$provide',
    '$httpProvider',
    function ($provide, $httpProvider) {
        function openErrorDialog (dialog) {
            return dialog.open({
                'template': 'errorDialog.tpl.html',
                'okText': 'Reload',
                'canHide': false
            }).then(function () {
                window.location.reload(true);
            });
        }

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
                            storage;

                        if (response.data.errorMessage) {
                            storage = $injector.get('storage');
                            body = response.data.errorMessage.split(':');
                            status = Number(body[1]);
                            if (status === 401) {
                                storage.clearAuthData();
                                window.location.href = bvConfig.docBase +
                                    '#/auth';
                                throw 'Auth error';
                            }
                        }

                        if (response.data.Type === 'Service') {
                            return openErrorDialog($injector.get('dialog'));
                        }

                        return response;
                    },
                    'responseError': function (response) {
                        var fb = 'https://graph.facebook.com/',
                            exclude = [
                                'dashboard/main',
                                'dashboard/post/list'
                            ],
                            excluded = 0;

                        if (response.config.url.startsWith(fb)) {
                            return response;
                        }

                        excluded = exclude.reduce(function (prev, act) {
                            prev += response.config.url.indexOf(act) === -1 ?
                                0 :
                                1;
                            return prev;
                        }, 0);

                        if (excluded) {
                            return response;
                        }

                        return openErrorDialog($injector.get('dialog'));
                    }
                };
            }
        ]);

        $httpProvider.interceptors.push('httpInterceptor');
    }
]);
