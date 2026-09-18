import type { ComponentProps } from "react";

type Option = { value: string; label: string };

type Props = Omit<ComponentProps<"select">, "children"> & {
  label: string;
  options: readonly Option[];
  placeholder?: string;
};

/** Liste déroulante native (accessible au clavier et aux lecteurs d'écran), habillée. */
export function Select({ label, options, placeholder, id, className = "", ...props }: Props) {
  const selectId = id ?? `select-${props.name}`;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-[13px] text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-11 w-full appearance-none rounded border border-line bg-card pr-10 pl-3.5 text-[15px] text-ink transition-colors hover:border-meta"
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
