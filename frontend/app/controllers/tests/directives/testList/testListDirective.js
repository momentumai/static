/*global momentum, angular*/
momentum.directive('testList', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'testList.tpl.html',
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
