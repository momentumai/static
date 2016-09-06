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
                                storage.clearAuthData();
                                return redirect.toAuth();
                            }

                            if (status === 405) {
                                return redirect.toFacebook();
                            }
                        }

                        if (response.data.Type === 'Service') {
                            $injector.get('$state').go('error', {
                                'message': 'An unexpected error occurred. ' +
                                'If the problem continues, contact support. ' +
                                '(info@momentum.ai)'
                            });
                        }

                        return response;
                    },
                    'responseError': function (response) {
                        $injector.get('$state').go('error', {
                            'message': 'An unexpected error occurred. ' +
                            'If the problem continues, contact support. ' +
                            '(info@momentum.ai)'
                        });
                        return response;
                    }
                };
            }
        ]);

        $httpProvider.interceptors.push('httpInterceptor');
    }
]);
