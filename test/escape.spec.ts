import "mocha";
import { expect } from "chai";
import { escape, escapeKey } from "../src/escape";

describe("#escape", () => {
  it("does not change empty string", () => {
    expect(escape("")).to.equal("");
  });
  it("does not escapes =", () => {
    expect(escape("foo=bar")).to.equal("foo=bar");
  });
  it("escapes emoticon", () => {
    expect(escape("😁")).to.equal("\\ud83d\\ude01");
  });
  it("escapes CR", () => {
    expect(escape("foo\rbar")).to.equal("foo\\rbar");
  });
  it("escapes LF", () => {
    expect(escape("foo\nbar")).to.equal("foo\\nbar");
  });
  it("does not escape single/double quote", () => {
    expect(escape("'\"")).to.equal("'\"");
  });
});

describe("#escapeKey", () => {
  it("escapes =", () => {
    expect(escapeKey("foo=bar")).to.equal("foo\\=bar");
  });
  it("escapes :", () => {
    expect(escapeKey("foo:bar")).to.equal("foo\\:bar");
  });
  it("escapes multiple key separators", () => {
    expect(escapeKey("foo:bar=baz:last")).to.equal("foo\\:bar\\=baz\\:last");
  });
});
