import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post } from "../api/client.js";

export default function Register({ go }) {
  const [role, setRole] = useState("USER");
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      const path = role === "USER" ? "/auth/register/user" : "/auth/register/police";
      await post(path, form);
      setMsg("Registration successful. Check your email for the OTP.");
      setTimeout(() => go("verify", form.email), 700);
    } catch (x) {
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Choose the account type that matches your role."
      onBack={() => go("home")}
    >
      <div className="mb-5 flex gap-2">
        {["USER", "POLICE"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-bold transition ${
              role === r
                ? "bg-brand text-white"
                : "border border-black/10 text-ink hover:border-brand hover:text-brand"
            }`}
          >
            {r === "USER" ? "User" : "Police"}
          </button>
        ))}
      </div>

      <Alert msg={msg} />
      <Alert msg={err} error />

      <form onSubmit={submit}>
        {role === "POLICE" && (
          <Field
            label="Full name"
            value={form.name || ""}
            onChange={(v) => set("name", v)}
            placeholder="Officer name"
          />
        )}
        <Field
          label="Username"
          value={form.username || ""}
          onChange={(v) => set("username", v)}
          placeholder="Choose a username"
        />
        <Field
          label="Email"
          type="email"
          value={form.email || ""}
          onChange={(v) => set("email", v)}
          placeholder="you@example.com"
        />
        {role === "POLICE" && (
          <Field
            label="Official ID"
            value={form.officialId || ""}
            onChange={(v) => set("officialId", v)}
            placeholder="Official police ID"
          />
        )}
        <Field
          label="Password"
          type="password"
          value={form.password || ""}
          onChange={(v) => set("password", v)}
          placeholder="8+ chars, upper/lower/digit/special"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
}
