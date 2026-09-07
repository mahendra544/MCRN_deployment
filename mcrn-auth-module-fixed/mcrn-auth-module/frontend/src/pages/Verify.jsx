import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post } from "../api/client.js";

export default function Verify({ email: initialEmail, go }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const d = await post("/auth/verify-email", { email, otp });
      setMsg(d.message);
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`Enter the 6-digit OTP sent to ${email || "your email"}.`}
      onBack={() => go("login")}
    >
      <Alert msg={msg} />
      <Alert msg={err} error />
      <form onSubmit={submit}>
        {/*
          Fixed: this field used to be visually editable but its onChange was
          a no-op, so it always silently submitted whatever value was passed
          in — even when that value was wrong (see the Login fix). It's now
          a real controlled input so the person can correct it if needed.
        */}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Field label="OTP" value={otp} onChange={setOtp} placeholder="123456" />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
        <button
          type="button"
          onClick={() => go("login")}
          className="mt-2.5 w-full rounded-md py-2.5 text-sm font-semibold text-muted transition hover:text-brand"
        >
          Back to login
        </button>
      </form>
    </AuthCard>
  );
}
