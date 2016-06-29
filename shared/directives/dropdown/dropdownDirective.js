/*global momentum*/
momentum.directive('dropdown', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'dropdown.tpl.html',
            'scope': {
                'model': '=ngModel'
            },
            'link': function () {
            }
        };
    }
]);
