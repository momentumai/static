/*global momentum, angular*/
momentum.directive('inactivate', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'inactivate.tpl.html',
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
