// Page container (design.md Layout): up to 1200px; margins 16 / 24 / 32 and section spacing
// Jumper/64-48 (24 / 48 / 64) on phone / tablet / desktop. It hugs its content (the heatmap is
// narrower than 1200px) so the column stays centred. Used by the page, loading and error.
export const page = "mx-auto flex w-fit max-w-[min(100%,1200px)] flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-12 lg:px-8 lg:py-16";

// Card (Basic Card): Surface/Raised, Border/Default, Radius/Large, plus the Light-mode elevation.
export const card = "rounded-xl border border-line bg-surface shadow-card";

// Fixed locale so server and client render the same string (no hydration mismatch).
export const formatCount = (n: number) => n.toLocaleString("en-US");
