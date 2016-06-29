/*global momentum, chrome*/
momentum.factory('storage', ['$q', function ($q) {
    var storage = {},
        csl = chrome.storage.local;

    storage.storeSessionId = function (sessionId) {
        return $q(function (resolve) {
            csl.set({'BVSID': sessionId}, function () {
                resolve();
            });
        });
    };

    storage.clear = function () {
        return $q(function (resolve) {
            csl.clear(function () {
                resolve();
            });
        });
    };

    storage.getSessionId = function () {
        return $q(function (resolve) {
            csl.get('BVSID', function (res) {
                resolve(res.BVSID || '0');
            });
        });
    };

    storage.getNotifStatus = function () {
        return $q(function (resolve) {
            csl.get('disableNotifs', function (res) {
                resolve(res.disableNotifs || 0);
            });
        });
    };

    storage.changeNotifStatus = function (status) {
        return $q(function (resolve) {
            csl.set({'disableNotifs': status}, function () {
                resolve();
            });
        });
    };

    storage.saveUtmParams = function (params) {
        return $q(function (resolve) {
            csl.set({'utmParams': params}, function () {
                resolve();
            });
        });
    };

    storage.getUtmParams = function () {
        return $q(function (resolve) {
            csl.get('utmParams', function (res) {
                resolve(res.utmParams || {});
            });
        });
    };

    storage.getCache = function () {
        return $q(function (resolve) {
            csl.get('BVCACHE', function (res) {
                resolve(res.BVCACHE || '0');
            });
        });
    };

    return storage;
}]);
