# Version bump CI gate

Lib (and later service) repos that publish versioned artifacts must bump
`<Version>` on every PR to `main`. This org reusable workflow enforces that
gate so releases stay intentional — **no auto-bump**.

## Rules

1. Version lives in repo-root **`Directory.Build.props`** as MSBuild `<Version>`
   (one version per repo; multi-project packs stay lockstep).
2. On a pull request, HEAD must contain a **valid SemVer** (`MAJOR.MINOR.PATCH`,
   optional pre-release) that is **strictly greater** than the same value on
   the PR base.
3. **Bootstrap:** if the base commit has no `Directory.Build.props`, HEAD only
   needs a valid SemVer (first landing of the file).

CI fails with a clear message when the version is missing, unchanged, not
SemVer, or not greater than base — typically:

> Bump `<Version>` in `Directory.Build.props`

## Enable in a Bardie repo

Add `.github/workflows/version-check.yml`:

```yaml
name: Version check

on:
  pull_request:

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
3. Merge to `main` — publish workflow packs and pushes to [nuget.org](https://www.nuget.org).
4. Consumers bump the matching `PackageVersion` in their `Directory.Packages.props`.
