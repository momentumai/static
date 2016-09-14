/*global momentum, angular*/
momentum.directive('experimentAside', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentAside.tpl.html',
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
