import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRallyCries } from "../api/rcdo";
import { useCommitItemsByOutcome } from "../api/outcomeCommits";
import { ErrorAlert } from "../components/ErrorAlert";

const CHESS_BG: Record<string, string> = {
  STRATEGIC: "bg-indigo-50 text-indigo-700",
  TACTICAL: "bg-emerald-50 text-emerald-700",
  OPERATIONAL: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-gray-100 text-gray-600",
};

function OutcomeCommitItems({ outcomeId }: { outcomeId: string }) {
  const { data: items, isLoading } = useCommitItemsByOutcome(outcomeId);
  const navigate = useNavigate();

  if (isLoading) return <div className="text-xs text-slate-400 mt-1">Loading linked items...</div>;
  if (!items || items.length === 0) return <div className="text-xs text-slate-400 mt-1 italic">No linked commit items</div>;

  return (
    <div className="mt-2 space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-st6-teal-50 transition-colors group"
          onClick={() => navigate(`/commits/${item.weeklyCommitId}?openItem=${item.id}`)}
        >
          {item.chessCategory && (
            <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${CHESS_BG[item.chessCategory] ?? "bg-gray-100 text-gray-600"}`}>
              {item.chessCategory.slice(0, 3)}
            </span>
          )}
          <span className="text-sm text-slate-600 group-hover:text-st6-teal-700 truncate flex-1">
            {item.title}
          </span>
          <svg className="w-3 h-3 text-slate-300 group-hover:text-st6-teal-600 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function RcdoPage() {
  const { data: rallyCries, isLoading, isError, error } = useRallyCries();
  const [expandedRc, setExpandedRc] = useState<Set<string>>(new Set());
  const [expandedObj, setExpandedObj] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load RCDO data"} /></div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">RCDO Browser</h1>
        <p className="text-sm text-slate-500 mt-1">Rally Cries &rarr; Defining Objectives &rarr; Outcomes</p>
      </div>

      <div className="space-y-3">
        {rallyCries?.map((rc) => (
          <div
            key={rc.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-200"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <button
              className="w-full text-left px-5 py-4 font-semibold text-slate-800 hover:bg-slate-50/80 flex items-center gap-3 transition-colors"
              onClick={() => toggle(expandedRc, rc.id, setExpandedRc)}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${expandedRc.has(rc.id) ? "bg-st6-teal-700 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                <svg className={`w-3 h-3 transition-transform duration-200 ${expandedRc.has(rc.id) ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </span>
              <span className="flex-1">{rc.title}</span>
              {expandedRc.has(rc.id) && (
                <span className="text-xs font-medium text-st6-teal-600 bg-st6-teal-50 px-2 py-0.5 rounded-full">
                  {rc.definingObjectives.length} objectives
                </span>
              )}
            </button>

            {expandedRc.has(rc.id) && (
              <div className="pl-8 pr-5 pb-4 space-y-3">
                {rc.description && <p className="text-sm text-slate-500">{rc.description}</p>}
                {rc.definingObjectives.map((obj) => (
                  <div key={obj.id} className="border-l-2 border-st6-teal-200 pl-4">
                    <button
                      className="text-left font-medium text-slate-700 hover:text-st6-teal-700 flex items-center gap-2 transition-colors group"
                      onClick={() => toggle(expandedObj, obj.id, setExpandedObj)}
                    >
                      <svg className={`w-3 h-3 text-slate-400 group-hover:text-st6-teal-500 transition-transform duration-150 ${expandedObj.has(obj.id) ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                      {obj.title}
                    </button>
                    {expandedObj.has(obj.id) && (
                      <div className="ml-5 mt-2 space-y-1.5">
                        {obj.description && <p className="text-xs text-slate-400">{obj.description}</p>}
                        {obj.outcomes.map((o) => (
                          <div key={o.id}>
                            <div className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 mt-1.5" />
                              {o.title}
                            </div>
                            <OutcomeCommitItems outcomeId={o.id} />
                          </div>
                        ))}
                        {obj.outcomes.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No outcomes defined</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
