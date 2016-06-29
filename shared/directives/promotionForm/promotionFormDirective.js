/*global momentum*/
momentum.directive('promotionForm', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'promotionForm.tpl.html',
            'scope': {
                'model': '=ngModel'
            }
        };
    }
]);
