import { useState } from "react";
import { useRallyCries } from "../api/rcdo";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSelect: (outcomeId: string) => void;
}

export function RcdoSelector({ onSelect }: Props) {
  const { data: rallyCries, isLoading } = useRallyCries();
  const [expandedRc, setExpandedRc] = useState<string | null>(null);
  const [expandedObj, setExpandedObj] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isLoading) return (
    <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading RCDO...
    </div>
  );

  return (
    <div
      className="rounded-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto"
      style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {rallyCries?.map((rc, rcIdx) => (
        <div key={rc.id} className={rcIdx > 0 ? "border-t border-slate-100" : ""}>
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors group"
            onClick={() => setExpandedRc(expandedRc === rc.id ? null : rc.id)}
          >
            <motion.div
              animate={{ rotate: expandedRc === rc.id ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </motion.div>
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #145e6e, #0d3340)" }}
            >
              R
            </span>
            <span className="text-sm font-semibold text-slate-700 truncate">{rc.title}</span>
            <span className="ml-auto text-xs text-slate-400 shrink-0">
              {rc.definingObjectives.length} obj
            </span>
          </button>
          <AnimatePresence>
            {expandedRc === rc.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {rc.definingObjectives.map((obj, objIdx) => (
                  <div key={obj.id} className={objIdx > 0 ? "border-t border-slate-50" : ""}>
                    <button
                      className="w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-left hover:bg-slate-50 transition-colors group"
                      onClick={() => setExpandedObj(expandedObj === obj.id ? null : obj.id)}
                    >
                      <motion.div
                        animate={{ rotate: expandedObj === obj.id ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="shrink-0"
                      >
                        <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </motion.div>
                      <span className="text-xs font-medium text-slate-600 truncate">{obj.title}</span>
                      <span className="ml-auto text-xs text-slate-400 shrink-0">
                        {obj.outcomes.length}
                      </span>
                    </button>
                    <AnimatePresence>
                      {expandedObj === obj.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          {obj.outcomes.map((o) => (
                            <button
                              key={o.id}
                              onClick={() => { setSelectedId(o.id); onSelect(o.id); }}
                              className={`w-full flex items-center gap-2.5 pl-14 pr-3 py-2 text-left transition-colors ${
                                selectedId === o.id
                                  ? "bg-[#0f4c5c]/8 text-[#0f4c5c]"
                                  : "hover:bg-blue-50 text-slate-600 hover:text-blue-700"
                              }`}
                            >
                              {selectedId === o.id ? (
                                <svg className="w-3.5 h-3.5 text-[#0f4c5c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757" />
                                </svg>
                              )}
                              <span className="text-xs truncate">{o.title}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
