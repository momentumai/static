/*global momentum*/
momentum.directive('notification', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'notification.tpl.html',
            'scope': {
                'model': '=ngModel'
            }
        };
    }
]);
