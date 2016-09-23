/*global momentum, angular*/
momentum.directive('experimentCreatePreviewList', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'experimentCreatePreviewList.tpl.html',
            'scope': {
                'model': '=ngModel',
                'pageData': '=pageData'
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
