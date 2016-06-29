/*global momentum, angular*/
momentum.directive('fbInt', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'fbInt.tpl.html',
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
