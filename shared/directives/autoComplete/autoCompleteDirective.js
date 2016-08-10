/*global momentum, document, angular */
momentum.directive('autoComplete', [
    '$timeout',
    '$templateCache',
    '$rootScope',
    '$compile',
    function ($timeout, $templateCache, $rootScope, $compile) {
        var $ = angular.element;

        function link ($scope, $element) {
            function recalcPosition (cont, outerDiv) {
                var element = $element[0],
                    pos = element.getBoundingClientRect();

                if ($scope.container) {
                    return;
                }

                cont.style.left = pos.left + 'px';
                /* header height */
                cont.style.top = (pos.bottom - 64 + outerDiv.scrollTop) + 'px';
                cont.style.width = pos.width + 'px';
            }

            function addAndCompile (
                item,
                outerDiv,
                cont,
                template,
                input,
                click,
                self
            ) {
                var scope = angular.extend(
                        $rootScope.$new(true),
                        item
                    ),
                    element = document.createElement('div');

                if ($scope.mouseEnter) {
                    scope.mouseEnter = $scope.mouseEnter.bind(null, item);
                }

                if ($scope.mouseLeave) {
                    scope.mouseLeave = $scope.mouseLeave.bind(null, item);
                }

                scope.mouseLeave = $scope.mouseLeave;

                element.innerHTML = template;

                element.addEventListener('mouseenter', function () {
                    $(element).addClass('selected');
                });

                element.addEventListener('mouseleave', function () {
                    $(element).removeClass('selected');
                });

                element.addEventListener('mousedown', function (e) {
                    e.preventDefault();

                    click(self, item);

                    $timeout(function () {
                        recalcPosition(cont, outerDiv);
                    });
                });

                $(cont).removeClass('empty');
                cont.appendChild(element);

                $compile(element)(scope);
            }

            $timeout(function () {
                var element = $element[0],
                    cont = document.createElement('div'),
                    itemTpl = $templateCache.get($scope.itemTemplate),
                    outerDiv;

                cont.className = $scope.containerClass;

                if (!$scope.container) {
                    outerDiv = document.body.getElementsByTagName('main')[0];
                } else {
                    outerDiv = document.getElementById($scope.container);
                }

                recalcPosition(cont, outerDiv);

                outerDiv.appendChild(cont);

                function valueChange (value, oldValue) {
                    var getter = $scope.getter;

                    if (!value &&
                        oldValue &&
                        typeof $scope.initGetter === 'function'
                    ) {
                        getter = $scope.initGetter;
                    } else if (!value) {
                        cont.innerHTML = '';
                        $(cont).addClass('empty');
                        return;
                    }

                    getter(
                        value,
                        $scope.itemActionSelf
                    ).then(function (res) {
                        var i = 0;

                        cont.innerHTML = '';
                        $(cont).addClass('empty');
                        for (; i < Math.min(10, res.length); i += 1) {
                            addAndCompile(
                                res[i],
                                outerDiv,
                                cont,
                                itemTpl,
                                element,
                                $scope.itemAction,
                                $scope.itemActionSelf
                            );
                        }
                    });
                }
                $scope.$watch('value', valueChange);

                element.addEventListener('focus', function () {
                    recalcPosition(cont, outerDiv);
                    valueChange($scope.value, 'init');
                });

                element.addEventListener('blur', function () {
                    if (!$scope.container) {
                        cont.innerHTML = '';
                        $(cont).addClass('empty');
                    }
                });

                $element.on('$destroy', function () {
                    outerDiv.removeChild(cont);
                });
            });
        }

        return {
            'restrict': 'A',
            'scope': {
                'getter': '=autoComplete',
                'initGetter': '=initQuery',
                'itemTemplate': '@itemTemplate',
                'containerClass': '@containerClass',
                'container': '@container',
                'value': '=ngModel',
                'itemAction': '=itemAction',
                'itemActionSelf': '=itemActionSelf',
                'searchParams': '=itemParams',
                'mouseEnter': '=mouseEnter',
                'mouseLeave': '=mouseLeave'
            },
            'link': link
        };
    }
]);
