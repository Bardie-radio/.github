/**
 * Shared SemVer bump gate for Bardie lib (and later service) PRs.
 * Compares a version string extracted from a props/file on the PR base vs HEAD.
 */

const DEFAULT_VERSION_PATTERN = /<Version>\s*([^<\s]+)\s*<\/Version>/i;

/** SemVer 2.0 core + optional pre-release / build metadata. */
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/**
 * @param {string} content
 * @param {RegExp | string} [pattern]
 * @returns {string | null}
 */
export function extractVersion(content, pattern = DEFAULT_VERSION_PATTERN) {
  const re =
    typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
  const match = content.match(re);
  if (!match) return null;
  const value = (match[1] ?? match[0]).trim();
  return value.length > 0 ? value : null;
}

/**
 * @param {string} version
 * @returns {{ major: number, minor: number, patch: number, prerelease: (string|number)[] } | null}
 */
export function parseSemVer(version) {
  if (typeof version !== "string") return null;
  const match = version.trim().match(SEMVER_RE);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split(".").map(parsePreId) : [],
  };
}

/**
 * @param {string} id
 * @returns {string | number}
 */
function parsePreId(id) {
  if (/^(0|[1-9]\d*)$/.test(id)) return Number(id);
  return id;
}

/**
 * @param {ReturnType<typeof parseSemVer>} a
 * @param {ReturnType<typeof parseSemVer>} b
 * @returns {number} negative if a < b, 0 if equal (ignoring build), positive if a > b
 */
export function compareSemVer(a, b) {
  if (!a || !b) throw new Error("compareSemVer requires parsed SemVer objects");
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return comparePrerelease(a.prerelease, b.prerelease);
}

/**
 * @param {(string|number)[]} a
 * @param {(string|number)[]} b
 */
function comparePrerelease(a, b) {
  // No prerelease > any prerelease
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (i >= a.length) return -1;
    if (i >= b.length) return 1;
    const left = a[i];
    const right = b[i];
    if (left === right) continue;
    const leftNum = typeof left === "number";
    const rightNum = typeof right === "number";
    if (leftNum && rightNum) return left - right;
    if (leftNum) return -1;
    if (rightNum) return 1;
    return String(left) < String(right) ? -1 : 1;
  }
  return 0;
}

/**
 * @param {string} head
 * @param {string} base
 */
export function isStrictlyGreater(head, base) {
  const h = parseSemVer(head);
  const b = parseSemVer(base);
  if (!h || !b) return false;
  return compareSemVer(h, b) > 0;
}

/**
 * @typedef {{ ok: true, message: string, headVersion: string, baseVersion: string | null }} OkResult
 * @typedef {{ ok: false, message: string, headVersion: string | null, baseVersion: string | null }} FailResult
 */

/**
 * Evaluate whether HEAD is an allowed version bump vs the PR base.
 *
 * Bootstrap: when the base file is missing, HEAD only needs a valid SemVer.
 *
 * @param {{
 *   headContent: string | null,
 *   baseContent: string | null,
 *   baseFileMissing?: boolean,
 *   pattern?: RegExp | string,
 *   fileLabel?: string,
 * }} input
 * @returns {OkResult | FailResult}
 */
export function evaluateVersionBump(input) {
  const fileLabel = input.fileLabel ?? "Directory.Build.props";
  const pattern = input.pattern ?? DEFAULT_VERSION_PATTERN;
  const baseMissing = Boolean(input.baseFileMissing || input.baseContent == null);

  if (input.headContent == null) {
    return {
      ok: false,
      headVersion: null,
      baseVersion: null,
      message: `Version check failed: ${fileLabel} is missing on HEAD. Add the file with a <Version> (SemVer) and bump it on every PR.`,
    };
  }

  const headVersion = extractVersion(input.headContent, pattern);
  if (!headVersion) {
    return {
      ok: false,
      headVersion: null,
      baseVersion: null,
      message: `Version check failed: no <Version> found in ${fileLabel} on HEAD. Add <Version>…</Version> (SemVer) and bump it on every PR.`,
    };
  }

  if (!parseSemVer(headVersion)) {
    return {
      ok: false,
      headVersion,
      baseVersion: null,
      message: `Version check failed: HEAD version "${headVersion}" is not valid SemVer. Use MAJOR.MINOR.PATCH (optional pre-release).`,
    };
  }

  if (baseMissing) {
    return {
      ok: true,
      headVersion,
      baseVersion: null,
      message: `Version check OK (bootstrap): base has no ${fileLabel}; HEAD ${headVersion} is valid SemVer.`,
    };
  }

  const baseVersion = extractVersion(input.baseContent, pattern);
  if (!baseVersion) {
    return {
      ok: false,
      headVersion,
      baseVersion: null,
      message: `Version check failed: base ${fileLabel} has no <Version>. Bump <Version> in ${fileLabel} on this PR.`,
    };
  }

  if (!parseSemVer(baseVersion)) {
    return {
      ok: false,
      headVersion,
      baseVersion,
      message: `Version check failed: base version "${baseVersion}" is not valid SemVer; fix on main or bump HEAD past a corrected base.`,
    };
  }

  if (headVersion === baseVersion) {
    return {
      ok: false,
      headVersion,
      baseVersion,
      message: `Version check failed: <Version> in ${fileLabel} is unchanged (${headVersion}). Bump <Version> in ${fileLabel} to a SemVer strictly greater than the PR base.`,
    };
  }

  if (!isStrictlyGreater(headVersion, baseVersion)) {
    return {
      ok: false,
      headVersion,
      baseVersion,
      message: `Version check failed: HEAD ${headVersion} is not strictly greater than base ${baseVersion}. Bump <Version> in ${fileLabel}.`,
    };
  }

  return {
    ok: true,
    headVersion,
    baseVersion,
    message: `Version check OK: ${baseVersion} → ${headVersion}`,
  };
}

export { DEFAULT_VERSION_PATTERN };
