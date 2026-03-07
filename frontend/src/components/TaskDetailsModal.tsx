import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CommitItem } from "../types";
import { formatEffort, formatImpact } from "../utils/metrics";
import { AuditTimeline } from "./AuditTimeline";
import { StatusBadge } from "./StatusBadge";
import type { CommitStatus } from "../types";

const CHESS_BG: Record<string, string> = {
  STRATEGIC: "bg-indigo-50 text-indigo-700",
  TACTICAL: "bg-emerald-50 text-emerald-700",
  OPERATIONAL: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-gray-100 text-gray-600",
};

const RISK_BADGE: Record<string, string> = {
  BLOCKED: "bg-red-100 text-red-700",
  AT_RISK: "bg-orange-100 text-orange-700",
};

interface MockNote {
  id: number;
  text: string;
  createdAt: string;
}

interface MockAttachment {
  id: number;
  name: string;
  progress: number;
}

interface Props {
  item: CommitItem;
  commitStatus: CommitStatus;
  onClose: () => void;
}

let noteIdCounter = 0;
let attachIdCounter = 0;

export function TaskDetailsModal({ item, commitStatus, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<MockNote[]>([]);
  const [attachments, setAttachments] = useState<MockAttachment[]>([]);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((prev) => [
      { id: ++noteIdCounter, text: noteText.trim(), createdAt: new Date().toLocaleString() },
      ...prev,
    ]);
    setNoteText("");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((f) => {
      const id = ++attachIdCounter;
      setAttachments((prev) => [...prev, { id, name: f.name, progress: 0 }]);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, progress: Math.min(100, Math.round(progress)) } : a))
        );
      }, 300);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const id = ++attachIdCounter;
      setAttachments((prev) => [...prev, { id, name: f.name, progress: 0 }]);
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setAttachments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, progress: Math.min(100, Math.round(progress)) } : a))
        );
      }, 300);
    });
    e.target.value = "";
  };

  return (
    <motion.div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <motion.div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        role="dialog"
        aria-label="Task details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Task Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] divide-x divide-slate-200 overflow-y-auto max-h-[calc(90vh-60px)]">
          {/* Left column: task info */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Title + description */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.chessCategory && (
                <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${CHESS_BG[item.chessCategory] ?? "bg-gray-100 text-gray-600"}`}>
                  {item.chessCategory}
                </span>
              )}
              <StatusBadge status={commitStatus} />
              {item.riskFlag && (
                <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${RISK_BADGE[item.riskFlag]}`}>
                  {item.riskFlag === "BLOCKED" ? "BLOCKED" : "AT RISK"}
                </span>
              )}
              {item.carryForwardCount > 0 && (
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-purple-100 text-purple-700">
                  CF: {item.carryForwardCount}/3
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Effort</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">
                  {item.effortEstimate != null ? formatEffort(item.effortEstimate) : "Not set"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Impact</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">
                  {item.impactEstimate != null ? formatImpact(item.impactEstimate) : "Not set"}
                </p>
              </div>
            </div>

            {/* Outcome link */}
            {item.outcomeTitle && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-500 uppercase tracking-wide">Linked Outcome</p>
                <p className="text-sm font-medium text-blue-700 mt-0.5">{item.outcomeTitle}</p>
              </div>
            )}

            {/* Risk note */}
            {item.riskNote && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-500 uppercase tracking-wide">Risk Note</p>
                <p className="text-sm text-red-700 mt-0.5">{item.riskNote}</p>
              </div>
            )}

            {/* Mock Notes */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes</h4>
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none resize-none"
                  rows={2}
                />
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  className="self-end rounded-lg bg-[#0f4c5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#145e6e] disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              {notes.length > 0 && (
                <div className="mt-2 space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                      <p className="text-slate-700">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.createdAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mock Attachments */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Attachments</h4>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-[#0f4c5c] transition-colors"
              >
                <p className="text-sm text-slate-400">
                  Drop files here or{" "}
                  <label className="text-[#0f4c5c] cursor-pointer hover:underline">
                    browse
                    <input type="file" className="hidden" multiple onChange={handleFileSelect} />
                  </label>
                </p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 truncate">{a.name}</span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">
                          {a.progress === 100 ? "Done" : `${a.progress}%`}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0f4c5c] rounded-full transition-all duration-300"
                          style={{ width: `${a.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: audit timeline */}
          <div className="p-6 overflow-y-auto bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Audit History</h4>
            <AuditTimeline commitId={item.weeklyCommitId} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
