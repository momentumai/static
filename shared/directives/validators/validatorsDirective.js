/*global momentum*/
momentum.directive('validators', [
    function () {
        return {
            'restrict': 'A',
            'scope': {
                'validators': '=validators',
                'item': '=validatorsItem'
            },
            'link': function ($scope, $element) {
                if (!$scope.validators || !$scope.validators.length) {
                    return;
                }

                $scope.$watch('item', function (item) {
                    var i = 0,
                        val;

                    $element[0].setCustomValidity('');
                    for (; i < $scope.validators.length; i += 1) {
                        val = $scope.validators[i];
                        if (val.cond(item)) {
                            $element[0].setCustomValidity(val.message);
                            break;
                        }
                    }
                }, true);
            }
        };
    }
]);
