/*global momentum, window */
momentum.factory('tab', [
    '$q',
    function ($q) {
        var tab = {};

        tab.getUrl = function () {
            return $q(function (resolve) {
                resolve(
                    decodeURIComponent(
                        window.location.href.split('?')[1]
                    )
                );
            });
        };

        return tab;
    }
]);

