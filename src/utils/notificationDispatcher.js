export const NotificationTypes = {
    BID_OUTBID: 'bid_outbid',
    AUCTION_WON: 'auction_won',
    VOTE_SUBMITTED: 'vote_submitted',
    NEW_FOLLOWER: 'new_follower',
    NEW_RELIC_DROP: 'new_relic_drop'
};

const getIconForType = (type) => {
    switch (type) {
        case NotificationTypes.BID_OUTBID: return '💸';
        case NotificationTypes.AUCTION_WON: return '🎉';
        case NotificationTypes.VOTE_SUBMITTED: return '🗳️';
        case NotificationTypes.NEW_FOLLOWER: return '👤';
        case NotificationTypes.NEW_RELIC_DROP: return '✨';
        default: return '🔔';
    }
};

const getTitleForType = (type) => {
    switch (type) {
        case NotificationTypes.BID_OUTBID: return 'You Were Outbid!';
        case NotificationTypes.AUCTION_WON: return 'Auction Won!';
        case NotificationTypes.VOTE_SUBMITTED: return 'Vote Recorded';
        case NotificationTypes.NEW_FOLLOWER: return 'New Follower';
        case NotificationTypes.NEW_RELIC_DROP: return 'New Relic Dropped';
        default: return 'Notification';
    }
};

export const dispatchNotification = (userId, type, message) => {
    const key = `notifications_${userId}`;
    const notifications = JSON.parse(localStorage.getItem(key) || '[]');

    const newNotif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        icon: getIconForType(type),
        title: getTitleForType(type),
        message,
        timestamp: Date.now(),
        read: false
    };

    notifications.unshift(newNotif);
    localStorage.setItem(key, JSON.stringify(notifications));

    // Dispatch global event for context to pick up
    window.dispatchEvent(new CustomEvent('global_notification_update', {
        detail: { userId, notification: newNotif }
    }));

    return newNotif;
};
