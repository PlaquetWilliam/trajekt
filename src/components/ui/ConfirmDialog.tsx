"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Les boutons d'action, du plus attendu au moins attendu. */
  children: ReactNode;
};

/**
 * Fenêtre de confirmation : le clavier reste enfermé dedans tant qu'elle est
 * ouverte, Échap et le fond la referment, et le focus revient ensuite sur le
 * bouton qui l'a ouverte.
 */
export function ConfirmDialog({ open, onClose, title, description, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const reduce = useReducedMotion();
  const id = useId();
  const titleId = `${id}-titre`;
  const descId = `${id}-description`;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg rounded border border-line bg-card p-7 shadow-[0_24px_60px_-24px_rgb(31_28_23/0.5)] focus:outline-none md:p-8"
          >
            <h2 id={titleId} className="font-serif text-[32px] leading-none md:text-[36px]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-3.5 text-[15px] leading-relaxed text-muted">
                {description}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-2.5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const tones = {
  primary: "bg-accent font-semibold text-card hover:bg-accent-dark",
  outline: "border border-ink text-ink hover:bg-ink hover:text-paper",
  danger: "border border-error text-error hover:bg-error hover:text-card",
  ghost: "text-muted hover:text-ink hover:underline",
} as const;

export function DialogAction({
  tone = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { tone?: keyof typeof tones }) {
  return (
    <button
      type="button"
      className={`inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-base transition-colors duration-200 ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
