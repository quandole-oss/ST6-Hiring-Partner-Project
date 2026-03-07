import { Routes, Route } from "react-router-dom";
import { CommitEditorPage } from "./pages/CommitEditorPage";
import { ReconciliationPage } from "./pages/ReconciliationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PipelinePage } from "./pages/PipelinePage";
import { RcdoPage } from "./pages/RcdoPage";
import { LoginPage } from "./pages/LoginPage";
import { Sidebar } from "./components/layout/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-16 lg:ml-56 bg-slate-50 min-h-screen">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/editor" element={<CommitEditorPage />} />
                <Route path="/commits/:id" element={<CommitEditorPage />} />
                <Route path="/commits/:id/reconcile" element={<ReconciliationPage />} />
                <Route path="/pipeline" element={<PipelinePage />} />
                <Route path="/dashboard/:teamId" element={<DashboardPage />} />
                <Route path="/rcdo" element={<RcdoPage />} />
                <Route path="/settings" element={<SettingsPlaceholder />} />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function SettingsPlaceholder() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
      <p className="text-sm text-slate-500 mt-2">Settings page coming soon.</p>
    </div>
  );
}
