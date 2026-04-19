import api from "./api";

function normalizeNotification(notification = {}) {
 return {
 ...notification,
 isRead: Boolean(notification.isRead || notification.readAt),
 };
}

export const fetchNotifications = async () => {
 const { data } = await api.get("/notifications");
 const items = Array.isArray(data) ? data : [];
 return items.map(normalizeNotification);
};

export const markNotificationRead = async (id) => {
 const { data } = await api.patch(`/notifications/${id}/read`);
 return normalizeNotification(data);
};
