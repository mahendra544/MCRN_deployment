export default function Layout({ children, onHome }) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onHome();
            }}
            className="flex items-center gap-3"
          >
            <span className="brand-mark brand-logo" aria-hidden="true">
              <img src="/assets/mcrn-logo.jpeg" alt="" />
            </span>
            <span className="leading-tight">
              <strong className="block text-sm font-bold text-ink">
                Missing Child
              </strong>
              <span className="block text-xs font-medium text-muted">
                Rescue Network
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onHome}
              className="rounded-md border border-black/10 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              Home
            </button>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
