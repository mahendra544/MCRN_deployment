import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post } from "../api/client.js";

export default function Reset({ email: initialEmail, go }) {
  const [f, setF] = useState({ email: initialEmail || "", otp: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const d = await post("/auth/reset-password", f);
      setMsg(d.message);
      setTimeout(() => go("login"), 900);
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Verify the OTP and choose a new password."
      onBack={() => go("login")}
    >
      <Alert msg={msg} />
      <Alert msg={err} error />
      <form onSubmit={submit}>
        <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
        <Field label="OTP" value={f.otp} onChange={(v) => setF({ ...f, otp: v })} placeholder="123456" />
        <Field
          label="New password"
          type="password"
          value={f.newPassword}
          onChange={(v) => setF({ ...f, newPassword: v })}
          placeholder="8+ chars, upper/lower/digit/special"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthCard>
  );
}
