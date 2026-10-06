# Security Policy

## Supported versions

Only the latest commit on `main` is supported. There are no release branches yet.

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Email **sawmeerdesigns@gmail.com** with:

- what the problem is and what an attacker could do with it
- steps to reproduce, or a proof of concept
- the commit you tested

You should get a reply within 7 days. Once a fix is ready, it's released and the report is credited in the [changelog](CHANGELOG.md), unless you'd rather stay anonymous.

## What's in scope

This is a local app, so the main risk is your **Figma personal access token** or your **activity data** leaking. Reports about any of these are especially welcome:

- the token reaching anything other than `https://api.figma.com`, the browser bundle, logs or `data/`
- the Next.js app reading `.env.local` or the token
- the sync writing data outside `data/`, or the page reading files other than `data/contributions.json` and `data/demo.json`
- real data or tokens ending up in the repository, a build, or a public deployment

Out of scope: vulnerabilities in Figma's own API or in dependencies with no impact on this project (report those upstream), and problems that require someone who already has access to your machine.

## Keeping your token safe

- Keep it in `.env.local` only. That file is gitignored; never commit it or paste it into issues.
- Give it only the scopes listed in the [README](README.md#figma-token-setup). All of them are read-only.
- Never rename the variables with a `NEXT_PUBLIC_` prefix: Next.js would ship the token to every visitor.
- If a token might be exposed, revoke it in Figma (**Settings → Security → Personal access tokens**) and generate a new one.
