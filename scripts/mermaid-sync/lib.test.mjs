import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  applySync,
  buildPrComment,
  findConflicts,
  normalizeMermaid,
  parseCommand,
  parseCommands,
  parsePairsFromMarkdown,
} from "./lib.mjs";

function withFixture(name, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mermaid-sync-"));
  const fixtureRoot = path.join(import.meta.dirname, "fixtures", name);
  fs.cpSync(fixtureRoot, dir, { recursive: true });
  return fn(dir);
}

test("normalizeMermaid trims trailing whitespace and blank edges", () => {
  assert.equal(normalizeMermaid("  a  \n\nb  \n"), "a\n\nb");
});

test("parsePairsFromMarkdown finds paired blocks", () => {
  const md = fs.readFileSync(
    path.join(import.meta.dirname, "fixtures", "in-sync", "docs", "page.md"),
    "utf8",
  );
  const pairs = parsePairsFromMarkdown(md, "docs/page.md");
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].mmd_path, "docs/diagrams/sample.mmd");
});

test("resolveMmdPath prefers repo-root then md-relative", async () => {
  const { resolveMmdPath } = await import("./lib.mjs");
  withFixture("in-sync", (dir) => {
    assert.equal(
      resolveMmdPath(dir, "docs/page.md", "docs/diagrams/sample.mmd"),
      "docs/diagrams/sample.mmd",
    );
  });

  const legacy = fs.mkdtempSync(path.join(os.tmpdir(), "mermaid-legacy-"));
  fs.mkdirSync(path.join(legacy, "docs", "diagrams"), { recursive: true });
  fs.writeFileSync(path.join(legacy, "docs", "diagrams", "sample.mmd"), "flowchart LR\n");
  fs.writeFileSync(
    path.join(legacy, "docs", "page.md"),
    "<!-- mermaid-source: diagrams/sample.mmd -->\n```mermaid\nflowchart LR\n```\n",
  );
  assert.equal(
    resolveMmdPath(legacy, "docs/page.md", "diagrams/sample.mmd"),
    "docs/diagrams/sample.mmd",
  );
  fs.rmSync(legacy, { recursive: true, force: true });
});

test("findConflicts returns empty for in-sync pair", () => {
  withFixture("in-sync", (dir) => {
    const conflicts = findConflicts(dir, ["docs/page.md"]);
    assert.deepEqual(conflicts, []);
  });
});

test("findConflicts detects drift", () => {
  withFixture("drift", (dir) => {
    const conflicts = findConflicts(dir, ["docs/page.md"]);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].md_path, "docs/page.md");
  });
});

test("applySync use-mmd updates markdown embed", () => {
  withFixture("drift", (dir) => {
    const result = applySync(dir, "docs/page.md", 0, "use-mmd");
    assert.equal(result.changed, true);
    const conflicts = findConflicts(dir, ["docs/page.md"]);
    assert.deepEqual(conflicts, []);
  });
});

test("applySync use-md updates mmd file", () => {
  withFixture("drift", (dir) => {
    const result = applySync(dir, "docs/page.md", 0, "use-md");
    assert.equal(result.changed, true);
    const mmd = fs.readFileSync(path.join(dir, "docs/diagrams/sample.mmd"), "utf8");
    assert.match(mmd, /flowchart LR/);
    const conflicts = findConflicts(dir, ["docs/page.md"]);
    assert.deepEqual(conflicts, []);
  });
});

test("applySync use-md creates missing mmd file", () => {
  withFixture("drift", (dir) => {
    fs.rmSync(path.join(dir, "docs/diagrams/sample.mmd"));
    const before = findConflicts(dir, ["docs/page.md"]);
    assert.equal(before.length, 1);
    assert.match(before[0].error || "", /not found/);

    const result = applySync(dir, "docs/page.md", 0, "use-md");
    assert.equal(result.changed, true);
    const mmd = fs.readFileSync(path.join(dir, "docs/diagrams/sample.mmd"), "utf8");
    assert.match(mmd, /flowchart LR/);
    assert.deepEqual(findConflicts(dir, ["docs/page.md"]), []);
  });
});

test("applySync use-mmd fails when mmd is missing", () => {
  withFixture("drift", (dir) => {
    fs.rmSync(path.join(dir, "docs/diagrams/sample.mmd"));
    assert.throws(
      () => applySync(dir, "docs/page.md", 0, "use-mmd"),
      /cannot use-mmd/,
    );
  });
});

test("parseCommand extracts choice and path", () => {
  assert.deepEqual(parseCommand("/mermaid-sync use-mmd docs/a.md"), {
    choice: "use-mmd",
    md_path: "docs/a.md",
    block_index: 0,
  });
  assert.deepEqual(parseCommand("/mermaid-sync use-md docs/a.md#2"), {
    choice: "use-md",
    md_path: "docs/a.md",
    block_index: 2,
  });
});

test("parseCommands extracts multiple commands", () => {
  assert.deepEqual(
    parseCommands(
      "/mermaid-sync use-md docs/a.md\n/mermaid-sync use-mmd docs/b.md#1",
    ),
    [
      { choice: "use-md", md_path: "docs/a.md", block_index: 0 },
      { choice: "use-mmd", md_path: "docs/b.md", block_index: 1 },
    ],
  );
});

test("buildPrComment includes commands", () => {
  const comment = buildPrComment([
    {
      md_path: "docs/page.md",
      mmd_path: "docs/diagrams/sample.mmd",
      md_excerpt: "flowchart LR",
      mmd_excerpt: "flowchart TB",
    },
  ]);
  assert.match(comment, /Mermaid diagram parity check failed/);
  assert.match(comment, /\/mermaid-sync use-mmd docs\/page\.md/);
});

test("buildPrComment only suggests use-md when mmd is missing", () => {
  const comment = buildPrComment([
    {
      md_path: "docs/page.md",
      mmd_path: "docs/diagrams/sample.mmd",
      md_excerpt: "flowchart LR",
      mmd_excerpt: "(missing)",
      error: "Linked mermaid file not found: docs/diagrams/sample.mmd",
    },
  ]);
  assert.match(comment, /\/mermaid-sync use-md docs\/page\.md/);
  assert.doesNotMatch(comment, /\/mermaid-sync use-mmd/);
});
