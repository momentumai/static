/*global momentum, angular*/
momentum.directive('sourceStat', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'sourceStat.tpl.html',
            'scope': {
                'model': '=ngModel',
                'switchState': '=ngState',
                'switchPage': '=ngPage'
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
