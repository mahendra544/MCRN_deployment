import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { get, put, TOKEN_KEY } from "../api/client.js";

export default function Profile({ clear, go }) {
  const [p, setP] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(false);
  const [pass, setPass] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // Fixed: previously this always fired the request even with no token,
      // sending "Authorization: Bearer null" and leaving the page stuck on
      // "Loading your secure profile..." forever. Now it bails out straight
      // to login.
      clear();
      go("login");
      return;
    }
    get("/user/profile", token)
      .then(setP)
      .catch((x) => {
        if (x.status === 401 || x.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem("mcrn_session");
          clear();
          go("login");
        } else {
          setErr(x.message);
        }
      });
  }, []);

  if (!p) return <AuthCard title="Profile" subtitle="Loading your secure profile..." />;

  async function save() {
    try {
      setErr("");
      await put(
        "/user/profile",
        { name: p.name, phone: p.phone || "", profilePhotoUrl: p.profilePhotoUrl || "" },
        localStorage.getItem(TOKEN_KEY)
      );
      setMsg("Profile updated.");
      setEditing(false);
    } catch (x) {
      setErr(x.message);
    }
  }

  async function change() {
    try {
      setErr("");
      const d = await put("/user/change-password", pass, localStorage.getItem(TOKEN_KEY));
      setMsg(d.message);
      setPass({ currentPassword: "", newPassword: "" });
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <main className="px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-panel">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Account
              </span>
              <h2 className="mt-1 text-2xl font-bold text-ink">My Profile</h2>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem("mcrn_session");
                clear();
                go("home");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>

          <Alert msg={msg} />
          <Alert msg={err} error />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-black/5 bg-brand-soft/40 p-5">
              <h3 className="mb-3 text-base font-bold text-ink">Identity</h3>
              <p className="text-sm text-ink">
                <b>Username:</b> {p.username}
              </p>
              <p className="text-sm text-ink">
                <b>Email:</b> {p.email}
              </p>
              <p className="text-sm text-ink">
                <b>Role:</b> {p.role}
              </p>
              <p className="text-sm text-ink">
                <b>Verified:</b> {p.verified ? "Yes" : "No"}
              </p>
            </div>

            <div className="rounded-xl border border-black/5 p-5">
              <h3 className="mb-3 text-base font-bold text-ink">Profile</h3>
              {editing ? (
                <>
                  <Field label="Name" value={p.name} onChange={(v) => setP({ ...p, name: v })} />
                  <Field label="Phone" value={p.phone || ""} onChange={(v) => setP({ ...p, phone: v })} />
                  <Field
                    label="Photo URL"
                    value={p.profilePhotoUrl || ""}
                    onChange={(v) => setP({ ...p, profilePhotoUrl: v })}
                  />
                  <button
                    onClick={save}
                    className="rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-1 text-sm text-ink">{p.name}</p>
                  <p className="mb-4 text-sm text-muted">{p.phone || "No phone added"}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-bold text-ink transition hover:border-brand hover:text-brand"
                  >
                    Edit profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-black/5 p-5">
            <h3 className="mb-3 text-base font-bold text-ink">Change password</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Current password"
                type="password"
                value={pass.currentPassword}
                onChange={(v) => setPass({ ...pass, currentPassword: v })}
              />
              <Field
                label="New password"
                type="password"
                value={pass.newPassword}
                onChange={(v) => setPass({ ...pass, newPassword: v })}
              />
            </div>
            <button
              onClick={change}
              className="mt-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Change password
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
