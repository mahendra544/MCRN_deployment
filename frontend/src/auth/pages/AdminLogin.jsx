import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post, TOKEN_KEY } from "../api/client.js";

export default function AdminLogin({ go, setSession }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const data = await post("/auth/admin/login", form);
      if (data.role !== "ADMIN") {
        setErr("This login is restricted to administrator accounts.");
        return;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setSession(data);
      go("admin-dashboard");
    } catch (error) {
      if (error.message === "EMAIL_NOT_VERIFIED") go("verify", error.email);
      else setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="ADMINISTRATOR ACCESS"
      title="Admin sign in"
      subtitle="Sign in with the unique administrator credentials configured privately on the server."
      onBack={() => go("home")}
    >
      <div className="mb-6 rounded-2xl border border-[#9a4c43]/15 bg-[#9a4c43]/5 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#9a4c43] shadow-sm">
            <ShieldCheck size={19} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">Restricted access</p>
            <p className="text-xs leading-5 text-slate-500">Administrator access is restricted to the configured administrator credentials.</p>
          </div>
        </div>
      </div>

      <Alert msg={err} error />
      <form onSubmit={submit}>
        <Field label="Admin username" value={form.username} onChange={(v) => set("username", v)} placeholder="Enter your unique admin username" autoComplete="username" />
        <Field label="Admin password" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="Enter your private password" autoComplete="current-password" />
        <button className="auth-primary mt-2" disabled={loading}>{loading ? "Signing you in…" : "Sign in as administrator"}</button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        <span>No administrator registration is available. Credentials are configured privately on the server.</span>
      </div>
      <div className="mt-2 text-center text-sm text-slate-500">
        <button className="auth-link" onClick={() => go("login")}>Back to member login</button>
      </div>
    </AuthCard>
  );
}
