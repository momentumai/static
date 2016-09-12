/*global momentum, angular*/
momentum.directive('blacklist', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'blacklist.tpl.html',
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
