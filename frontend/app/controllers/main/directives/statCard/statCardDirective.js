/*global momentum, angular*/
momentum.directive('statCard', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'statCard.tpl.html',
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
