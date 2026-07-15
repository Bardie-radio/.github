#!/usr/bin/env node
import path from "node:path";
import { applySync, parseCommand, parseCommands } from "./lib.mjs";

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

  return options;
}

function printHelp() {
  console.log(`Usage:
  node apply.mjs --choice use-mmd|use-md --md PATH [--block N] [--root DIR]
  node apply.mjs --comment "/mermaid-sync use-mmd docs/foo.md" [--root DIR]`);
}

const options = parseArgs(process.argv);

try {
  if (options.comment) {
    const commands = parseCommands(options.comment);
    if (commands.length === 0) {
      console.error("Could not parse /mermaid-sync command from comment");
      process.exit(1);
    }

    let anyChanged = false;
    for (const command of commands) {
      const result = applySync(
        options.root,
        command.md_path,
        command.block_index,
        command.choice,
      );
      if (!result.changed) {
        console.log(`Already in sync: ${result.md_path}`);
        continue;
      }
      anyChanged = true;
      console.log(
        `Synced ${result.md_path} ↔ ${result.mmd_path} (${result.choice})`,
      );
    }
    process.exit(0);
  }

  if (!options.choice || !options.mdPath) {
    printHelp();
    process.exit(1);
  }

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
