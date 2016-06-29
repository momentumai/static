/*global momentum, angular*/
momentum.directive('videoContainer', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'videoContainer.tpl.html',
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
