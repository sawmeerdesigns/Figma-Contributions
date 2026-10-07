// Reads the hex colour tokens from globals.css (Light in `:root`, Dark in `:root[data-theme="dark"]`),
// so the contrast test and the SVG export use exactly the colours the app shows.
export type ThemeTokens = Record<string, string>;

export function readThemeTokens(css: string): { light: ThemeTokens; dark: ThemeTokens } {
  const tokens = (block: string): ThemeTokens =>
    Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
  const light = tokens(css.match(/:root \{([^}]*)\}/)?.[1] ?? "");
  const dark = { ...light, ...tokens(css.match(/:root\[data-theme="dark"\] \{([^}]*)\}/)?.[1] ?? "") };
  return { light, dark };
}
