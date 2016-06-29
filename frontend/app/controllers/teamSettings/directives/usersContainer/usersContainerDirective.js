/*global momentum, angular*/
momentum.directive('usersContainer', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'usersContainer.tpl.html',
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
