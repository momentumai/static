/*global momentum, angular*/
momentum.directive('notifCont', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'notifCont.tpl.html',
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
