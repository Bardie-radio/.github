# Version bump CI gate

Lib and service repos that publish versioned artifacts must bump
`<Version>` on every PR to `main`. This org reusable workflow enforces that
gate so releases stay intentional — **no auto-bump**.

## Rules

1. Version lives in repo-root **`Directory.Build.props`** as MSBuild `<Version>`
   (one version per repo; multi-project packs stay lockstep).
2. On a pull request, HEAD must contain a **valid SemVer** (`MAJOR.MINOR.PATCH`,
   optional pre-release) that is **strictly greater** than the same value on
   the PR base.
3. **Bootstrap:** if the base commit has no `Directory.Build.props`, or the file
   exists without a `<Version>`, HEAD only needs a valid SemVer (first landing
   of the version property).

CI fails with a clear message when the version is missing, unchanged, not
SemVer, or not greater than base — typically:

> Bump `<Version>` in `Directory.Build.props`

## Enable in a Bardie repo

Add `.github/workflows/version-check.yml` (gate PRs into **`main`** only):

```yaml
name: Version check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    uses: Bardie-radio/.github/.github/workflows/reusable-version-check.yml@main
    permissions:
      contents: read
```

Optional inputs (`with:`):

| Input | Default | Purpose |
|-------|---------|---------|
| `file` | `Directory.Build.props` | Path to the version file |
| `ci_ref` | `main` | Ref of this `.github` repo for scripts |
| `pattern` | *(built-in `<Version>` extract)* | Custom regex with a capture group |

## Local development

```bash
# Against a base commit SHA (same as Actions)
node scripts/version-check/check.mjs --file Directory.Build.props --base-ref <sha>

# Unit tests
node --test scripts/version-check/check.test.mjs
```

Scripts: [`scripts/version-check/`](../scripts/version-check/).

## Release loop (libs)

1. Bump `<Version>` in `Directory.Build.props`.
2. Open PR — **Version check** + build CI must pass.
3. Merge to `main`, then manually run **Publish NuGet** (`workflow_dispatch`) —
   packs and pushes to [nuget.org](https://www.nuget.org).
4. Consumers bump the matching `PackageVersion` in their `Directory.Packages.props`.

## Release loop (services / container images)

Applies to MVP app repos (`kithara`, `plume`, `magpie`, `bes`):

### `dev` (automatic)

1. Merge to long-lived **`dev`** (no version-bump gate on PRs into `dev`).
2. Push to `dev` runs **Publish image** automatically.
3. GHCR tags:
   - `ghcr.io/bardie-radio/<codename>:<Version>`
   - `ghcr.io/bardie-radio/<codename>:dev`
   - **not** `:latest`

### `main` (manual release)

1. Bump `<Version>` in `Directory.Build.props` (PR into **`main`** — version check applies).
2. Version check + CI (`docker build`, no push) must pass; merge.
3. Run **Publish image** (`workflow_dispatch` from **`main`** only).
4. GHCR tags (same SemVer, channel flips to release):
   - `ghcr.io/bardie-radio/<codename>:<Version>` (overwrites the prior `dev` build for that SemVer)
   - `ghcr.io/bardie-radio/<codename>:latest`
5. Operators: `IMAGE_TAG=latest` (release) or `IMAGE_TAG=dev` (integration).
6. **First push:** if the org default for packages is private, open the new
   package on GitHub → Package settings → Change visibility → **Public**
   (one-time per image). After that, hosts can `docker pull` without login.
