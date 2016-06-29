/*global momentum, angular*/
momentum.directive('addUser', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'addUser.tpl.html',
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
