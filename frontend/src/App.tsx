import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { Sidebar } from "./components/layout/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

const CommitEditorPage = lazy(() => import("./pages/CommitEditorPage").then(m => ({ default: m.CommitEditorPage })));
const ReconciliationPage = lazy(() => import("./pages/ReconciliationPage").then(m => ({ default: m.ReconciliationPage })));
const PipelinePage = lazy(() => import("./pages/PipelinePage").then(m => ({ default: m.PipelinePage })));
const RcdoPage = lazy(() => import("./pages/RcdoPage").then(m => ({ default: m.RcdoPage })));

function LoadingFallback() {
  return <div className="flex items-center justify-center min-h-screen text-slate-500">Loading...</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 ml-16 lg:ml-56 bg-slate-50 min-h-screen">
              <Suspense fallback={<LoadingFallback />}>
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
              </Suspense>
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
