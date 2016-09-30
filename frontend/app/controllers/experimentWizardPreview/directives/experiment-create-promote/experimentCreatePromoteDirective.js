/*global momentum, angular*/
momentum.directive('experimentCreatePromote', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentCreatePromote.tpl.html',
            'scope': {
                'model': '=ngModel',
                'list': '=ngListModel'
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
