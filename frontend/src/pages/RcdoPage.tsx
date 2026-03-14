import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRallyCries, useCreateRallyCry, useCreateObjective, useCreateOutcome } from "../api/rcdo";
import { useCommitItemsByOutcome } from "../api/outcomeCommits";
import { ErrorAlert } from "../components/ErrorAlert";
import { useToast } from "../hooks/useToast";

const CHESS_BG: Record<string, string> = {
  STRATEGIC: "bg-indigo-50 text-indigo-700",
  TACTICAL: "bg-emerald-50 text-emerald-700",
  OPERATIONAL: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-gray-100 text-gray-600",
};

function InlineCreateForm({
  placeholder,
  onSubmit,
  onCancel,
  isPending,
}: {
  placeholder: string;
  onSubmit: (title: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-st6-teal-500 focus:border-transparent"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        disabled={isPending}
      />
      <button
        className="text-sm font-medium px-3 py-1.5 rounded-lg bg-st6-teal-700 text-white hover:bg-st6-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleSubmit}
        disabled={!value.trim() || isPending}
      >
        {isPending ? "Saving..." : "Save"}
      </button>
      <button
        className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        onClick={onCancel}
        disabled={isPending}
      >
        Cancel
      </button>
    </div>
  );
}

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

  const [showCreateRallyCry, setShowCreateRallyCry] = useState(false);
  const [addingObjectiveTo, setAddingObjectiveTo] = useState<string | null>(null);
  const [addingOutcomeTo, setAddingOutcomeTo] = useState<string | null>(null);

  const createRallyCry = useCreateRallyCry();
  const createObjective = useCreateObjective();
  const createOutcome = useCreateOutcome();
  const { addToast } = useToast();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">RCDO Browser</h1>
          <p className="text-sm text-slate-500 mt-1">Rally Cries &rarr; Defining Objectives &rarr; Outcomes</p>
        </div>
        {!showCreateRallyCry && (
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg bg-st6-teal-700 text-white hover:bg-st6-teal-800 transition-colors flex items-center gap-1.5"
            onClick={() => setShowCreateRallyCry(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Rally Cry
          </button>
        )}
      </div>

      <div className="space-y-3">
        {showCreateRallyCry && (
          <InlineCreateForm
            placeholder="Rally Cry title..."
            isPending={createRallyCry.isPending}
            onCancel={() => setShowCreateRallyCry(false)}
            onSubmit={(title) => {
              createRallyCry.mutate({ title }, {
                onSuccess: () => {
                  setShowCreateRallyCry(false);
                  addToast("Rally Cry created");
                },
                onError: (err) => {
                  addToast((err as Error)?.message ?? "Failed to create Rally Cry");
                },
              });
            }}
          />
        )}

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

                        {addingOutcomeTo === obj.id ? (
                          <InlineCreateForm
                            placeholder="Outcome title..."
                            isPending={createOutcome.isPending}
                            onCancel={() => setAddingOutcomeTo(null)}
                            onSubmit={(title) => {
                              createOutcome.mutate({ definingObjectiveId: obj.id, title }, {
                                onSuccess: () => {
                                  setAddingOutcomeTo(null);
                                  addToast("Outcome created");
                                },
                                onError: (err) => {
                                  addToast((err as Error)?.message ?? "Failed to create Outcome");
                                },
                              });
                            }}
                          />
                        ) : (
                          <button
                            className="text-xs font-medium text-st6-teal-600 hover:text-st6-teal-800 mt-1 flex items-center gap-1 transition-colors"
                            onClick={() => setAddingOutcomeTo(obj.id)}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Outcome
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {addingObjectiveTo === rc.id ? (
                  <InlineCreateForm
                    placeholder="Defining Objective title..."
                    isPending={createObjective.isPending}
                    onCancel={() => setAddingObjectiveTo(null)}
                    onSubmit={(title) => {
                      createObjective.mutate({ rallyCryId: rc.id, title }, {
                        onSuccess: (newObj) => {
                          setAddingObjectiveTo(null);
                          addToast("Objective created");
                          // Auto-expand the new objective
                          setExpandedObj((prev) => new Set(prev).add(newObj.id));
                        },
                        onError: (err) => {
                          addToast((err as Error)?.message ?? "Failed to create Objective");
                        },
                      });
                    }}
                  />
                ) : (
                  <button
                    className="text-xs font-medium text-st6-teal-600 hover:text-st6-teal-800 flex items-center gap-1 transition-colors"
                    onClick={() => setAddingObjectiveTo(rc.id)}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Objective
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
