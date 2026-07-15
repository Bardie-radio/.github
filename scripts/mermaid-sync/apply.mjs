#!/usr/bin/env node
import { applySync, parseCommand } from "./lib.mjs";

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    choice: null,
    mdPath: null,
    blockIndex: 0,
    comment: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") options.root = path.resolve(argv[++i]);
    else if (arg === "--choice") options.choice = argv[++i];
    else if (arg === "--md") options.mdPath = argv[++i];
    else if (arg === "--block") options.blockIndex = Number(argv[++i]);
    else if (arg === "--comment") options.comment = argv[++i];
    else if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  if (options.comment) {
    const parsed = parseCommand(options.comment);
    if (!parsed) {
      console.error("Could not parse /mermaid-sync command from comment");
      process.exit(1);
    }
    options.choice = parsed.choice;
    options.mdPath = parsed.md_path;
    options.blockIndex = parsed.block_index;
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node apply.mjs --choice use-mmd|use-md --md PATH [--block N] [--root DIR]
  node apply.mjs --comment "/mermaid-sync use-mmd docs/foo.md" [--root DIR]`);
}

const options = parseArgs(process.argv);

if (!options.choice || !options.mdPath) {
  printHelp();
  process.exit(1);
}

try {
  const result = applySync(
    options.root,
    options.mdPath,
    options.blockIndex,
    options.choice,
  );

  if (!result.changed) {
    console.log(`Already in sync: ${result.md_path}`);
    process.exit(0);
  }

  console.log(
    `Synced ${result.md_path} ↔ ${result.mmd_path} (${result.choice})`,
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
