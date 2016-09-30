/*global momentum, angular*/
momentum.directive('testAside', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'testAside.tpl.html',
            'scope': {
                'model': '=ngModel',
                'activeTest': '=ngActiveTest'
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
