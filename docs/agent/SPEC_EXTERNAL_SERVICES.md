# External Services

This policy is optional. Generated settings:

- MCP policy: `false`
- Linear sync policy: `false`
- Graph memory policy: `false`

## Baseline

- External reads and writes are not required for normal repository work.
- External writes require explicit user intent or a documented opt-in lifecycle command.
- Keep credentials in environment variables or platform secret stores, never in repository files.
- Dry-run or local payload validation must not perform external writes.
- Local repository files, tests, validation output, and Git history remain the source of truth unless a project-specific spec says otherwise.
- If an external service is unavailable, continue with the local workflow and record the fallback only when it changes scope, confidence, or validation.

## Integration Checklist

When enabling an external-service option in this repository:

1. Confirm the matching Copier answer is `true` in `.copier-answers.yml`.
2. Add project-local connection details to `docs/agent/SPEC_EXTERNAL_SERVICES.md` or a linked project spec.
3. Store credentials only in environment variables, local secret managers, or platform secret stores.
4. Define which commands are dry-run, read-capable, and write-capable before using them.
5. Add deterministic validation for generated payloads, local manifests, or sync metadata before any write-capable flow.
6. Keep local-only commands useful when the external service is offline or intentionally disabled.

## MCP Policy

MCP-specific workflow is disabled by this template answer. Keep the repository workflow local. To add MCP later, enable `use_mcp_policy`, document server names and side-effect boundaries, and keep all credentials outside the repository.

## Linear Sync Policy

Linear sync is disabled by this template answer. Keep plan lifecycle local unless the project adds an explicit Linear module. To add Linear later, define credentials, team/status/label mapping, dry-run behavior, duplicate-prevention markers, and write-capable lifecycle commands before creating or updating issues.

## Graph Memory Policy

Graph memory is disabled by this template answer. Do not assume project graph state exists. To add graph memory later, define the project identifier, schema, read/write rules, credential source, and human review boundary before any write path is used.
