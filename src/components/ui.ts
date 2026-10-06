// Shared surface style for the page's cards (graph, stats, projects, loading, error).
export const card = "rounded-xl border border-line bg-surface";

// Fixed locale so server and client render the same string (no hydration mismatch).
export const formatCount = (n: number) => n.toLocaleString("en-US");
