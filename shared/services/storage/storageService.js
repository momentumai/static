/*global momentum, CryptoJS, localStorage, window*/
momentum.factory('storage', ['$q', '$cookies',
function ($q, $cookies) {
    var storage = {};

    function get (key) {
        return localStorage[key];
    }

    function getObject (key) {
        var data = null;

        try {
            data = JSON.parse(localStorage[key]);
        } catch (ignore) {
            //ignore
        }

        return data;
    }

    function remove (key) {
        return localStorage.removeItem(key);
    }

    function put (key, value) {
        localStorage[key] = String(value);
    }

    function putObject (key, object) {
        localStorage[key] = JSON.stringify(object);
    }

    storage.storeAuthData = function (sessionId, teams) {
        return $q(function (resolve) {
            put('BVSID', sessionId);
            $cookies.put('BVSID', sessionId);

            if (teams) {
                putObject('BVTEAMS', teams);
                storage.setSelectedTeam(teams[0].id);
            }
            resolve();
        });
    };

    storage.getSessionId = function () {
        return $q(function (resolve) {
            var sid = get('BVSID') || '0';

            resolve(sid);
        });
    };

    storage.clearAuthData = function () {
        $cookies.remove('BVSID');
        remove('BVSID');
        remove('BVUSER');
        remove('BVTEAMS');
        remove('BVSELECTEDTEAM');
        remove('BVFILTERS');
    };

    storage.getUser = function () {
        return $q(function (resolve, reject) {
            var user = getObject('BVUSER');

            if (!user) {
                return reject('storage:401:No user');
            }
            user.md5email = CryptoJS.MD5(user.email).toString();
            user.title = user.is_admin ? 'Administrator' : 'User';
            user.name = user.email;
            resolve(user);
        });
    };

    storage.isExtensionInstalled = function () {
        return $cookies.get('bv_extension');
    };

    storage.getTeams = function () {
        return $q(function (resolve) {
            var teams = getObject('BVTEAMS') || 0;

            resolve(teams);
        });
    };

    storage.getSelectedTeam = function () {
        return $q(function (resolve) {
            var team = getObject('BVSELECTEDTEAM') || 0;

            resolve(team);
        });
    };

    storage.setSelectedTeam = function (team) {
        return $q(function (resolve) {
            putObject('BVSELECTEDTEAM', team);
            resolve();
        });
    };

    storage.getCache = function () {
        return localStorage['cache'] || '0';
    };

    storage.invalidateCache = function () {
        localStorage['cache'] = String(Date.now());
        window.parent.postMessage('invalidateCache', '*');
    };

    storage.getDemo = function () {
        return Number(get('is_demo')) || 0;
    };

    storage.setDemo = function (value) {
        return put('is_demo', value);
    };

    storage.setLoggedUser = function (teamId) {
        $cookies.remove('_momentum_team_id');
        $cookies.put('_momentum_team_id', teamId);
    };
    storage.saveUtmParams = function (params) {
        return $q(function (resolve) {
            put('utmParams', JSON.stringify(params));
            resolve();
        });
    };

    storage.getUtmParams = function () {
        return $q(function (resolve) {
            var params = {};

            try {
                params = JSON.parse(get('utmParams') || '');
            } catch (ignore) {
                //ignore
            }
            resolve(params || {});
        });
    };

    return storage;
}]);
