
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Field({ label, type="text", value, onChange, placeholder, disabled=false, autoComplete, inputMode, maxLength }) {
  const [visible,setVisible]=useState(false);
  const isPassword=type==="password";
  return <div className="mb-4">
    <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      <input
        className={`auth-input ${isPassword?"pr-12":""} ${disabled?"cursor-not-allowed opacity-60":""}`}
        type={isPassword?(visible?"text":"password"):type}
        value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength}
      />
      {isPassword && <button type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(v=>!v)}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 transition hover:text-[#9a4c43]">
        {visible?<EyeOff size={18}/>:<Eye size={18}/>}
      </button>}
    </div>
  </div>;
}
