# Mermaid diagram parity CI

GitHub renders Mermaid only inside fenced ` ```mermaid ` blocks in Markdown. To keep diagrams in separate `.mmd` files **and** render on GitHub, pair them with a source comment and enable the mermaid-sync check.

## Pairing convention

Place an HTML comment immediately above the fence:

```markdown
<!-- mermaid-source: profile/docs/architecture/diagrams/ecosystem-context.mmd -->
```mermaid
flowchart TB
  A --> B
```
```

- Path is **repo-root-relative** (not relative to the `.md` file).
- The checker also accepts **legacy** paths relative to the `.md` file when that file exists (migration).
- Unpaired embeds and orphan `.mmd` files are ignored (not checked).

When CI runs in the `.github` repo itself, it uses scripts from the PR checkout so checker fixes can self-test before they land on `main`. Other repos still load scripts from `Bardie-radio/.github` (`ci_ref`, default `main`).

## What happens on a PR

When a paired embed and `.mmd` file differ:

1. The **Mermaid sync** check fails (blocks merge).
2. A bot comment lists each conflict with copy-paste commands.
3. Reply on the PR **Conversation** tab (or submit a PR review comment) with your choice, for example:
   - `/mermaid-sync use-mmd docs/architecture/02-ecosystem-context.md` — keep `.mmd`, rewrite both sides from it
   - `/mermaid-sync use-md docs/architecture/02-ecosystem-context.md` — keep the embed, rewrite both sides from it
4. A follow-up workflow commits to the PR branch and checks re-run. When the check goes green after a prior failure, the bot posts a separate **resolved** comment (the failure comment is left for history).

Resolve always writes the chosen body into **both** the embed and the `.mmd` (normalized). Git only stages paths whose bytes actually change, so a side that was already identical may stay out of that commit.

Multiple commands in one comment are applied in order. Multiple paired diagrams on one page use a block index:

```text
/mermaid-sync use-mmd docs/architecture/04-user-journeys.md#0
```

> Comment-triggered resolve always runs the workflow from the repo **default branch**. Merge workflow changes to `main` before relying on new trigger types.

## Enable in a Bardie repo

Add [`.github/workflows/mermaid-sync.yml`](../.github/workflows/mermaid-sync.yml) (or copy from `kithara`):

```yaml
name: Mermaid sync

on:
  pull_request:
    paths:
      - docs/**
  issue_comment:
    types: [created]
  pull_request_review:
    types: [submitted]

jobs:
  check:
    if: github.event_name == 'pull_request'
    uses: Bardie-radio/.github/.github/workflows/reusable-mermaid-check.yml@main
    permissions:
      contents: read
      pull-requests: write

  resolve:
    if: |
      (
        github.event_name == 'issue_comment' &&
        github.event.issue.pull_request &&
        contains(github.event.comment.body, '/mermaid-sync')
      ) || (
        github.event_name == 'pull_request_review' &&
        github.event.review.state == 'commented' &&
        github.event.review.body != '' &&
        contains(github.event.review.body, '/mermaid-sync')
      )
    uses: Bardie-radio/.github/.github/workflows/reusable-mermaid-resolve.yml@main
    permissions:
      contents: write
      pull-requests: write
```

Scripts live in this repo under [`scripts/mermaid-sync/`](../scripts/mermaid-sync/).

## Local development

```bash
# Check parity (exit 1 on drift)
node scripts/mermaid-sync/check.mjs --root . --docs docs

# Apply a choice locally
node scripts/mermaid-sync/apply.mjs --comment "/mermaid-sync use-mmd docs/architecture/02-ecosystem-context.md"

# Run tests
node --test scripts/mermaid-sync/lib.test.mjs
```

## Limitations

- **Fork PRs:** pushing back to an external fork may require “Allow edits from maintainers” on the PR.
- **Authorization:** only the PR author or users with write access on the repo can run `/mermaid-sync`.
- **One command = one pair** — post separate comments to resolve multiple conflicts.
