/*global momentum*/
momentum.directive('selectOnClick', [
    function () {
        return {
            'restrict': 'A',
            'link': function ($scope, $element) {
                $element.bind('click', function () {
                    this.select();
                });
            }
        };
    }
]);
