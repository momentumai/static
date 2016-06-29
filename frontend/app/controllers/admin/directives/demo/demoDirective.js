/*global momentum, angular*/
momentum.directive('demo', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'demo.tpl.html',
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
