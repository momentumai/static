/*global momentum, angular*/
momentum.directive('experimentCreateSelectPage', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentCreateSelectPage.tpl.html',
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
