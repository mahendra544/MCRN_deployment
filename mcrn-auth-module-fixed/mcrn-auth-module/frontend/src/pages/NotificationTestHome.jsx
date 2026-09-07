import React from "react";

import NotificationBell
  from "../components/NotificationBell.jsx";

function NotificationTestHome({
  session,
  onNotifications,
  onSendNotification
}) {

  return (

    <div className="min-h-screen bg-gray-50">

      <header
        className="flex
                   items-center
                   justify-between
                   border-b
                   bg-white
                   px-8
                   py-4"
      >

        <div>

          <h2
            className="font-bold
                       text-ink"
          >
            Missing Child Rescue Network
          </h2>

          <p
            className="text-xs
                       text-muted"
          >
            Notification Module Test Page
          </p>

        </div>


        <NotificationBell
          session={session}
          onView={onNotifications}
          onSend={onSendNotification}
        />

      </header>


      <main
        className="mx-auto
                   max-w-4xl
                   px-6
                   py-16"
      >

        <div
          className="rounded-2xl
                     border
                     bg-white
                     p-8
                     shadow-sm"
        >

          <p
            className="text-xs
                       font-bold
                       uppercase
                       tracking-wider
                       text-brand"
          >
            Testing Notifications
          </p>


          <h1
            className="mt-2
                       text-3xl
                       font-bold
                       text-ink"
          >
            Test Homepage
          </h1>


          <div
            className="mt-6
                       rounded-lg
                       bg-gray-50
                       p-5"
          >

            <p>
              <strong>
                Username:
              </strong>{" "}
              {session?.username ||
                "Unknown"}
            </p>


            <p className="mt-2">

              <strong>
                Role:
              </strong>{" "}

              <span
                className="font-bold
                           text-brand"
              >
                {session?.role ||
                  "Unknown"}
              </span>

            </p>

          </div>


          <div
            className="mt-8
                       rounded-xl
                       border
                       border-dashed
                       border-brand
                       bg-brand-soft
                       p-6"
          >

            <p
              className="font-semibold
                         text-ink"
            >
              Notification testing
            </p>

            <p
              className="mt-2
                         text-sm
                         text-muted"
            >
              Click the notification bell
              above. USER accounts open
              notification history directly.
              POLICE and ADMIN accounts get
              View Notifications and Send
              Notification options.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default NotificationTestHome;