/*global momentum, angular*/
momentum.directive('payment', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'payment.tpl.html',
            'scope': {
                'model': '=ngModel'
            },
            'link': function ($scope, $element) {
                $scope.model.animate = angular.bind(
                    null,
                    animate.attach,
                    $element
                );
            }
        };
    }
]);
