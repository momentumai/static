/*global momentum, angular*/
momentum.directive('paymentContainer', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'paymentContainer.tpl.html',
            'scope': {
                'model': '=ngModel',
                'user': '=ngUser'
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
