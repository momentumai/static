/*global window, momentum, bvConfig*/
momentum.factory('redirect', [
    function () {
        var redirect = {};

        function redirectTo (url) {
            window.parent.postMessage([
                'redirect',
                url
            ].join('~'), '*');
        }

        redirect.toAuth = function () {
            var url = [
                bvConfig.docBase,
                '/#/dashboard'
            ].join('');

            redirectTo(url);
        };

        redirect.toFacebook = function () {
            var url = [
                bvConfig.docBase,
                '/#/dashboard/settings/account'
            ].join('');

            redirectTo(url);
        };

        redirect.toBilling = function () {
            var url = [
                bvConfig.docBase,
                '/#/dashboard/billing'
            ].join('');

            redirectTo(url);
        };

        return redirect;
    }
]);

