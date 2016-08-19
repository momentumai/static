/*global momentum, angular*/
momentum.directive('campaigns', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'campaigns.tpl.html',
            'scope': {
                'model': '=ngModel',
                'next': '=ngNext',
                'prev': '=ngPrev',
                'toggle': '=ngToggle',
                'export': '=ngExport',
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
