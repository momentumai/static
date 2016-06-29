
/*global momentum, nv, d3, angular*/
momentum.directive('statGraph', [
    'animate',
    function (animate) {
        return {
            'restrict': 'A',
            'templateUrl': 'statGraph.tpl.html',
            'scope': {
                'model': '=ngModel'
            },
            'link': function ($scope, $element) {
                var chart,
                    data,
                    from;

                $scope.model.animate = $scope.model.animate = angular.bind(
                    null,
                    animate.attach,
                    $element
                );

                function addGraph () {
                    nv.addGraph(function () {
                        chart = nv.models.stackedAreaChart();
                        data = $scope.model && $scope.model.data || [];
                        from =  data.from || 0;

                        function dateFormat (d) {
                            var date = new Date(from * 1000 + d * 60000 * 15),
                                hours = date.getHours(),
                                minutes = date.getMinutes();

                            return (hours < 10 ? '0' + hours : hours) +
                                ':' +
                                (minutes < 10 ? '0' + minutes : minutes);
                        }

                        chart.margin({
                            'top': 16,
                            'right': 32,
                            'bottom': 16,
                            'left': 32
                        });

                        chart.useInteractiveGuideline(false);
                        chart.interactive(false);
                        chart.showLegend(true);
                        chart.showYAxis(true);
                        chart.showXAxis(true);
                        chart.height(384);
                        chart.noData('');
                        chart.interpolate('basis');
                        chart.duration(0);
                        chart.legend.margin({'bottom': 8});
                        chart.showControls(false);
                        chart.xAxis.tickFormat(dateFormat);

                        d3.select($element.children()[0])
                                .datum(data)
                                .call(chart);
                    });
                }

                $scope.$watch('model.data', function (values) {
                    if (data && values) {
                        from = values.from;
                        d3.select($element.children()[0]).datum(values);
                        chart.update();
                    } else {
                        addGraph();
                    }
                });

                nv.utils.windowResize(function () { chart.update(); });
            }
        };
    }
]);
