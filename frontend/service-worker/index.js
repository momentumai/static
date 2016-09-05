/* global self, clients, fetch */
var bvConfig = JSON.parse('@@bvConfig');

console.log('Started', self);

self.addEventListener('install', function (event) {
    self.skipWaiting();
    console.log('Installed', event);
});

self.addEventListener('activate', function (event) {
    console.log('Activated', event);
});

self.addEventListener('message', function (event) {
    self.token = event.data.token;
});

self.addEventListener('push', function (event) {
    event.waitUntil(
        self.registration.pushManager.getSubscription().then(function (sub) {
            var ep = [
                bvConfig.endpoint,
                'auth/user/notif/fetch'
            ].join();

            fetch(ep, {
                'method': 'post',
                'headers': {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                'body': {
                    'session_id': self.sessionId,
                    'endpoint': sub.endpoint
                }
            })
            .then(function (response) { return response.json(); })
            .then(function (resp) {
                self.registration.showNotification(resp.title, resp.data);
            })
            .catch(function (err) {
                console.log('error', err);
            });
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    var url = 'https://app.momentum.ai';

    console.log('Notification click:', event);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({'type': 'window'}).then(function (windowClients) {
            var i,
                client;

            console.log('WindowClients', windowClients);
            for (i = 0; i < windowClients.length; i++) {
                client = windowClients[i];
                console.log('WindowClient', client);
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
