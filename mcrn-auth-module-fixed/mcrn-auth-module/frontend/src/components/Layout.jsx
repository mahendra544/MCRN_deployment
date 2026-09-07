import NotificationBell from "./NotificationBell.jsx";
import ProfileMenu from "./ProfileMenu.jsx";

export default function Layout({
  children,
  onHome,
  onNotifications,
  onSendNotification,
  onProfile,
  session,
  onLogout
}) {
  const authenticated = !!session;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">

          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3"
          >
            <span className="h-10 w-10 overflow-hidden rounded-xl">
  <img
    src="/logo.jpeg"
    alt="Missing Child Rescue Network"
    className="h-full w-full object-cover"
  />
</span>

            <span className="leading-tight text-left">
              <strong className="block text-sm font-bold text-ink">
                Missing Child
              </strong>

              <span className="block text-xs font-medium text-brand">
                Rescue Network
              </span>
            </span>
          </button>


          <div className="flex items-center gap-3">

            {!authenticated && (
              <button
                onClick={onHome}
                className="rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              >
                Home
              </button>
            )}


            {authenticated && (
              <>
                <NotificationBell
  session={session}
  onView={onNotifications}
  onSend={onSendNotification}
/>

                <ProfileMenu
                  session={session}
                  onProfile={onProfile}
                  onLogout={onLogout}
                />
              </>
            )}

          </div>

        </div>

      </header>

      {children}
    </>
  );
}