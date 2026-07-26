import assert from "node:assert/strict";
import test from "node:test";
import {
  compareSemVer,
  evaluateVersionBump,
  extractVersion,
  isStrictlyGreater,
  parseSemVer,
} from "./lib.mjs";

test("extractVersion reads first Version element", () => {
  const content = `<Project>
  <PropertyGroup>
    <Version>0.1.0</Version>
  </PropertyGroup>
</Project>`;
  assert.equal(extractVersion(content), "0.1.0");
});

test("extractVersion returns null when missing", () => {
  assert.equal(extractVersion("<Project />"), null);
});

test("parseSemVer accepts core and prerelease", () => {
  assert.deepEqual(parseSemVer("1.2.3"), {
    major: 1,
    minor: 2,
    patch: 3,
    prerelease: [],
  });
  assert.deepEqual(parseSemVer("1.0.0-alpha.1"), {
    major: 1,
    minor: 0,
    patch: 0,
    prerelease: ["alpha", 1],
  });
  assert.equal(parseSemVer("1.0"), null);
  assert.equal(parseSemVer("v1.0.0"), null);
});

test("compareSemVer / isStrictlyGreater order correctly", () => {
  assert.ok(isStrictlyGreater("0.1.1", "0.1.0"));
  assert.ok(isStrictlyGreater("0.2.0", "0.1.9"));
  assert.ok(isStrictlyGreater("1.0.0", "0.9.9"));
  assert.ok(isStrictlyGreater("1.0.0", "1.0.0-rc.1"));
  assert.ok(isStrictlyGreater("1.0.0-rc.2", "1.0.0-rc.1"));
  assert.equal(isStrictlyGreater("0.1.0", "0.1.0"), false);
  assert.equal(isStrictlyGreater("0.1.0", "0.1.1"), false);
  assert.equal(compareSemVer(parseSemVer("1.0.0"), parseSemVer("1.0.0")), 0);
});

test("evaluateVersionBump ok on strict bump", () => {
  const result = evaluateVersionBump({
    headContent: "<Version>0.1.1</Version>",
    baseContent: "<Version>0.1.0</Version>",
  });
  assert.equal(result.ok, true);
  assert.match(result.message, /0\.1\.0 → 0\.1\.1/);
});

test("evaluateVersionBump fails when unchanged", () => {
  const result = evaluateVersionBump({
    headContent: "<Version>0.1.0</Version>",
    baseContent: "<Version>0.1.0</Version>",
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /unchanged/);
  assert.match(result.message, /Bump <Version>/);
});

test("evaluateVersionBump fails when not greater", () => {
  const result = evaluateVersionBump({
    headContent: "<Version>0.0.9</Version>",
    baseContent: "<Version>0.1.0</Version>",
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /not strictly greater/);
});

test("evaluateVersionBump bootstrap when base file missing", () => {
  const result = evaluateVersionBump({
    headContent: "<Version>0.1.0</Version>",
    baseContent: null,
    baseFileMissing: true,
  });
  assert.equal(result.ok, true);
  assert.match(result.message, /bootstrap/);
});

test("evaluateVersionBump bootstrap when base file has no Version", () => {
  const result = evaluateVersionBump({
    headContent: `<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Version>0.1.0</Version>
  </PropertyGroup>
</Project>`,
    baseContent: `<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
</Project>`,
  });
  assert.equal(result.ok, true);
  assert.equal(result.headVersion, "0.1.0");
  assert.equal(result.baseVersion, null);
  assert.match(result.message, /bootstrap/);
  assert.match(result.message, /has no <Version>/);
});

test("evaluateVersionBump fails on invalid HEAD SemVer", () => {
  const result = evaluateVersionBump({
    headContent: "<Version>1.0</Version>",
    baseContent: null,
    baseFileMissing: true,
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /not valid SemVer/);
});

test("evaluateVersionBump fails when HEAD file missing", () => {
  const result = evaluateVersionBump({
    headContent: null,
    baseContent: "<Version>0.1.0</Version>",
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /missing on HEAD/);
});
