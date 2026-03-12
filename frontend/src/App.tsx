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
            <main className="flex-1 ml-16 lg:ml-60 bg-slate-50 min-h-screen">
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
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your workspace preferences and configuration.</p>
      </div>
      <div
        className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Settings coming soon</h3>
        <p className="text-sm text-slate-400">Configuration options will be available in a future update.</p>
      </div>
    </div>
  );
}
