import { useEffect, useRef, useState } from "react";
import { User, Settings, Lock, LogOut, ChevronDown } from "lucide-react";
import { TOKEN_KEY } from "../api/client.js";

export default function ProfileMenu({ session, onProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setOpen(false);
    onLogout();
  }

  const name = session?.name || session?.username || "User";
  const role = session?.role || "USER";

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="hidden text-left sm:block">
          <strong className="block text-sm text-ink">
            {name}
          </strong>

          <span className="block text-[11px] text-muted">
            {role}
          </span>
        </div>

        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-black/10 bg-white p-2 shadow-panel">

          <button
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-soft"
          >
            <User size={17} />
            View Profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-soft"
          >
            <Settings size={17} />
            Edit Profile
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onProfile();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-brand-soft"
          >
            <Lock size={17} />
            Change Password
          </button>

          <div className="my-1 border-t border-black/5" />

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>
      )}
    </div>
  );
}