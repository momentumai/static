/*global momentum, angular*/
momentum.directive('experimentCreateAddImage', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentCreateAddImage.tpl.html',
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
