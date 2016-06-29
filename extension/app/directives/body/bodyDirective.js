/*global momentum, angular, document*/
momentum.directive('body', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'body.tpl.html',
            'link': function () {
                var root = document.getElementById('document-root'),
                    focusHandler = angular.bind(root, root.focus),
                    traps;

                traps = document
                    .getElementsByClassName('momentum-focus-trap');

                traps[0].addEventListener('focus', focusHandler);
                traps[1].addEventListener('focus', focusHandler);

                root.focus();
            }
        };
    }
]);
