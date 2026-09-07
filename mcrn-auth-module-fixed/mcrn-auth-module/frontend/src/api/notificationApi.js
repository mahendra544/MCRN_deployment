import {
  get,
  post,
  put,
  TOKEN_KEY
} from "./client.js";


function token() {
  return localStorage.getItem(TOKEN_KEY);
}


// =========================================================
// VIEW
// =========================================================

export async function getMyNotifications() {

  return get(
    "/notifications",
    token()
  );
}


// =========================================================
// UNREAD COUNT
// =========================================================

export async function getUnreadCount() {

  return get(
    "/notifications/unread-count",
    token()
  );
}


// =========================================================
// MARK ONE READ
// =========================================================

export async function markNotificationAsRead(
  notificationId
) {

  return put(
    `/notifications/${notificationId}/read`,
    {},
    token()
  );
}


// =========================================================
// MARK ALL READ
// =========================================================

export async function markAllNotificationsAsRead() {

  return put(
    "/notifications/read-all",
    {},
    token()
  );
}


// =========================================================
// GET RECIPIENTS
// POLICE / ADMIN
// =========================================================

export async function getNotificationRecipients() {

  return get(
    "/notifications/recipients",
    token()
  );
}


// =========================================================
// SEND
// POLICE / ADMIN
// =========================================================

export async function sendNotification(data) {

  return post(
    "/notifications/send",
    data,
    token()
  );
}