import { PropertiesParser, parse } from "../src/parser";
import { describe, it, expect } from "vitest";

describe("LogicalLine", () => {
  it("parses a line with key", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo");
    expect(parsed).toEqual({ key: "foo" });
  });
  it("parses a line with key and key terminator", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo=");
    expect(parsed).toEqual({ key: "foo", value: "" });
  });
  it("parses a line with key and value", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo=bar");
    expect(parsed).toEqual({ key: "foo", value: "bar" });
  });
  it("parses a key with \\ with key terminator", () => {
    const parsed = PropertiesParser.LogicalLine.tryParse("foo\\\\=bar");
    expect(parsed).toEqual({ key: "foo\\", value: "bar" });
  });
});
describe("CommentLine", () => {
  it("parses a comment startsWith #", () => {
    const parsed = PropertiesParser.CommentLine.tryParse("#foo");
    expect(parsed).toBe("#foo");
  });
  it("parses a comment startsWith !", () => {
    const parsed = PropertiesParser.CommentLine.tryParse("!foo");
    expect(parsed).toBe("!foo");
  });
  it("parses a comment startsWith space", () => {
    const parsed = PropertiesParser.CommentLine.tryParse(" # foo ");
    expect(parsed).toBe("# foo ");
  });
});
describe("Value", () => {
  it("supports version format", () => {
    const parsed = PropertiesParser.Value.tryParse("0.12.3");
    expect(parsed).toBe("0.12.3");
  });
  it("supports SNAPSHOT version format", () => {
    const parsed = PropertiesParser.Value.tryParse("0.12.3-SNAPSHOT");
    expect(parsed).toBe("0.12.3-SNAPSHOT");
  });
  it("ignores needless \\", () => {
    const parsed = PropertiesParser.Value.tryParse("\\b\\z\\1");
    expect(parsed).toBe("bz1");
  });
});
describe("Key", () => {
  it("parses a simple key", () => {
    const parsed = PropertiesParser.Key.tryParse("foo");
    expect(parsed).toBe("foo");
  });
  it("ignores whitespace before the key terminator", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\t\f ");
    expect(parsed).toBe("foo");
  });
  it("ignores whitespace at beginning", () => {
    const parsed = PropertiesParser.Key.tryParse("\t\f foo");
    expect(parsed).toBe("foo");
  });
  it("parses a key with escaped key terminator", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\=bar\\:baz");
    expect(parsed).toBe("foo=bar:baz");
  });
  it("parses a key with escaped \\", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\\\");
    expect(parsed).toBe("foo\\");
  });
  it("parses a key with escaped line break", () => {
    const parsed = PropertiesParser.Key.tryParse("foo\\rbar\\n");
    expect(parsed).toBe("foo\rbar\n");
  });
  it("parses a key with escaped mult-byte char", () => {
    const parsed = PropertiesParser.Key.tryParse("\\ud83d\\ude01");
    expect(parsed).toBe("😁");
  });
  it("ignores needless \\", () => {
    const parsed = PropertiesParser.Key.tryParse("\\b\\z\\1");
    expect(parsed).toBe("bz1");
  });
  it("supports dot-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a.b.c");
    expect(parsed).toBe("a.b.c");
  });
  it("supports dash-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a-b-c");
    expect(parsed).toBe("a-b-c");
  });
  it("supports underscore-separated key", () => {
    const parsed = PropertiesParser.Key.tryParse("a_b_c");
    expect(parsed).toBe("a_b_c");
  });
  it("supports version format", () => {
    const parsed = PropertiesParser.Key.tryParse("0.12.3");
    expect(parsed).toBe("0.12.3");
  });
  it("supports SNAPSHOT version format", () => {
    const parsed = PropertiesParser.Key.tryParse("0.12.3-SNAPSHOT");
    expect(parsed).toBe("0.12.3-SNAPSHOT");
  });
});

describe("#parse", () => {
  it("parses property", () => {
    const parsed = parse("foo = bar ");
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toStrictEqual({ key: "foo", value: "bar" });
  });
  it("parses property with brank line", () => {
    const parsed = parse("\f\t");
    expect(parsed).toHaveLength(0);
  });
  it("parses property with needless escape", () => {
    const parsed = parse("\\b=\\z");
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toStrictEqual({ key: "b", value: "z" });
  });
  it("parses property without value", () => {
    const parsed = parse("foo = ");
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toStrictEqual({ key: "foo", value: "" });
  });
  it("parses property without key teminator", () => {
    const parsed = parse("foo");
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toStrictEqual({ key: "foo" });
  });
  it("parses property with comment", () => {
    const parsed = parse("# comment\nfoo = bar ");
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toStrictEqual({ text: "# comment" });
    expect(parsed[1]).toStrictEqual({ key: "foo", value: "bar" });
  });
});
