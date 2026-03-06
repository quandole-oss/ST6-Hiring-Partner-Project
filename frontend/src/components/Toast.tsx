import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContext, useToastState, useToast } from "../hooks/useToast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useToastState();
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t, i) => {
          const isError = t.message.toLowerCase().includes("failed") || t.message.toLowerCase().includes("error");
          const bg = isError
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-[#0f4c5c]/20 bg-[#0f4c5c]/5 text-[#0f4c5c]";
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1 - (toasts.length - 1 - i) * 0.03,
              }}
              exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-lg cursor-pointer ${bg}`}
              onClick={() => removeToast(t.id)}
            >
              {t.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
