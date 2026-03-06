import { motion } from "framer-motion";
import { useAuditLog } from "../api/audit";
import type { AuditLogEntry } from "../types";

interface Props {
  commitId: string;
}

function EntryDescription({ entry }: { entry: AuditLogEntry }) {
  if (entry.actionType === "CATEGORY_CHANGE") {
    return (
      <>
        <span className="font-medium text-gray-700">
          Category: {entry.oldValue ?? "None"} &rarr; {entry.newValue}
        </span>
        {entry.commitItemTitle && (
          <span className="text-xs text-gray-500 ml-1">on {entry.commitItemTitle}</span>
        )}
      </>
    );
  }
  return (
    <>
      <span className="font-medium text-gray-700">
        {entry.previousState} &rarr; {entry.newState}
      </span>
      {entry.isManualOverride && (
        <span className="text-xs rounded bg-red-100 text-red-700 px-1.5 py-0.5 font-medium">
          Override
        </span>
      )}
    </>
  );
}

export function AuditTimeline({ commitId }: Props) {
  const { data: entries, isLoading } = useAuditLog(commitId);

  if (isLoading) return <div className="text-sm text-gray-400">Loading history...</div>;
  if (!entries || entries.length === 0) return <div className="text-sm text-gray-400">No history yet.</div>;

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          className="flex items-start gap-3 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${entry.actionType === "CATEGORY_CHANGE" ? "bg-amber-500" : "bg-blue-500"}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <EntryDescription entry={entry} />
            </div>
            <div className="text-xs text-gray-400">
              by {entry.triggeredBy} &middot; {new Date(entry.createdAt).toLocaleString()}
            </div>
            {entry.notes && <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
