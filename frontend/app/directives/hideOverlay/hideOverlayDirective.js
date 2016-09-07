/*global momentum, angular, document */
momentum.directive('hideOverlay', [
    function () {
        return {
            'restrict': 'A',
            'scope': {
                'prevent': '=hideOverlay'
            },
            'link': function (scope, $element) {
                function getElements () {
                    return {
                        'menu': angular.element(
                            document.getElementById('main-menu')
                        ),
                        'overlay': angular.element(
                            document.getElementsByClassName(
                                'mdl-layout__obfuscator'
                            )[0]
                        )
                    };
                }

                function click () {
                    var elements = getElements();

                    elements.menu.removeClass('is-visible');
                    elements.overlay.removeClass('is-visible');
                }

                scope.$watch('prevent', function (p) {
                    if (!p) {
                        $element[0].addEventListener('click', click, false);
                    } else {
                        $element[0].removeEventListener('click', click);
                    }
                });
            }
        };
    }
]);
