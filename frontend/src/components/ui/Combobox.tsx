import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: string; // initials fallback
  avatarColor?: string;
}

interface Props {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-600",
  "bg-sky-500",
  "bg-orange-500",
];

function getAvatarColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled,
  searchable = false,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((v) => !v); setSearch(""); }}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm text-left transition-all duration-150 outline-none
          ${open
            ? "border-[#145e6e] ring-2 ring-[#145e6e]/20 bg-white"
            : "border-slate-200 bg-white hover:border-slate-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{ boxShadow: open ? "0 0 0 3px rgba(20,94,110,0.08)" : "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {selected ? (
            <>
              {selected.sublabel !== undefined && (
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${getAvatarColor(selected.label)}`}>
                  {getInitials(selected.label)}
                </span>
              )}
              <span className="truncate font-medium text-slate-800">{selected.label}</span>
              {selected.sublabel && (
                <span className="text-xs text-slate-400 truncate">{selected.sublabel}</span>
              )}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-slate-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 top-full mt-1.5 w-full rounded-xl border border-slate-200 bg-white overflow-hidden"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
          >
            {searchable && (
              <div className="p-2 border-b border-slate-100">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No results</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors duration-100
                      ${opt.value === value
                        ? "bg-[#0f4c5c]/8 text-[#0f4c5c]"
                        : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    {opt.sublabel !== undefined && (
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${getAvatarColor(opt.label)}`}>
                        {getInitials(opt.label)}
                      </span>
                    )}
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-xs text-slate-400 truncate">{opt.sublabel}</span>
                      )}
                    </span>
                    {opt.value === value && (
                      <svg className="w-4 h-4 text-[#0f4c5c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
