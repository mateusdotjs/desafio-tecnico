import type { ReactNode } from "react";

export const formControlClassName =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {children}
    </div>
  );
}
