/*global momentum, angular*/
momentum.directive('switchTeam', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'switchTeam.tpl.html',
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
