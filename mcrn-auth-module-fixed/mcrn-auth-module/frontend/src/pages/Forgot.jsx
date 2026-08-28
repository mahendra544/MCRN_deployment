import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post } from "../api/client.js";

export default function Forgot({ go }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const d = await post("/auth/forgot-password", { email });
      setMsg(d.message);
      setTimeout(() => go("reset", email), 700);
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We'll send a password reset OTP to your registered email."
      onBack={() => go("login")}
    >
      <Alert msg={msg} />
      <Alert msg={err} error />
      <form onSubmit={submit}>
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </AuthCard>
  );
}
