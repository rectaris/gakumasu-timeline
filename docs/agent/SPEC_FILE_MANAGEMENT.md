# File Management

## Read Before Edit

- Read the target file and nearby conventions before changing it.
- Prefer `rg` and targeted reads over broad directory sweeps.
- Do not sweep all `docs/agent/` files for normal startup; use `spec-index.yaml`.

## Edit Policy

- Keep changes scoped to the task.
- Do not revert user changes unless explicitly asked.
- Avoid destructive operations.
- Use Git to inspect changes before cleanup.
- Keep generated, cache, build, dependency, and local tool folders out of commits.
<<<<<<< before updating
- When a target file already has user edits, read the existing diff first.
- If the diff is unrelated and a minimal non-overlapping edit is clear, preserve it and continue.
- If the same lines or behavior are affected, stop for user direction or split the work so the user change remains intact.
=======
- Keep `.agent-logs/` and `.agent-artifacts/` local-only unless the repository owner explicitly approves a reviewed exception.
>>>>>>> after updating

## Backup And Generated Files

- Inspect backup files such as `*.backup`, `*.orig`, and `*.pre-*` before deleting them.
- Preserve or report useful prior state before cleanup.
- Do not create ad hoc backup files beside runtime artifacts unless a repository rule explicitly permits it.

## Secrets

- Do not read or print likely secret-bearing files without explicit need.
- Never commit credentials, tokens, private keys, `.env` contents, or local environment files.
- Keep external service credentials in environment variables or platform secret stores.
<<<<<<< before updating
- If secret material is discovered, do not quote it in reports or helper prompts; isolate the affected file path and ask for rotation or cleanup guidance when needed.
=======
- Redact secret-like content from raw agent logs and local artifacts before summarizing or sharing them.
>>>>>>> after updating
