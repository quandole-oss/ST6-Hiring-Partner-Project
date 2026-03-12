import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function Row({
  label,
  description,
  action,
}: {
  label: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{description}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{title}</h2>;
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const soon = () => addToast("Coming soon");

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your workspace preferences and configuration.</p>
      </div>

      <motion.div
        className="grid gap-5"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Profile */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="Profile" />
          <Card>
            <Row
              label="Display name"
              description={user?.name ?? "—"}
              action={<Button variant="secondary" size="sm" onClick={soon}>Edit Profile</Button>}
            />
            <Row
              label="Role"
              description={user?.role ?? "—"}
            />
            <Row
              label="Password"
              description="••••••••"
              action={<Button variant="secondary" size="sm" onClick={soon}>Change Password</Button>}
            />
          </Card>
        </motion.div>

        {/* Team Configuration */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="Team Configuration" />
          <Card>
            <Row
              label="Auto-lock schedule"
              description="Mondays at 10:00 AM UTC"
              action={<Button variant="secondary" size="sm" onClick={soon}>Edit</Button>}
            />
            <Row
              label="Carry-forward limit"
              description="3 weeks"
              action={<Button variant="secondary" size="sm" onClick={soon}>Edit</Button>}
            />
            <Row
              label="Team timezone"
              description="UTC"
              action={<Button variant="secondary" size="sm" onClick={soon}>Edit</Button>}
            />
          </Card>
        </motion.div>

        {/* AI Features */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="AI Features" />
          <Card>
            <Row
              label="AI Summaries"
              description="Enabled"
              action={<Button variant="secondary" size="sm" onClick={soon}>Toggle</Button>}
            />
            <Row
              label="AI Q&A"
              description="Enabled"
              action={<Button variant="secondary" size="sm" onClick={soon}>Toggle</Button>}
            />
            <Row
              label="Model"
              description="Claude Sonnet 4.5"
            />
          </Card>
        </motion.div>

        {/* Export & Notifications */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="Export & Notifications" />
          <Card>
            <Row
              label="Default email recipients"
              description="No recipients configured"
              action={<Button variant="secondary" size="sm" onClick={soon}>Configure</Button>}
            />
            <Row
              label="Slack integration"
              description="Coming soon"
              action={<Button variant="secondary" size="sm" onClick={soon}>Connect</Button>}
            />
            <Row
              label="Email digest"
              description="Not configured"
              action={<Button variant="secondary" size="sm" onClick={soon}>Set up</Button>}
            />
          </Card>
        </motion.div>

        {/* Display Preferences */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="Display Preferences" />
          <Card>
            <Row
              label="Dashboard layout"
              description="Default"
              action={<Button variant="secondary" size="sm" onClick={soon}>Customize</Button>}
            />
            <Row
              label="Compact rows"
              description="Off"
              action={<Button variant="secondary" size="sm" onClick={soon}>Toggle</Button>}
            />
            <Row
              label="Default sort"
              description="Newest first"
              action={<Button variant="secondary" size="sm" onClick={soon}>Configure</Button>}
            />
          </Card>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div variants={fadeUp}>
          <SectionTitle title="Data & Privacy" />
          <Card>
            <Row
              label="Export my data"
              description="Download all your data as JSON"
              action={<Button variant="secondary" size="sm" onClick={soon}>Export</Button>}
            />
            <Row
              label="Clear local cache"
              description="Remove cached data from this browser"
              action={<Button variant="secondary" size="sm" onClick={soon}>Clear</Button>}
            />
            <Row
              label="Sign out"
              description="End your current session"
              action={<Button variant="danger" size="sm" onClick={logout}>Sign Out</Button>}
            />
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
