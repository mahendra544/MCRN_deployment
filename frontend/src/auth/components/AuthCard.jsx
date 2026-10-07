
import { ArrowLeft, ShieldCheck } from "lucide-react";
export default function AuthCard({title,subtitle,children,onBack,eyebrow="MCRN SECURE ACCESS"}) {
 return <main className="auth-stage px-4 py-8 sm:px-6">
  <section className="auth-shell animate-pageIn">
   <aside className="auth-aside">
    <div className="auth-mark"><ShieldCheck size={28}/></div>
    <div className="relative z-10">
      <p className="text-xs font-bold tracking-[0.24em] text-white/60">MISSING CHILD RESCUE NETWORK</p>
      <h1>Every report.<br/>Every second.<br/><span>Matters.</span></h1>
      <p className="max-w-sm text-sm leading-7 text-white/70">A secure, verified gateway for citizens and authorized responders.</p>
    </div>
    <div className="relative z-10 mt-auto flex items-center gap-3 text-xs text-white/55"><span className="h-px flex-1 bg-white/15"/>PROTECTED ACCESS</div>
   </aside>
   <div className="auth-panel">
    <div className="mb-7 flex items-start justify-between">
      <div>{onBack&&<button onClick={onBack} className="auth-back"><ArrowLeft size={16}/> Back</button>}
      <p className="mt-5 text-[11px] font-bold tracking-[0.18em] text-[#9a4c43]">{eyebrow}</p>
      <h2>{title}</h2>{subtitle&&<p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}</div>
      <div className="grid h-10 w-10 place-items-center rounded-full border border-[#9a4c43]/15 bg-[#9a4c43]/5 text-[#9a4c43]"><ShieldCheck size={19}/></div>
    </div>
    {children}
   </div>
  </section>
 </main>;
}
