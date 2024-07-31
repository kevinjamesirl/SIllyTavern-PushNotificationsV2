import { substituteParams } from '../../../../script.js';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        initializeNotifications();
    }).catch((error) => {
        console.error('Service Worker registration failed:', error);
    });

    // Define the service worker code inline
    const serviceWorkerCode = `
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
    `;

    // Create a blob of the service worker code
    const blob = new Blob([serviceWorkerCode], { type: 'application/javascript' });

    // Create a URL for the blob
    const serviceWorkerURL = URL.createObjectURL(blob);

    // Register the service worker using the blob URL
    navigator.serviceWorker.register(serviceWorkerURL).then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        initializeNotifications();
    }).catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
}

function initializeNotifications() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            const { eventSource, event_types } = window['SillyTavern'].getContext();
            eventSource.on(event_types.MESSAGE_RECEIVED, (messageId) => {
                // if window is focused, don't show notification
                if (document.hasFocus()) return;

                const context = window['SillyTavern'].getContext();
                const message = context.chat[messageId];

                if (!message || message.mes === '' || message.mes === '...' || message.is_user) return;

                const avatar = message.force_avatar ?? `/thumbnail?type=avatar&file=${encodeURIComponent(context.characters[context.characterId]?.avatar)}`;

                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(message.name, {
                        body: substituteParams(message.mes),
                        icon: location.origin + avatar,
                        tag: messageId // Ensure notifications with the same tag replace each other
                    });
                });
            });
        } else {
            console.warn('Notifications not allowed');
        }
    });
}
