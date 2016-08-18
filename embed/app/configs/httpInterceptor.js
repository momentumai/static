/*global momentum */
momentum.config([
    '$provide',
    '$httpProvider',
    function ($provide, $httpProvider) {
        $provide.factory('httpInterceptor', [
            'redirect',
            '$injector',
            'storage',
            '$q',
            function (redirect, $injector, storage) {
                return {
                    'response': function (response) {
                        var status;

                        if (response.data.errorMessage) {
                            status = Number(
                                response.data.errorMessage.split(':')[1]
                            );
                            if (status === 401) {
                                return storage.clearAuthData()
                                .then(function () {
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
