/*global momentum, URI, btoa */
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

        $provide.factory('httpInterceptor', [
            'redirect',
            '$injector',
            'storage',
            '$q',
            function (redirect, $injector, storage, $q) {
                return {
                    'request': function (request) {
                        var deferred = $q.defer();

                        storage.getCache().then(function (cacheTimestamp) {
                            var cache,
                                uri = URI(request.url);

                            uri.removeQuery('cache');

                            if (request.method === 'POST') {
                                cache = request.data.cache;
                                if (cache) {
                                    cache.push(cacheTimestamp);
                                    uri.addQuery('cache', getCache(cache));
                                    delete request.data.cache;
                                } else {
                                    uri.addQuery('cache', getCache([
                                        String(Date.now())
                                    ]));
                                }
                            }
                            request.url = uri.toString();

                            deferred.resolve(request);
                        });
                        return deferred.promise;
                    },
                    'response': function (response) {
                        var status;

                        if (response.data.errorMessage) {
                            status = Number(
                                response.data.errorMessage.split(':')[1]
                            );
                            if (status === 401) {
                                return storage.clear().then(function () {
                                    return redirect.toAuth();
                                });
                            }
                            //if (status === 405) {
                            //    redirect.toFacebook();
                            //    throw null;
                            //}
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
