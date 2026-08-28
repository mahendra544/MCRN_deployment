export default function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        className={`w-full rounded-md border border-black/10 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 ${
          disabled ? "cursor-not-allowed bg-gray-50 text-muted" : "bg-white"
        }`}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
