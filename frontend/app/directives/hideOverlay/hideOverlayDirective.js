/*global momentum, angular, document */
momentum.directive('hideOverlay', [
    function () {
        return {
            'restrict': 'A',
            'link': function (ignore, $element) {
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

                $element[0].addEventListener('click', function () {
                    var elements = getElements();

                    elements.menu.removeClass('is-visible');
                    elements.overlay.removeClass('is-visible');
                }, false);
            }
        };
    }
]);
