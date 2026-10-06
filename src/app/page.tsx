export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-3 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Figma Contributions</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        A GitHub-style contribution graph for your Figma activity. Run{" "}
        <code className="font-mono">npm run sync</code> to fetch your data.
      </p>
    </main>
  );
}
