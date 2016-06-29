/*global momentum, angular*/
momentum.directive('facebookConnected', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'facebookConnected.tpl.html',
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
