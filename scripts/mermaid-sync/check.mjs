#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { buildPrComment, findConflicts, walkMdFiles } from "./lib.mjs";

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    docs: "docs",
    jsonOut: "conflicts.json",
    commentOut: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") options.root = path.resolve(argv[++i]);
    else if (arg === "--docs") options.docs = argv[++i];
    else if (arg === "--json-out") options.jsonOut = argv[++i];
    else if (arg === "--comment-out") options.commentOut = argv[++i];
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node check.mjs [--root DIR] [--docs DIR] [--json-out FILE] [--comment-out FILE]

Scans markdown for <!-- mermaid-source: ... --> pairs and exits 1 when embed and .mmd differ.`);
}

const options = parseArgs(process.argv);
const mdFiles = walkMdFiles(options.root, options.docs);
const conflicts = findConflicts(options.root, mdFiles);

const jsonPath = path.isAbsolute(options.jsonOut)
  ? options.jsonOut
  : path.join(options.root, options.jsonOut);
fs.writeFileSync(jsonPath, `${JSON.stringify(conflicts, null, 2)}\n`, "utf8");

if (options.commentOut) {
  const comment = buildPrComment(conflicts);
  const commentPath = path.isAbsolute(options.commentOut)
    ? options.commentOut
    : path.join(options.root, options.commentOut);
  fs.writeFileSync(commentPath, comment, "utf8");
}

if (conflicts.length > 0) {
  console.error(`Mermaid parity failed: ${conflicts.length} conflict(s)`);
  for (const conflict of conflicts) {
    console.error(`  - ${conflict.md_path} ↔ ${conflict.mmd_path}`);
  }
  process.exit(1);
}

console.log(`Mermaid parity OK (${mdFiles.length} markdown file(s) scanned)`);
