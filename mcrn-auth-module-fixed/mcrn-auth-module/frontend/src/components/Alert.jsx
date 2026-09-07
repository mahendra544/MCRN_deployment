export default function Alert({ msg, error = false }) {
  if (!msg) return null;
  return (
    <div
      className={`mb-4 rounded-md px-3.5 py-3 text-sm font-medium ${
        error
          ? "bg-brand-light text-brand-dark"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {msg}
    </div>
  );
}
