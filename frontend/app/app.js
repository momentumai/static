/*global angular, window */
(function () {
    var modules;

    window.bvConfig = JSON.parse('@@bvConfig');

    modules = [
        'ngCookies',
        'ui.router',
        'angularPayments',
        'mdl',
        'angulartics',
        'angulartics.google.analytics'
    ];

    if (window.bvConfig.ga.debug) {
        modules.push('angulartics.debug');
    }

    window.momentum = angular.module('momentum', modules).run([
        'fb',
        function (fb) {
            window.ga(
                'create',
                window.bvConfig.ga.id,
                window.bvConfig.ga.options
            );
            fb.init();
        }
    ]).config(['$analyticsProvider', function ($analyticsProvider) {
        $analyticsProvider.virtualPageviews(true);
        //$analyticsProvider.excludeRoutes(['/abc','/def']);
        $analyticsProvider.trackExceptions(false);
        $analyticsProvider.firstPageview(false);
        $analyticsProvider.withAutoBase(false);
    }]).factory('$exceptionHandler', ['$log', function ($log) {
        return function myExceptionHandler (exception, cause) {
            $log.warn(exception, cause);
        };
    }]);
}());
