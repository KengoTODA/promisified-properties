import { describe, it, expect } from "@jest/globals";
import { escape, escapeKey } from "../src/escape";

describe("#escape", () => {
  it("does not change empty string", () => {
    expect(escape("")).toBe("");
  });
  it("does not escapes =", () => {
    expect(escape("foo=bar")).toBe("foo=bar");
  });
  it("escapes emoticon", () => {
    expect(escape("😁")).toBe("\\ud83d\\ude01");
  });
  it("escapes CR", () => {
    expect(escape("foo\rbar")).toBe("foo\\rbar");
  });
  it("escapes LF", () => {
    expect(escape("foo\nbar")).toBe("foo\\nbar");
  });
  it("does not escape single/double quote", () => {
    expect(escape("'\"")).toBe("'\"");
  });
});

describe("#escapeKey", () => {
  it("escapes =", () => {
    expect(escapeKey("foo=bar")).toBe("foo\\=bar");
  });
  it("escapes :", () => {
    expect(escapeKey("foo:bar")).toBe("foo\\:bar");
  });
  it("escapes multiple key separators", () => {
    expect(escapeKey("foo:bar=baz:last")).toBe("foo\\:bar\\=baz\\:last");
  });
});
