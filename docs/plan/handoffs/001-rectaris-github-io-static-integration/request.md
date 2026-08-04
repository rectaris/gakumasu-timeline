# Handoff Request: rectaris.github.io Timeline Link Integration

## Prompt For The rectaris.github.io Coding Agent

You are working in the `rectaris.github.io` repository. Integrate the `gakumasu-timeline` app as the public Timeline tool at:

```text
https://rectaris.github.io/timeline/
```

Context from `gakumasu-timeline`:

- The app production Vite `base` has been changed from `/gakumasu-timeline/` to `/timeline/`.
- The app README and deploy documentation now treat `/timeline/` as the canonical public path.
- The app build should emit asset URLs under `/timeline/`.
- Do not assume the old `/gakumasu-timeline/` path remains canonical.

Your task:

1. Search `rectaris.github.io` for links, navigation items, cards, redirects, docs, or metadata that point to `https://rectaris.github.io/gakumasu-timeline/` or `/gakumasu-timeline/`.
2. Update the public Timeline entry point to `https://rectaris.github.io/timeline/` or `/timeline/`, matching the local convention in that repository.
3. If the site has a tool index, portal card, sitemap, JSON-LD, manifest, or redirect table, update the Timeline entry there as well.
4. Preserve unrelated links and content.
5. Do not deploy unless the user explicitly asks.

Validation to run in `rectaris.github.io`:

- Run the repository's normal build or verification command.
- Inspect generated links, or preview locally if that repository supports preview.
- Report any remaining references to `/gakumasu-timeline/` and whether they are intentional compatibility redirects.

Expected final report:

- Files changed in `rectaris.github.io`.
- Whether public-path links now point to `/timeline/`.
- Validation commands and results.
- Commit hash, or the exact blocker if a commit cannot be made.
