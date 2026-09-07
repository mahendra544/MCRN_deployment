import { useEffect, useState } from "react";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../api/notificationApi.js";

import Alert from "../components/Alert.jsx";


function notificationIcon(type) {
  switch (type) {
    case "REPORT_SUBMITTED":
      return "📋";

    case "REPORT_VERIFIED":
      return "✅";

    case "REPORT_REJECTED":
      return "❌";

    case "NEW_REPORT":
      return "🚨";

    case "CASE_UPDATE":
      return "🔄";

    case "CHILD_FOUND":
      return "🎉";

    case "SYSTEM":
      return "📢";

    default:
      return "🔔";
  }
}


function notificationTitle(type) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}


export default function Notifications({ session }) {
  const roleName =
  session?.role === "POLICE"
    ? "Police"
    : session?.role === "ADMIN"
      ? "Admin"
      : "User";
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  async function loadNotifications() {

    try {

      setError("");

      const data =
        await getMyNotifications();

      setNotifications(data);

    } catch (x) {

      setError(x.message);

    } finally {

      setLoading(false);
    }
  }


  useEffect(() => {

    loadNotifications();

    // Check for new notifications
    // every 30 seconds.

    const interval =
      setInterval(
        loadNotifications,
        30000
      );

    return () =>
      clearInterval(interval);

  }, []);


  async function handleRead(id) {

    try {

      await markNotificationAsRead(id);

    setNotifications(
  current =>
    current.map(notification =>
      notification.id === id
        ? {
            ...notification,
            read: true
          }
        : notification
    )
);

    } catch (x) {

      setError(x.message);
    }
  }


  async function handleReadAll() {

    try {

      await markAllNotificationsAsRead();

      setNotifications(
  current =>
    current.map(notification => ({
      ...notification,
      read: true
    }))
);

      setMessage(
        "All notifications marked as read."
      );

    } catch (x) {

      setError(x.message);
    }
  }


  const unreadCount =
    notifications.filter(
      notification => !notification.read
    ).length;


  if (loading) {

    return (
      <main className="grid min-h-[60vh] place-items-center px-6">

        <p className="text-sm text-muted">
          Loading notifications...
        </p>

      </main>
    );
  }


  return (

    <main className="px-6 py-12">

      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-7 flex
                        flex-col gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between">

          <div>

            <span className="text-xs
                             font-bold
                             uppercase
                             tracking-wider
                             text-brand">

              Notifications

            </span>

            <h1 className="mt-1 text-3xl
                           font-bold text-ink">

              {roleName} Notifications

            </h1>

            <p className="mt-2 text-sm
                          text-muted">

              Important updates about
              missing-child cases and
              your account.

            </p>

          </div>


          {unreadCount > 0 && (

            <button
              onClick={handleReadAll}
              className="rounded-md
                         bg-brand
                         px-4 py-2.5
                         text-sm
                         font-bold
                         text-white
                         transition
                         hover:bg-brand-dark"
            >
              Mark all as read
            </button>

          )}

        </div>


        <Alert msg={message} />

        <Alert
          msg={error}
          error
        />


        {/* Notification count */}

        <div className="mb-4
                        rounded-xl
                        border
                        border-black/5
                        bg-brand-soft/30
                        px-5 py-4">

          <p className="text-sm
                        font-semibold
                        text-ink">

            {unreadCount === 0
              ? "You're all caught up."
              : `${unreadCount} unread notification${
                  unreadCount === 1
                    ? ""
                    : "s"
                }`
            }

          </p>

        </div>


        {/* Notifications */}

        <div className="overflow-hidden
                        rounded-2xl
                        border
                        border-black/5
                        bg-white
                        shadow-panel">

          {notifications.length === 0 ? (

            <div className="px-6 py-20
                            text-center">

              <div className="mx-auto mb-4
                              grid h-16 w-16
                              place-items-center
                              rounded-full
                              bg-brand-soft
                              text-2xl">

                🔔

              </div>

              <h2 className="text-lg
                             font-bold
                             text-ink">

                No notifications

              </h2>

              <p className="mt-1
                            text-sm
                            text-muted">

                You don't have any
                notifications yet.

              </p>

            </div>

          ) : (

            <div className="divide-y
                            divide-black/5">

              {notifications.map(
                notification => (

                <div
                  key={notification.id}
                  onClick={() =>
                    !notification.read &&
                    handleRead(
                      notification.id
                    )
                  }
                  className={`flex
                    cursor-pointer
                    gap-4
                    px-6 py-5
                    transition
                    hover:bg-brand-soft/30
                    ${
                      notification.read
                        ? "bg-white"
                        : "bg-red-50/40"
                    }`}
                >

                  {/* Icon */}

                  <div className="grid h-11
                                  w-11
                                  shrink-0
                                  place-items-center
                                  rounded-xl
                                  bg-brand-soft
                                  text-xl">

                    {notificationIcon(
                      notification
                        .notificationType
                    )}

                  </div>


                  {/* Text */}

                  <div className="min-w-0
                                  flex-1">

                    <div className="flex
                                    flex-wrap
                                    items-center
                                    gap-2">

                      <h2 className="font-bold
                                     text-ink">

                        {notificationTitle(
                          notification
                            .notificationType
                        )}

                      </h2>


                      {!notification.read && (

                        <span className="rounded-full
                                         bg-brand
                                         px-2 py-0.5
                                         text-[10px]
                                         font-bold
                                         uppercase
                                         text-white">

                          New

                        </span>

                      )}

                    </div>


                    <p className="mt-1
                                  text-sm
                                  leading-6
                                  text-muted">

                      {notification.message}

                    </p>
                    {notification.senderName ? (

  <p className="mt-2
                text-xs
                font-semibold
                text-gray-500">

    From: {notification.senderName}

    {notification.senderRole && (
      <>
        {" "}
        ({notification.senderRole})
      </>
    )}

  </p>

) : (

  <p className="mt-2
                text-xs
                font-semibold
                text-gray-500">

    From: System

  </p>

)}


                    {notification.caseId && (

                      <p className="mt-2
                                    text-xs
                                    font-semibold
                                    text-brand">

                        Case ID:
                        {" "}
                        {notification.caseId}

                      </p>

                    )}


                    <p className="mt-2
                                  text-xs
                                  text-gray-400">

                      {new Date(
                        notification.sentAt
                      ).toLocaleString()}

                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}