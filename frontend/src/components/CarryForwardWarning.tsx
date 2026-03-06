import { motion } from "framer-motion";
import type { CommitItem } from "../types";

interface Props {
  item: CommitItem;
  onDelete: () => void;
  onEdit: () => void;
  onClose: () => void;
}

export function CarryForwardWarning({ item, onDelete, onEdit, onClose }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h3 className="text-lg font-bold text-red-700">Resolve Stale Task</h3>
        <p className="text-sm text-gray-600">
          <strong>&ldquo;{item.title}&rdquo;</strong> has been carried forward{" "}
          <strong>{item.carryForwardCount} times</strong>. You must resolve it before locking this commit.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Resize
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
          >
            Reassign
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
