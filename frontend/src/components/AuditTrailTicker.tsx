import { motion } from "framer-motion";
import type { AuditLogEntry } from "../types";

interface Props {
  entries: AuditLogEntry[];
}

export function AuditTrailTicker({ entries }: Props) {
  if (entries.length === 0) return <div className="text-sm text-gray-400">No recent activity.</div>;

  return (
    <div className="space-y-2">
      {entries.slice(0, 10).map((entry, i) => (
        <motion.div
          key={entry.id}
          className={`flex items-start gap-3 text-sm border-l-2 pl-3 ${entry.actionType === "CATEGORY_CHANGE" ? "border-amber-200" : "border-blue-200"}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="flex-1">
            {entry.actionType === "CATEGORY_CHANGE" ? (
              <>
                <span className="font-medium text-gray-700">
                  Category: {entry.oldValue ?? "None"} &rarr; {entry.newValue}
                </span>
                {entry.commitItemTitle && (
                  <span className="text-xs text-gray-500 ml-1">on {entry.commitItemTitle}</span>
                )}
              </>
            ) : (
              <>
                <span className="font-medium text-gray-700">
                  {entry.previousState} &rarr; {entry.newState}
                </span>
                {entry.isManualOverride && (
                  <span className="ml-2 text-xs rounded bg-red-100 text-red-700 px-1.5 py-0.5 font-medium">
                    Override
                  </span>
                )}
              </>
            )}
            <div className="text-xs text-gray-400">
              by {entry.triggeredBy} &middot; {new Date(entry.createdAt).toLocaleString()}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
