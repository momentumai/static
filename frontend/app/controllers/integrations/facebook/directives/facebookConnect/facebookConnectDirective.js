/*global momentum, angular*/
momentum.directive('facebookConnect', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'facebookConnect.tpl.html',
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
