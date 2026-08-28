import { useEffect, useRef, useState } from "react";
import { Bell, Eye, Send } from "lucide-react";

import { getUnreadCount } from "../api/notificationApi.js";

export default function NotificationBell({
  session,
  onView,
  onSend
}) {

  const [count, setCount] =
    useState(0);

  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef(null);


  async function loadCount() {

    try {

      const data =
        await getUnreadCount();

      setCount(
        data.unreadCount || 0
      );

    } catch {

      setCount(0);
    }
  }


  useEffect(() => {

    loadCount();

    const interval =
      setInterval(
        loadCount,
        30000
      );

    return () =>
      clearInterval(interval);

  }, []);


  useEffect(() => {

    function closeMenu(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      closeMenu
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        closeMenu
      );

  }, []);


  const isSender =
    session?.role === "POLICE" ||
    session?.role === "ADMIN";


  function handleBellClick() {

    if (!isSender) {

      // USER directly opens
      // notification history.
      onView();

      return;
    }

    // Police/Admin see
    // View + Send options.
    setOpen(
      current => !current
    );
  }


  function viewNotifications() {

    setOpen(false);
    onView();
  }


  function sendNotification() {

    setOpen(false);
    onSend();
  }


  return (

    <div
      ref={menuRef}
      className="relative"
    >

      <button
        type="button"
        onClick={handleBellClick}
        aria-label="Notifications"
        className="relative grid h-10 w-10
                   place-items-center
                   rounded-full
                   border border-black/10
                   bg-white
                   text-ink
                   transition
                   hover:border-brand
                   hover:text-brand"
      >

        <Bell size={19} />

        {count > 0 && (

          <span
            className="absolute
                       -right-1
                       -top-1
                       grid
                       h-5
                       min-w-5
                       place-items-center
                       rounded-full
                       bg-brand
                       px-1
                       text-[10px]
                       font-bold
                       text-white"
          >
            {count > 99
              ? "99+"
              : count}
          </span>

        )}

      </button>


      {isSender && open && (

        <div
          className="absolute
                     right-0
                     top-12
                     z-50
                     w-60
                     rounded-xl
                     border
                     border-black/10
                     bg-white
                     p-2
                     shadow-lg"
        >

          <button
            type="button"
            onClick={viewNotifications}
            className="flex
                       w-full
                       items-center
                       gap-3
                       rounded-lg
                       px-3
                       py-3
                       text-left
                       text-sm
                       font-semibold
                       text-ink
                       hover:bg-gray-50"
          >

            <Eye size={18} />

            <span>
              View Notifications
            </span>

          </button>


          <button
            type="button"
            onClick={sendNotification}
            className="flex
                       w-full
                       items-center
                       gap-3
                       rounded-lg
                       px-3
                       py-3
                       text-left
                       text-sm
                       font-semibold
                       text-ink
                       hover:bg-gray-50"
          >

            <Send size={18} />

            <span>
              Send Notification
            </span>

          </button>

        </div>

      )}

    </div>
  );
}