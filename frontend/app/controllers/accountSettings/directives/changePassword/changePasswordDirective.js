/*global momentum, angular*/
momentum.directive('changePassword', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'changePassword.tpl.html',
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
