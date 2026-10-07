import { LogOut, ShieldCheck } from "lucide-react";
import { TOKEN_KEY } from "../api/client.js";

export default function AdminDashboard({ go, clear }) {
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    clear();
    go("home");
  }

  return (
    <main className="px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-panel">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Administrator</span>
              <h1 className="mt-1 text-3xl font-bold text-ink">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-muted">Restricted administrator area for the MCRN system.</p>
            </div>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand">
              <LogOut size={16} /> Logout
            </button>
          </div>

          <div className="rounded-2xl border border-[#9a4c43]/15 bg-[#9a4c43]/5 p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#9a4c43] shadow-sm">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2 className="font-bold text-slate-800">Administrator access confirmed</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This administrator account is fixed and privately configured on the server. There is no administrator registration or public administrator account creation flow.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-black/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Access</p>
              <h3 className="mt-1 font-bold text-ink">Admin only</h3>
              <p className="mt-1 text-sm text-muted">The portal is accessible only after successful administrator authentication.</p>
            </div>
            <div className="rounded-xl border border-black/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">Credentials</p>
              <h3 className="mt-1 font-bold text-ink">Server configured</h3>
              <p className="mt-1 text-sm text-muted">The unique username and password are never displayed in the frontend.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
