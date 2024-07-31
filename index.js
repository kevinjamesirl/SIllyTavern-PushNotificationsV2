import { substituteParams } from '../../../../script.js';

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

// Check for notification permission and request if not already granted
if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
			console.warn('Notifications ALLOWED! - "default"');
            setupNotifications();
        } else {
            console.warn('Notifications not allowed');
        }
    });
} else if (Notification.permission === 'granted') {
	console.warn('Notifications ALLOWED! - "granted"');
    setupNotifications();
} else {
    console.warn('Notifications not allowed');
}

// Main function to set up notifications
function setupNotifications() {
    const { eventSource, event_types } = window['SillyTavern'].getContext();
    
    eventSource.on(event_types.MESSAGE_RECEIVED, (messageId) => {
        // if window is focused or visible, don't show notification
        if (document.hasFocus() || document.visibilityState === 'visible') return;

        const context = window['SillyTavern'].getContext();
        const message = context.chat[messageId];

        if (!message || message.mes === '' || message.mes === '...' || message.is_user) return;

        const avatar = message.force_avatar ?? `/thumbnail?type=avatar&file=${encodeURIComponent(context.characters[context.characterId]?.avatar)}`;

        const notification = new Notification(message.name, {
            body: substituteParams(message.mes),
            icon: location.origin + avatar,
        });

        notification.onclick = () => onNotificationClick(notification);

        // Extend timeout duration for mobile
        setTimeout(notification.close.bind(notification), 15000);
    });
}

// Add event listener for visibility change
document.addEventListener('visibilitychange', handleVisibilityChange);
