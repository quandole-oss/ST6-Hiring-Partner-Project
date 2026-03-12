import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "../components/Toast";
import { AuthProvider } from "../contexts/AuthContext";
import { TeamProvider } from "../contexts/TeamContext";
import type { ReactElement, ReactNode } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

function createWrapper(initialEntries = ["/"]) {
  return function Wrapper({ children }: WrapperProps) {
    const qc = createTestQueryClient();
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>
            <TeamProvider>
              <ToastProvider>{children}</ToastProvider>
            </TeamProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialEntries?: string[] }
) {
  const { initialEntries, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(initialEntries) as React.ComponentType,
    ...renderOptions,
  });
}
