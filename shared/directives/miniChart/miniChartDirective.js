
/*global momentum, nv, d3*/
momentum.directive('miniChart', [
    function () {
        return {
            'restrict': 'A',
            'templateUrl': 'miniChart.tpl.html',
            'scope': {
                'model': '=ngModel',
                'color': '@'
            },
            'link': function ($scope, $element) {
                var chart,
                    data;

                function addGraph () {
                    nv.addGraph(function () {
                        chart = nv.models.lineChart();
                        data = [{
                            'key': 'Line 1',
                            'color': $scope.color || '#FFF',
                            'values': $scope.model || []
                        }];

                        chart.margin({
                            'top': 0,
                            'right': 0,
                            'bottom': 0,
                            'left': 0
                        });

                        chart.showLegend(false);
                        chart.showYAxis(false);
                        chart.showXAxis(false);
                        chart.noData('');
                        chart.interpolate('basis');
                        chart.interactive(false);
                        chart.duration(0);

                        d3.select($element.children()[0])
                                .datum(data)
                                .call(chart);
                    });
                }

                $scope.$watch('model', function (values) {
                    if (data && chart) {
                        data[0].values = values;
                        d3.select($element.children()[0]).datum(data);
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
