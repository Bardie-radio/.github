import fs from "node:fs";
import path from "node:path";

const COMMAND_RE =
  /\/mermaid-sync\s+(use-mmd|use-md)\s+([^\s#]+)(?:#(\d+))?/i;

export function normalizeMermaid(content) {
  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .trim();
}

/**
 * Resolve a mermaid-source path.
 * Prefer repo-root-relative (new convention). Fall back to paths relative to the
 * markdown file (legacy) when that file exists.
 */
export function resolveMmdPath(repoRoot, mdPath, declared) {
  const declaredNorm = path.normalize(declared).replace(/\\/g, "/");
  const rootAbs = path.join(repoRoot, declaredNorm);
  if (fs.existsSync(rootAbs)) {
    return declaredNorm;
  }

  const mdRelative = path
    .normalize(path.join(path.dirname(mdPath), declared))
    .replace(/\\/g, "/");
  const mdAbs = path.join(repoRoot, mdRelative);
  if (fs.existsSync(mdAbs)) {
    return mdRelative;
  }

  // Missing file: report/create under the repo-root convention.
  return declaredNorm;
}

export function parsePairsFromMarkdown(mdContent, mdPath, repoRoot = null) {
  const lines = mdContent.split("\n");
  const pairs = [];
  let blockIndex = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const commentMatch = line.match(/<!--\s*mermaid-source:\s*([^\s>]+)\s*-->/);
    if (!commentMatch) continue;

    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j += 1;
    if (j >= lines.length || lines[j].trim() !== "```mermaid") continue;

    j += 1;
    const bodyLines = [];
    while (j < lines.length && lines[j].trim() !== "```") {
      bodyLines.push(lines[j]);
      j += 1;
    }
    if (j >= lines.length) continue;

    const declared = commentMatch[1];
    const mmdPath = repoRoot
      ? resolveMmdPath(repoRoot, mdPath, declared)
      : path.normalize(declared).replace(/\\/g, "/");

    pairs.push({
      id: `${mdPath.replace(/\\/g, "/")}#${blockIndex}`,
      md_path: mdPath.replace(/\\/g, "/"),
      mmd_path: mmdPath,
      mmd_relative: declared,
      block_index: blockIndex,
      md_content: bodyLines.join("\n"),
    });
    blockIndex += 1;
    i = j;
  }

  return pairs;
}

export function readMmdContent(mmdPath, repoRoot) {
  const absolute = path.join(repoRoot, mmdPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Linked mermaid file not found: ${mmdPath}`);
  }
  return fs.readFileSync(absolute, "utf8");
}

export function pairWithMmdContent(pair, repoRoot) {
  const mmdContent = readMmdContent(pair.mmd_path, repoRoot);
  const mdNorm = normalizeMermaid(pair.md_content);
  const mmdNorm = normalizeMermaid(mmdContent);
  return {
    ...pair,
    mmd_content: mmdContent,
    in_sync: mdNorm === mmdNorm,
  };
}

export function findConflicts(repoRoot, mdFiles) {
  const conflicts = [];

  for (const mdPath of mdFiles) {
    const absolute = path.join(repoRoot, mdPath);
    if (!fs.existsSync(absolute)) continue;

    const content = fs.readFileSync(absolute, "utf8");
    const pairs = parsePairsFromMarkdown(content, mdPath, repoRoot);

    for (const pair of pairs) {
      try {
        const enriched = pairWithMmdContent(pair, repoRoot);
        if (!enriched.in_sync) {
          conflicts.push({
            id: enriched.id,
            md_path: enriched.md_path,
            mmd_path: enriched.mmd_path,
            block_index: enriched.block_index,
            md_excerpt: excerpt(normalizeMermaid(enriched.md_content)),
            mmd_excerpt: excerpt(normalizeMermaid(enriched.mmd_content)),
          });
        }
      } catch (error) {
        conflicts.push({
          id: pair.id,
          md_path: pair.md_path,
          mmd_path: pair.mmd_path,
          block_index: pair.block_index,
          error: error.message,
          md_excerpt: excerpt(normalizeMermaid(pair.md_content)),
          mmd_excerpt: "(missing)",
        });
      }
    }
  }

  return conflicts;
}

function excerpt(text, maxLines = 4) {
  return text.split("\n").slice(0, maxLines).join("\n");
}

export function walkMdFiles(repoRoot, docsDir) {
  const root = path.join(repoRoot, docsDir);
  if (!fs.existsSync(root)) return [];

  const files = [];
  walk(root, files);
  return files.map((file) => path.relative(repoRoot, file).replace(/\\/g, "/"));
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
}

export function buildPrComment(conflicts) {
  if (conflicts.length === 0) return "";

  const blocks = conflicts.map((conflict) => {
    const { md_path, mmd_path, md_excerpt, mmd_excerpt } = conflict;
    const missingMmd =
      Boolean(conflict.error) || mmd_excerpt === "(missing)";
    const commands = missingMmd
      ? [
          "`.mmd` is missing — create it from the embed (PR Conversation comment, or a submitted review):",
          `- \`/mermaid-sync use-md ${md_path}\` — write the embed into \`${mmd_path}\``,
        ]
      : [
          "Pick the canonical version (PR Conversation comment, or a submitted review):",
          `- \`/mermaid-sync use-mmd ${md_path}\` — keep the \`.mmd\` file, update the embed`,
          `- \`/mermaid-sync use-md ${md_path}\` — keep the embed, update the \`.mmd\` file`,
        ];
    return [
      `### Mermaid parity failed`,
      "",
      `**${md_path}** ↔ **${mmd_path}**`,
      "",
      "<details><summary>Embed excerpt</summary>",
      "",
      "```",
      md_excerpt,
      "```",
      "",
      "</details>",
      "",
      "<details><summary>.mmd excerpt</summary>",
      "",
      "```",
      mmd_excerpt,
      "```",
      "",
      "</details>",
      "",
      ...commands,
    ].join("\n");
  });

  return ["## Mermaid diagram parity check failed", "", ...blocks].join("\n\n");
}

export function parseCommand(commentBody) {
  const commands = parseCommands(commentBody);
  return commands[0] || null;
}

export function parseCommands(commentBody) {
  const results = [];
  const re = new RegExp(COMMAND_RE.source, "gi");
  let match;
  while ((match = re.exec(commentBody)) !== null) {
    results.push({
      choice: match[1].toLowerCase(),
      md_path: match[2].replace(/\\/g, "/"),
      block_index: match[3] ? Number(match[3]) : 0,
    });
  }
  return results;
}

export function applySync(repoRoot, mdPath, blockIndex, choice) {
  const absoluteMd = path.join(repoRoot, mdPath);
  if (!fs.existsSync(absoluteMd)) {
    throw new Error(`Markdown file not found: ${mdPath}`);
  }

  const mdContent = fs.readFileSync(absoluteMd, "utf8");
  const pairs = parsePairsFromMarkdown(mdContent, mdPath, repoRoot);
  const pair = pairs.find((p) => p.block_index === blockIndex);

  if (!pair) {
    throw new Error(`No paired mermaid block #${blockIndex} in ${mdPath}`);
  }

  const mmdAbsolute = path.join(repoRoot, pair.mmd_path);

  // Missing `.mmd` is a conflict the checker reports; `use-md` must create it.
  if (!fs.existsSync(mmdAbsolute)) {
    if (choice === "use-md") {
      const newBody = normalizeMermaid(pair.md_content);
      fs.mkdirSync(path.dirname(mmdAbsolute), { recursive: true });
      fs.writeFileSync(mmdAbsolute, `${newBody}\n`, "utf8");
      return { changed: true, md_path: mdPath, mmd_path: pair.mmd_path, choice };
    }
    if (choice === "use-mmd") {
      throw new Error(
        `Linked mermaid file not found: ${pair.mmd_path} (cannot use-mmd; use use-md to create it)`,
      );
    }
    throw new Error(`Unknown choice: ${choice}`);
  }

  const enriched = pairWithMmdContent(pair, repoRoot);

  if (enriched.in_sync) {
    return { changed: false, md_path: mdPath, mmd_path: pair.mmd_path, choice };
  }

  if (choice === "use-mmd") {
    const newBody = normalizeMermaid(enriched.mmd_content);
    const updatedMd = replaceMermaidBlock(mdContent, blockIndex, newBody);
    fs.writeFileSync(absoluteMd, updatedMd, "utf8");
  } else if (choice === "use-md") {
    const newBody = normalizeMermaid(enriched.md_content);
    fs.mkdirSync(path.dirname(mmdAbsolute), { recursive: true });
    fs.writeFileSync(mmdAbsolute, `${newBody}\n`, "utf8");
  } else {
    throw new Error(`Unknown choice: ${choice}`);
  }

  return { changed: true, md_path: mdPath, mmd_path: pair.mmd_path, choice };
}

function replaceMermaidBlock(mdContent, blockIndex, newBody) {
  const lines = mdContent.split("\n");
  const output = [];
  let inFence = false;
  let currentIndex = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      inFence = !inFence;
      output.push(line);
      i += 1;
      continue;
    }

    if (inFence) {
      output.push(line);
      i += 1;
      continue;
    }

    const commentMatch = line.match(/<!--\s*mermaid-source:\s*([^\s>]+)\s*-->/);
    if (!commentMatch) {
      output.push(line);
      i += 1;
      continue;
    }

    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") {
      output.push(lines[j]);
      j += 1;
    }

    if (j >= lines.length || lines[j].trim() !== "```mermaid") {
      output.push(line);
      i += 1;
      continue;
    }

    if (currentIndex === blockIndex) {
      output.push(line);
      for (let k = i + 1; k < j; k += 1) output.push(lines[k]);
      output.push("```mermaid");
      output.push(newBody);
      j += 1;
      while (j < lines.length && lines[j].trim() !== "```") j += 1;
      output.push("```");
      i = j + 1;
      currentIndex += 1;
      continue;
    }

    output.push(line);
    i += 1;
    currentIndex += 1;
  }

  return `${output.join("\n")}\n`;
}
