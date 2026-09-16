import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "outline" | "dark";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-card hover:bg-accent-dark font-semibold",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  dark: "bg-ink text-paper hover:bg-accent",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-[17px]",
};

type Props = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
