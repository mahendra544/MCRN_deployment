import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post, TOKEN_KEY } from "../api/client.js";

export default function PoliceLogin({ go, setSession }) {
  const [f, setF] = useState({ username: "", officialId: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setF({ ...f, [k]: v });
  async function submit(e) {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const d = await post("/auth/police/login", f); localStorage.setItem(TOKEN_KEY, d.token); setSession(d); localStorage.setItem("mcrn_session", JSON.stringify(d)); window.location.href = "/police-dashboard"; }
    catch (x) { if (x.message === "EMAIL_NOT_VERIFIED") go("verify", x.email); else setErr(x.message); }
    finally { setLoading(false); }
  }
  return <AuthCard eyebrow="AUTHORIZED POLICE ACCESS" title="Police login" subtitle="Police officers must provide both their registered username and official ID." onBack={() => go("home")}>
    <div className="mb-6 rounded-2xl border border-[#9a4c43]/15 bg-[#9a4c43]/5 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#9a4c43] shadow-sm"><ShieldCheck size={19} /></span><div><p className="text-sm font-bold text-slate-800">Officer verification</p><p className="text-xs leading-5 text-slate-500">Username, official ID and password are checked together.</p></div></div></div>
    <Alert msg={err} error />
    <form onSubmit={submit}>
      <Field label="Police username" value={f.username} onChange={v => set("username", v)} placeholder="Enter your registered username" autoComplete="username" />
      <Field label="Official ID" value={f.officialId} onChange={v => set("officialId", v)} placeholder="Enter your official police ID" autoComplete="off" />
      <Field label="Password" type="password" value={f.password} onChange={v => set("password", v)} placeholder="Enter your password" autoComplete="current-password" />
      <button className="auth-primary mt-2" disabled={loading}>{loading ? "Verifying officer…" : "Login as police"}</button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-500"><button className="auth-link" onClick={() => go("forgot")}>Forgot password?</button></p>
    <p className="mt-5 text-center text-sm text-slate-500">Need an account? <button className="auth-link" onClick={() => go("register")}>Police registration</button></p>
    <p className="mt-2 text-center text-sm text-slate-500"><button className="auth-link" onClick={() => go("login")}>Back to citizen login</button></p>
  </AuthCard>;
}
