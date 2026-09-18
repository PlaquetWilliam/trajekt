import { REQUEST_STATUS, type RequestStatus } from "@/lib/request-status";

const tones = {
  neutral: "bg-[#e9e2d5] text-muted",
  warning: "bg-[#f2e3c6] text-[#6e420b]",
  success: "bg-[#dfe9dc] text-success",
  draft: "border border-dashed border-line text-muted",
} as const;

export function StatusBadge({ status }: { status: RequestStatus | "local-draft" }) {
  const { label, tone } =
    status === "local-draft" ? { label: "Brouillon", tone: "draft" as const } : REQUEST_STATUS[status];
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
