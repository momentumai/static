/*global momentum */
momentum.factory('animate', [
    function () {
        var animate = {};

        animate.attach = function (element) {
            var offset = element[0].offsetLeft + element[0].offsetTop,
                delay = Math.floor(offset  * 0.1318);

            element.addClass('start');
            element.addClass('delay-' + delay);
        };

        return animate;
    }
]);
