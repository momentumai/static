/*global momentum, angular*/
momentum.directive('experimentList', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentList.tpl.html',
            'scope': {
                'model': '=ngModel',
                'next': '=ngNext',
                'prev': '=ngPrev',
                'toggle': '=ngToggle',
                'edit': '=ngEdit'
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
