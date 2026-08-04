# Git Workflow

- Use Git for implementation work.
- Inspect `git status --short` before non-trivial edits.
- If the worktree is dirty, identify whether existing changes overlap the planned edit scope before changing files.
- Continue through unrelated dirty files without staging them; stop or ask when the same file has user changes whose intent cannot be preserved with a minimal edit.
- Keep commits granular and scoped to one meaningful unit.
- Do not stage unrelated files.
- Do not rewrite history unless explicitly requested.
- Preserve user changes you did not make.
- Commit after successful validation.
- Do not push unless the user or repository policy explicitly authorizes it.
- For completed active-plan work, archive the plan before the final report when lifecycle scripts are enabled.
- Completion reports must include the commit hash, or the exact dirty-worktree blocker when a commit cannot be made.
