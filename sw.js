console.log('Hello from service worker!') 

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
