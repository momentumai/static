/*global momentum, angular*/
momentum.directive('experimentCreateAddText', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentCreateAddText.tpl.html',
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
