/* global chrome, URI, $, Promise */

var YEAR_IN_SECONDS = 31536000,
    bvConfig = JSON.parse('@@bvConfig'),
    storage = chrome.storage.local,
    bvStorage = {
        'get': function (key) {
            return new Promise(function (resolve) {
                storage.get(key, function (res) {
                    resolve(res[key]);
                });
            });
        },
        'set': function (key, val) {
            var v = {};

            v[key] = val;
            return new Promise(function (resolve) {
                storage.set(v, function () {
                    resolve(val);
                });
            });
        }
    };

function sendCookie (name, value, uri, localhost) {
    return new Promise(function (resolve) {
        chrome.cookies.set({
            'url': [uri.protocol(), '://', uri.host(), '/'].join(''),
            'name': name,
            'value': String(value),
            'domain': localhost ? null : uri.host(),
            'expirationDate': Math.floor(
                new Date().getTime() / 1000
            ) + YEAR_IN_SECONDS
        }, function () {
            resolve({
                'args': arguments
            });
        });
    }).catch(function () {
        return Promise.resolve();
    });
}

function getAlerts (context) {
    var params;

    params = {
        'session_id': context.sId,
        'time': Number(context.lastAlert)
    };

    return new Promise(function (resolve) {
        $.ajax({
            'type': 'POST',
            'contentType': 'application/json; charset=utf-8',
            'url': bvConfig.endpoint + 'alert/list',
            'data': JSON.stringify(params),
            'dataType': 'json',
            'success': function (notifs) {
                return resolve(notifs);
            },
            'fail': function () {
                return resolve([]);
            }
        });
    });
}

function sendNotification (cId) {
    return new Promise(function (resolve) {
        chrome.notifications.create(
            null,
            {
                'type': 'basic',
                'iconUrl': 'icon64.png',
                'title': 'Momentum',
                'message': [
                    'Your content is now recommended for promotion. ',
                    'Click here to review.'
                ].join(''),
                'isClickable': true
            },
            function (notifId) {
                return bvStorage.get('notifs').then(function (notifs) {
                    notifs = notifs || {};
                    notifs[notifId] = cId;
                    return bvStorage.set('notifs', notifs);
                }).then(resolve);
            }
        );
    });
}

function getUser (sessionId) {
    return new Promise(function (resolve) {
        $.ajax({
            'type': 'POST',
            'contentType': 'application/json; charset=utf-8',
            'url': bvConfig.endpoint + 'auth/user',
            'data': JSON.stringify({
                'session_id': sessionId
            }),
            'dataType': 'json',
            'success': function (user) {
                return resolve(user || null);
            },
            'fail': function () {
                return resolve(null);
            }
        });
    }).then(function (bvUser) {
        return bvStorage.set('BVUSER', bvUser);
    });
}

function tabStateChange (tabId) {
    function injectCookie (url) {
        var local = {},
            uri,
            localhost,
            promise = Promise.resolve();

        uri = URI(url);
        localhost = url.indexOf('localhost') !== -1;

        if (!url.indexOf(bvConfig.docBase)) {
            promise = sendCookie('bv_extension', '1', uri, localhost);
        }

        return promise.then(function () {
            return bvStorage.get('BVSID');
        }).then(function (sId) {
            if (!sId) {
                throw 'No sessionId.';
            }
            local.sessionId = sId;
            return bvStorage.get('BVUSER');
        }).then(function (bvUser) {
            if (!bvUser || !bvUser.team_id) {
                return getUser(local.sessionId);
            }
            return bvUser;
        }).then(function (bvUser) {
            if (!bvUser) {
                throw 'Invalid session.';
            }
            local.bvUser = bvUser;
            if (local.bvUser) {
                return sendCookie(
                    'bv_user',
                    local.bvUser.team_id,
                    uri,
                    localhost
                );
            }
        });
    }

    chrome.tabs.get(tabId, function (tab) {
        if (tab.url) {
            injectCookie(tab.url);
        }
    });
}

function getNotifications () {
    var local = {};

    bvStorage.get('BVSID').then(function (sId) {
        local.sId = sId;
        return bvStorage.get('lastAlert');
    }).then(function (lastAlert) {
        local.lastAlert = lastAlert || 0;
        return bvStorage.get('disableNotifs');
    }).then(function (disableNotifs) {
        local.disableNotifs = disableNotifs || 0;

        if (local.sId) {
            return getAlerts(local);
        }
        return [];
    }).then(function (alert) {
        if (alert && alert.last) {
            local.alertLast = alert.last;
            if (!local.disableNotifs) {
                return sendNotification(alert.cId);
            }
        }
    }).then(function () {
        if (local.alertLast) {
            return bvStorage.set('lastAlert', local.alertLast);
        }
    }).catch(function (err) {
        console.log(err);
    });
}

//events

chrome.runtime.onInstalled.addListener(function () {
    function injectIntoTab (tab) {
        var scripts = chrome.manifest.content_scripts[0].js,
            i = 0,
            s = scripts.length;

        for (; i < s; i += 1) {
            chrome.tabs.executeScript(tab.id, {
                'file': scripts[i]
            });
        }
    }

    chrome.manifest = chrome.app.getDetails();

    chrome.windows.getAll({
        'populate': true
    }, function (windows) {
        var i = 0,
            j,
            t,
            currentTab,
            w = windows.length,
            currentWindow;

        for (; i < w; i += 1) {
            currentWindow = windows[i];
            j = 0;
            t = currentWindow.tabs.length;
            for (; j < t; j += 1) {
                currentTab = currentWindow.tabs[j];
                if (!currentTab.url.match(/(chrome|https):\/\//gi)) {
                    injectIntoTab(currentTab);
                }
            }
        }
    });
});

chrome.notifications.onClicked.addListener(function () {
    var url = bvConfig.docBase + '#/dashboard/main';

    return chrome.tabs.create({
        'url': url,
        'active': true
    });
});

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.executeScript({
        'file': 'injector.js'
    });
});

chrome.tabs.onUpdated.addListener(tabStateChange);

chrome.tabs.onCreated.addListener(function (tab) {
    tabStateChange(tab.id);
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    tabStateChange(activeInfo.tabId);
});

chrome.alarms.create('momentum_poll', {
    'delayInMinutes': 1,
    'periodInMinutes': 1
});

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'momentum_poll') {
        getNotifications();
    }
});
