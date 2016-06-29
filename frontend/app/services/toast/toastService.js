/*global momentum, angular, document */
momentum.factory('toast', [
    '$timeout',
    '$q',
    '$rootScope',
    '$templateCache',
    '$compile',
    function (
        $timeout,
        $q,
        $rootScope,
        $templateCache,
        $compile) {
        var toast = {},
            defaultArgs = {
                'template': '',
                'htmlText': 'Success!',
                'model': {},
                'okText': 'Ok'
            },
            toastTimeout,
            toastFade,
            scope;

        toast.open = function (args) {
            return $q(function (resolve) {
                var toast = document.getElementById('toast'),
                    toastTemplate = $templateCache.get('toast.tpl.html');

                function destroy () {
                    var toast = document.getElementById('toast');

                    if (toast) {
                        toast.parentNode.removeChild(toast);
                    }
                    scope.$destroy();
                }

                if (toast) {
                    toast.parentNode.removeChild(toast);
                }

                if (toastTimeout) {
                    $timeout.cancel(toastTimeout);
                }

                if (toastFade) {
                    $timeout.cancel(toastFade);
                }

                if (scope) {
                    scope.$destroy();
                }

                scope = angular.extend(
                    $rootScope.$new(true),
                    defaultArgs,
                    args
                );

                if (scope.template) {
                    scope.htmlText = $templateCache.get(scope.template);
                }

                document.body.insertAdjacentHTML('afterbegin', toastTemplate);

                toast = document.getElementById('toast');

                scope.rendered = scope.htmlText;

                scope.submit = function () {
                    angular.element(toast).addClass('fade');
                    toastFade = $timeout(function () {
                        destroy();
                    }, 400);
                    resolve(true);
                };

                toastFade = $timeout(function () {
                    angular.element(toast).addClass('fade');
                }, 5600);

                toastTimeout = $timeout(function () {
                    destroy();
                    resolve();
                }, 6000);

                $compile(toast)(scope);
            });
        };

        return toast;
    }
]);
