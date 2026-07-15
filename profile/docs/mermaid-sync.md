# Mermaid diagram parity CI

GitHub renders Mermaid only inside fenced ` ```mermaid ` blocks in Markdown. To keep diagrams in separate `.mmd` files **and** render on GitHub, pair them with a source comment and enable the mermaid-sync check.

## Pairing convention

Place an HTML comment immediately above the fence:

```markdown
<!-- mermaid-source: diagrams/ecosystem-context.mmd -->
```mermaid
flowchart TB
  A --> B
```
```

- Path is relative to the `.md` file.
- Unpaired embeds and orphan `.mmd` files are ignored (not checked).

## What happens on a PR

When a paired embed and `.mmd` file differ:

1. The **Mermaid sync** check fails (blocks merge).
2. A bot comment lists each conflict with copy-paste commands.
3. Reply on the PR with your choice, for example:
   - `/mermaid-sync use-mmd docs/architecture/02-ecosystem-context.md` — update the embed from the `.mmd` file
   - `/mermaid-sync use-md docs/architecture/02-ecosystem-context.md` — update the `.mmd` from the embed
4. A follow-up workflow commits to the PR branch and checks re-run.

Multiple paired diagrams on one page use a block index:

```text
/mermaid-sync use-mmd docs/architecture/04-user-journeys.md#0
```

## Enable in a Bardie repo

Add [`.github/workflows/mermaid-sync.yml`](../.github/workflows/mermaid-sync.yml) (or copy from `bardie-kithara`):

```yaml
name: Mermaid sync

on:
  pull_request:
    paths:
      - docs/**
  issue_comment:
    types: [created]

jobs:
  check:
    if: github.event_name == 'pull_request'
    uses: Bardie-radio/.github/.github/workflows/reusable-mermaid-check.yml@main
    permissions:
      contents: read
      pull-requests: write

  resolve:
    if: |
      github.event_name == 'issue_comment' &&
      github.event.issue.pull_request &&
      contains(github.event.comment.body, '/mermaid-sync')
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
