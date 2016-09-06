/*global momentum, window*/
momentum.directive('dropdown', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'dropdown.tpl.html',
            'scope': {
                'model': '=ngModel',
                'storageKey': '@storageKey'
            },
            'link': function (scope) {
                if (scope.storageKey) {
                    scope.$watch('model.data', function (newValue) {
                        var sValue;

                        if (newValue && newValue.length) {
                            sValue = window.localStorage.getItem(
                                'BV_' + scope.storageKey
                            );
                            if (newValue.filter(function (act) {
                                return act.id === sValue;
                            })[0]) {
                                scope.model.selected = sValue;
                                scope.model.change && scope.model.change();
                            }
                        }
                    });
                    scope.$watch('model.selected', function (newValue) {
                        if (newValue) {
                            window.localStorage.setItem(
                                'BV_' + scope.storageKey,
                                newValue
                            );
                        }
                    });
                }
            }
        };
    }
]);
