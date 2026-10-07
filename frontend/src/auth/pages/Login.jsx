import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post, TOKEN_KEY } from "../api/client.js";

export default function Login({ go, setSession }) {
  const [role, setRole] = useState("citizen");
  const [f, setF] = useState({ username: "", officialId: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setF({ ...f, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const d = role === "police"
        ? await post("/auth/police/login", f)
        : await post("/auth/login", { username: f.username, password: f.password });
      localStorage.setItem(TOKEN_KEY, d.token);
      localStorage.setItem("mcrn_session", JSON.stringify(d));
      setSession(d);
      window.location.href = role === "police" ? "/police-dashboard" : "/user-dashboard";
    } catch (x) {
      if (x.message === "EMAIL_NOT_VERIFIED") go("verify", x.email);
      else setErr(x.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  const police = role === "police";
  return <AuthCard eyebrow={police ? "AUTHORIZED POLICE ACCESS" : undefined}
    title={police ? "Police login" : "Citizen login"}
    subtitle={police ? "Police officers must provide their registered username and official ID." : "Sign in with your MCRN citizen account."}
    onBack={() => go("home")}>
    <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
      <button type="button" onClick={() => { setRole("citizen"); setErr(""); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${!police ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Citizen</button>
      <button type="button" onClick={() => { setRole("police"); setErr(""); }} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${police ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Police</button>
    </div>
    <Alert msg={err} error />
    <form onSubmit={submit}>
      <Field label="Username" value={f.username} onChange={v => set("username", v)} placeholder="Enter your registered username" autoComplete="username" />
      {police && <Field label="Official ID" value={f.officialId} onChange={v => set("officialId", v)} placeholder="Enter your official police ID" autoComplete="off" />}
      <div className="mb-1 flex justify-between"><span className="text-sm font-medium text-slate-700">Password</span><button type="button" onClick={() => go("forgot")} className="auth-link text-xs">Forgot password?</button></div>
      <Field label="" type="password" value={f.password} onChange={v => set("password", v)} placeholder="Enter your password" autoComplete="current-password" />
      <button className="auth-primary mt-2" disabled={loading}>{loading ? "Signing you in…" : police ? "Login as police" : "Login as citizen"}</button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-500"><button type="button" className="auth-link" onClick={() => { window.location.href = "/admin/"; }}>Administrator access</button></p>
    <p className="mt-6 text-center text-sm text-slate-500">New to MCRN? <button className="auth-link" onClick={() => go("register")}>Create an account</button></p>
  </AuthCard>;
}
