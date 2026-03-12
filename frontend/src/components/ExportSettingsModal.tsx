import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useExportSettings, useUpdateExportSettings, useSendEmail } from "../api/export";
import { useToast } from "../hooks/useToast";

interface Props {
  teamId: string;
  onClose: () => void;
}

export function ExportSettingsModal({ teamId, onClose }: Props) {
  const { data: settings } = useExportSettings(teamId);
  const updateSettings = useUpdateExportSettings(teamId);
  const sendEmail = useSendEmail(teamId);
  const { addToast } = useToast();

  const [emailRecipients, setEmailRecipients] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [attachPdf, setAttachPdf] = useState(true);

  useEffect(() => {
    if (settings) {
      setEmailRecipients(settings.defaultEmailRecipients ?? "");
      setSlackWebhook(settings.slackWebhookUrl ?? "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      { id: settings?.id ?? null, teamId, defaultEmailRecipients: emailRecipients, slackWebhookUrl: slackWebhook },
      {
        onSuccess: () => addToast("Settings saved"),
        onError: () => addToast("Failed to save settings"),
      }
    );
  };

  const handleSend = () => {
    const recipients = sendTo.split(",").map((s) => s.trim()).filter(Boolean);
    if (recipients.length === 0) {
      addToast("Enter at least one email address");
      return;
    }
    sendEmail.mutate(
      { recipients, attachPdf },
      {
        onSuccess: (result) => { addToast(result.message); onClose(); },
        onError: () => addToast("Failed to send email"),
      }
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Export Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Default Email Recipients</label>
            <input
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Slack Webhook URL <span className="text-slate-300">(Coming soon)</span></label>
            <input
              type="text"
              placeholder="https://hooks.slack.com/..."
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-400 outline-none cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="w-full rounded-lg bg-[#0f4c5c] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#145e6e] disabled:opacity-50 transition-colors"
          >
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Send Email Now</h3>
          <input
            type="text"
            placeholder="Recipient emails (comma-separated)"
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={attachPdf}
              onChange={(e) => setAttachPdf(e.target.checked)}
              className="rounded border-slate-300 text-[#0f4c5c] focus:ring-[#0f4c5c]"
            />
            Attach PDF report
          </label>
          <button
            onClick={handleSend}
            disabled={sendEmail.isPending || !sendTo.trim()}
            className="w-full rounded-lg bg-[#f57c00] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e65100] disabled:opacity-50 transition-colors"
          >
            {sendEmail.isPending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
