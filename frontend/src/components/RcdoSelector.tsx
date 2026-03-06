import { useState } from "react";
import { useRallyCries } from "../api/rcdo";

interface Props {
  onSelect: (outcomeId: string) => void;
}

export function RcdoSelector({ onSelect }: Props) {
  const { data: rallyCries, isLoading } = useRallyCries();
  const [expandedRc, setExpandedRc] = useState<string | null>(null);
  const [expandedObj, setExpandedObj] = useState<string | null>(null);

  if (isLoading) return <div className="text-sm text-gray-400">Loading RCDO...</div>;

  return (
    <div className="border rounded-lg p-2 max-h-64 overflow-y-auto text-sm">
      {rallyCries?.map((rc) => (
        <div key={rc.id}>
          <button
            className="w-full text-left font-medium px-2 py-1 hover:bg-gray-50 rounded"
            onClick={() => setExpandedRc(expandedRc === rc.id ? null : rc.id)}
          >
            {expandedRc === rc.id ? "v" : ">"} {rc.title}
          </button>
          {expandedRc === rc.id &&
            rc.definingObjectives.map((obj) => (
              <div key={obj.id} className="ml-4">
                <button
                  className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-gray-700"
                  onClick={() => setExpandedObj(expandedObj === obj.id ? null : obj.id)}
                >
                  {expandedObj === obj.id ? "v" : ">"} {obj.title}
                </button>
                {expandedObj === obj.id &&
                  obj.outcomes.map((o) => (
                    <button
                      key={o.id}
                      className="block ml-8 px-2 py-1 text-left w-full hover:bg-blue-50 rounded text-blue-700"
                      onClick={() => onSelect(o.id)}
                    >
                      {o.title}
                    </button>
                  ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
