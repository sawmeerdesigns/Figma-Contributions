"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

// The theme lives on <html data-theme>, set before first paint by the script in layout.tsx.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const isDarkNow = () => document.documentElement.dataset.theme === "dark";

// Icon Button: Neutral, Ghost. 40×40 target (design.md Target sizes). The icon shows the theme
// you'd switch to, swapped by CSS so the server render never mismatches.
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false);
  const toggle = () => {
    const next = isDarkNow() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {} // private mode etc.: the switch still works, it just isn't remembered
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark mode"
      aria-pressed={dark}
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}
