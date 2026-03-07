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
          className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors group"
          onClick={() => navigate(`/commits/${item.weeklyCommitId}?openItem=${item.id}`)}
        >
          {item.chessCategory && (
            <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${CHESS_BG[item.chessCategory] ?? "bg-gray-100 text-gray-600"}`}>
              {item.chessCategory.slice(0, 3)}
            </span>
          )}
          <span className="text-sm text-slate-600 group-hover:text-[#0f4c5c] truncate flex-1">
            {item.title}
          </span>
          <svg className="w-3 h-3 text-slate-300 group-hover:text-[#0f4c5c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <h1 className="text-2xl font-bold text-slate-800">RCDO Browser</h1>
        <p className="text-sm text-slate-500 mt-1">Rally Cries &rarr; Defining Objectives &rarr; Outcomes</p>
      </div>

      <div className="space-y-3">
        {rallyCries?.map((rc) => (
          <div key={rc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              className="w-full text-left px-5 py-4 font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              onClick={() => toggle(expandedRc, rc.id, setExpandedRc)}
            >
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedRc.has(rc.id) ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              {rc.title}
            </button>

            {expandedRc.has(rc.id) && (
              <div className="pl-8 pr-5 pb-4 space-y-3">
                {rc.description && <p className="text-sm text-slate-500">{rc.description}</p>}
                {rc.definingObjectives.map((obj) => (
                  <div key={obj.id} className="border-l-2 border-[#0f4c5c]/30 pl-4">
                    <button
                      className="text-left font-medium text-slate-700 hover:text-[#0f4c5c] flex items-center gap-2 transition-colors"
                      onClick={() => toggle(expandedObj, obj.id, setExpandedObj)}
                    >
                      <svg className={`w-3 h-3 text-slate-400 transition-transform ${expandedObj.has(obj.id) ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
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
