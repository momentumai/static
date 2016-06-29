/*global momentum, angular*/
momentum.directive('codeContainer', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'codeContainer.tpl.html',
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
