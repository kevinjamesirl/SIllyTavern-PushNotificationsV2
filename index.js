import { substituteParams } from '../../../../script.js';

function loadFile(src, type, callback) {
    var elem;

    if (type === 'css') {
        elem = document.createElement('link');
        elem.rel = 'stylesheet';
        elem.href = src;
    } else if (type === 'js') {
        elem = document.createElement('script');
        elem.src = src;
        elem.onload = function () {
            if (callback) callback();
        };
    }

    if (elem) {
        document.head.appendChild(elem);
    }
}

//loadFile('scripts/extensions/third-party/SIllyTavern-PushNotificationsV2/sw.js', 'js');

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Check for notification permission and request if not already granted
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    initializeNotifications();
                } else {
                    console.warn('Notifications not allowed');
                }
            });
        } else if (Notification.permission === 'granted') {
            initializeNotifications();
        } else {
            console.warn('Notifications not allowed');
        }

    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
} else {
    console.warn('Service Workers are not supported in this browser');
}

function initializeNotifications() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            const { eventSource, event_types } = window['SillyTavern'].getContext();
            eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (messageId) => {
                console.log("WE GOT A MESSAGE");

                const context = window['SillyTavern'].getContext();
                const message = context.chat[messageId];

                if (!message || message.mes === '' || message.mes === '...' || message.is_user) return;

                const avatar = message.force_avatar ?? `/thumbnail?type=avatar&file=${encodeURIComponent(context.characters[context.characterId]?.avatar)}`;

                console.log("SENDING NOTIFICATION");

                // Old method
                /* const notification = new Notification(message.name, {
                    body: substituteParams(message.mes),
                    icon: location.origin + avatar,
                });

                notification.onclick = () => {
                    window.focus();
                };

                setTimeout(notification.close.bind(notification), 10000); */

                // New method
                navigator.serviceWorker.ready.then((registration) => {
                    console.log("Service Worker ready, showing notification");
                    registration.showNotification(message.name, {
                        body: substituteParams(message.mes),
                        icon: location.origin + avatar,
                        tag: messageId // Ensure notifications with the same tag replace each other
                    });
                }).catch(error => {
                    console.error('Error showing notification:', error);
                });
            });
        } else {
            console.warn('Notifications not allowed');
        }
    });
}
