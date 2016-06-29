/*global momentum*/
momentum.directive('hideOnError', [
    function () {
        return {
            'restrict': 'A',
            'link': function (ignore, $element) {
                $element[0].onerror = function () {
                    $element[0].style.display = 'none';
                };
            }
        };
    }
]);
