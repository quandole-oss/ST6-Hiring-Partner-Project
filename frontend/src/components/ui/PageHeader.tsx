import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, actions, icon }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)", boxShadow: "0 4px 12px rgba(13,51,64,0.25)" }}
          >
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && (
              <span className="inline-flex items-center rounded-full bg-[#0f4c5c]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0f4c5c]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
