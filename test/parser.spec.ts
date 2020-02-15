import "mocha";
import { expect } from "chai";
import { PropertiesParser, parse } from "../src/parser";

describe("LogicalLine", () => {
  it("parses a line with key", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo");
    expect(parsed).to.deep.equal({ key: "foo" });
  });
  it("parses a line with key and key terminator", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo=");
    expect(parsed).to.deep.equal({ key: "foo" });
  });
  it("parses a line with key and value", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo=bar");
    expect(parsed).to.deep.equal({ key: "foo", value: "bar" });
  });
  it("parses a key with \\ with key terminator", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo\\\\=bar");
    expect(parsed).to.deep.equal({ key: "foo\\", value: "bar" });
  });
});
describe("CommentLine", () => {
  it("parses a comment startsWith #", () => {
    const parsed = PropertiesParser.CommentLine.tryParse("#foo");
    expect(parsed).to.equal("#foo");
  });
  it("parses a comment startsWith !", () => {
    const parsed = PropertiesParser.CommentLine.tryParse("!foo");
    expect(parsed).to.equal("!foo");
  });
  it("parses a comment startsWith space", () => {
    const parsed = PropertiesParser.CommentLine.tryParse(" # foo ");
    expect(parsed).to.equal("# foo ");
  });
});
describe("Key", () => {
  it("parses a simple key", () => {
    const parsed = PropertiesParser.Key.tryParse("foo");
    expect(parsed).to.equal("foo");
  });
  it("ignores whitespace before the key terminator", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\t\f ");
    expect(parsed).to.equal("foo");
  });
  it("ignores whitespace at beginning", () => {
    const parsed = PropertiesParser.Key.tryParse("\t\f foo");
    expect(parsed).to.equal("foo");
  });
  it("parses a key with escaped key terminator", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\=bar\\:baz");
    expect(parsed).to.equal("foo=bar:baz");
  });
  it("parses a key with escaped \\", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\\\");
    expect(parsed).to.equal("foo\\");
  });
  it("parses a key with escaped line break", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\rbar\\n");
    expect(parsed).to.equal("foo\rbar\n");
  });
  it("parses a key with escaped mult-byte char", () => {
    const parsed = PropertiesParser.Key.tryParse("\\ud83d\\ude01");
    expect(parsed).to.equal("😁");
  });
  it("ignores needless \\", () => {
    const parsed = PropertiesParser.Key.tryParse("\\b\\z");
    expect(parsed).to.equal("bz");
  });
  it("supports dot-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a.b.c");
    expect(parsed).to.equal("a.b.c");
  });
  it("supports dash-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a-b-c");
    expect(parsed).to.equal("a-b-c");
  });
  it("supports underscore-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a_b_c");
    expect(parsed).to.equal("a_b_c");
  });
});

describe("#parse", () => {
  it("parses property", () => {
    const parsed: Map<string, string> = parse("foo = bar ");
    expect(parsed).to.have.lengthOf(1);
    expect(parsed.get("foo")).to.equal("bar");
  });
  it("parses property with brank line", () => {
    const parsed: Map<string, string> = parse("\f\t");
    expect(parsed).to.be.empty;
  });
  it("parses property with needless escape", () => {
    const parsed: Map<string, string> = parse("\\b=\\z");
    expect(parsed.get("b")).to.equal("z");
  });
  it("parses property without value", () => {
    const parsed: Map<string, string> = parse("foo = ");
    expect(parsed).to.have.lengthOf(1);
    expect(parsed.get("foo")).to.equal("");
  });
  it("parses property without key teminator", () => {
    const parsed: Map<string, string> = parse("foo");
    expect(parsed).to.have.lengthOf(1);
    expect(parsed.get("foo")).to.equal("");
  });
  xit("parses property with comment", () => {
    const parsed: Map<string, string> = parse("# comment\nfoo = bar ");
    expect(parsed).to.have.lengthOf(1);
    expect(parsed.get("foo")).to.equal("bar");
  });
});
