import { useEffect, useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post } from "../api/client.js";

export default function Verify({ email: initialEmail, go }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => setEmail(initialEmail || ""), [initialEmail]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const d = await post("/auth/verify-email", { email: email.trim(), otp: otp.trim() });
      setMsg(d.message);
      setTimeout(() => go("login"), 1000);
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setErr("");
    setMsg("");
    setResending(true);
    try {
      const d = await post("/auth/resend-otp", { email: email.trim(), purpose: "REGISTRATION_VERIFICATION" });
      setMsg(d.message || "A new verification code has been sent.");
    } catch (x) {
      setErr(x.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your inbox. The code expires after 10 minutes."
      onBack={() => go("login")}
    >
      <Alert msg={msg} />
      <Alert msg={err} error />
      <form onSubmit={submit}>
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Verification code"
          value={otp}
          onChange={(v) => setOtp(v.replace(/\D/g, ""))}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
        />
        <button className="auth-primary mt-2" disabled={loading}>
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
      </form>
      <div className="mt-5 text-center text-sm text-slate-500">
        Didn't receive it?{" "}
        <button
          type="button"
          className="auth-link"
          disabled={resending || !email}
          onClick={resend}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </AuthCard>
  );
}
