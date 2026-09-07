import { ArrowLeft } from "lucide-react";

export default function AuthCard({ title, subtitle, children, onBack }) {
  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-[520px]">
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-panel animate-pageIn">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-muted transition hover:text-brand"
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Secure Access
            </span>
            <h2 className="mt-2 text-2xl font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
