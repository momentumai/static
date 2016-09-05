/* global self, clients, fetch */

console.log('Started', self);

self.bvConfig = JSON.parse('@@bvConfig');
self.sessionId = '';

self.addEventListener('install', function (event) {
    self.skipWaiting();
    console.log('Installed', event);
});

self.addEventListener('activate', function (event) {
    console.log('Activated', event);
});

self.addEventListener('message', function (event) {
    if (event.origin === self.bvConfig.docBase) {
        self.sessionId = event.data.sessionId;
    }
});

self.showNotif = function (notif) {
    self.registration.showNotification(notif.params.title, {
        'body': notif.params.body,
        'icon': 'images/icon64.png',
        'data': notif.data
    });
};

self.addEventListener('push', function (event) {
    event.waitUntil(
        self.registration.pushManager.getSubscription().then(function (sub) {
            var ep = [
                self.bvConfig.endpoint,
                'auth/user/notif/fetch'
            ].join('');

            fetch(ep, {
                'method': 'post',
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'session_id': self.sessionId,
                    'endpoint': sub.endpoint
                })
            })
            .then(function (response) {
                console.log('response', response);
                return response.json();
            }).then(function (resp) {
                resp.map(function (notif) {
                    self.showNotif(notif);
                });
            }).catch(function (err) {
                console.log('error', err);
            });
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({'type': 'window'}).then(function (windowClients) {
            var i,
                client;

            for (i = 0; i < windowClients.length; i++) {
                client = windowClients[i];
                if (client.url === event.notification.data.url &&
                    'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
