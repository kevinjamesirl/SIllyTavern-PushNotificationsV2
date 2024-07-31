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

loadFile('scripts/extensions/third-party/SIllyTavern-PushNotificationsV2/sw.js', 'js');

// Function to handle notification click
function onNotificationClick(notification) {
    window.focus();
    notification.close();
}

// Function to handle visibility change
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Handle actions when the app/tab becomes visible
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('scripts/extensions/third-party/SIllyTavern-PushNotificationsV2/sw.js/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Check for notification permission and request if not already granted
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    setupNotifications();
                } else {
                    console.warn('Notifications not allowed');
                }
            });
        } else if (Notification.permission === 'granted') {
            setupNotifications();
        } else {
            console.warn('Notifications not allowed');
        }

    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
} else {
    console.warn('Service Workers are not supported in this browser');
}

// Main function to set up notifications
function setupNotifications() {
    const { eventSource, event_types } = window['SillyTavern'].getContext();
    
    eventSource.on(event_types.MESSAGE_RECEIVED, (messageId) => {
		console.log("MESSAGE RECEIVED");
        // if window is focused or visible, don't show notification
        // if (document.hasFocus() || document.visibilityState === 'visible') return;

        const context = window['SillyTavern'].getContext();
        const message = context.chat[messageId];

        if (!message || message.mes === '' || message.mes === '...' || message.is_user) return;

        const avatar = message.force_avatar ?? `/thumbnail?type=avatar&file=${encodeURIComponent(context.characters[context.characterId]?.avatar)}`;

        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(message.name, {
                body: substituteParams(message.mes),
                icon: location.origin + avatar,
                badge: location.origin + avatar,
                data: location.origin
            });
        });
    });
}

// Add event listener for visibility change
document.addEventListener('visibilitychange', handleVisibilityChange);
