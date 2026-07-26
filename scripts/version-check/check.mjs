#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_VERSION_PATTERN,
  evaluateVersionBump,
} from "./lib.mjs";

function parseArgs(argv) {
  const options = {
    file: "Directory.Build.props",
    pattern: null,
    baseRef: process.env.GITHUB_BASE_SHA || process.env.GITHUB_BASE_REF || null,
    root: process.cwd(),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--file") options.file = argv[++i];
    else if (arg === "--pattern") options.pattern = argv[++i];
    else if (arg === "--base-ref") options.baseRef = argv[++i];
    else if (arg === "--root") options.root = path.resolve(argv[++i]);
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(2);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node check.mjs [--file PATH] [--base-ref REF] [--pattern REGEX] [--root DIR]

Compares <Version> in PATH on HEAD vs the PR base (git show REF:PATH).
Fails unless HEAD has a valid SemVer that is strictly greater than base
(or base lacks the file — bootstrap: HEAD SemVer only).

Environment: GITHUB_BASE_SHA (preferred) or GITHUB_BASE_REF when --base-ref is omitted.`);
}

/**
 * @param {string} root
 * @param {string} ref
 * @param {string} file
 * @returns {{ missing: boolean, content: string | null }}
 */
function readBaseFile(root, ref, file) {
  try {
    const content = execFileSync("git", ["show", `${ref}:${file}`], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { missing: false, content };
  } catch (err) {
    const stderr = String(err.stderr ?? err.message ?? "");
    // Missing path on that commit, or invalid pathspec.
    if (
      /does not exist in|exists on disk, but not in|path .* does not exist|fatal: invalid object/i.test(
        stderr,
      ) ||
      err.status === 128
    ) {
      return { missing: true, content: null };
    }
    throw err;
  }
}

const options = parseArgs(process.argv);

if (!options.baseRef) {
  console.error(
    "Version check failed: provide --base-ref (or set GITHUB_BASE_SHA / GITHUB_BASE_REF).",
  );
  process.exit(2);
}

const headPath = path.join(options.root, options.file);
let headContent = null;
if (fs.existsSync(headPath)) {
  headContent = fs.readFileSync(headPath, "utf8");
}

const base = readBaseFile(options.root, options.baseRef, options.file);
const pattern = options.pattern
  ? options.pattern
  : DEFAULT_VERSION_PATTERN;

const result = evaluateVersionBump({
  headContent,
  baseContent: base.content,
  baseFileMissing: base.missing,
  pattern,
  fileLabel: options.file,
});

if (result.ok) {
  console.log(result.message);
  process.exit(0);
}

console.error(result.message);
process.exit(1);
