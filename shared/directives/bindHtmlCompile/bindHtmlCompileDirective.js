/*global momentum*/
momentum.directive('bindHtmlCompile', [
    '$compile',
    function ($compile) {
        return {
            'restrict': 'A',
            'link': function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
                    var compileScope = scope;

                    element.html(value && value.toString());

                    if (attrs.bindHtmlScope) {
                        compileScope = scope.$eval(attrs.bindHtmlScope);
                    }

                    $compile(element.contents())(compileScope);
                });
            }
        };
    }
]);
