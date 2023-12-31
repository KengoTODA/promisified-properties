import { describe, it, expect } from "vitest";
import { promises } from "fs";
import { file } from "tmp-promise";
import { parse, parseFile, stringify, write } from "../src/index";

describe("public API", () => {
  describe("#parseFile", () => {
    it("parses .properties file", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=bar");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("uses colon as key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo:bar");
        const result = await parseFile(fileResult.path);
        expect(result[0]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("parses multiple natural lines in one logical line", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=bar\\\nbaz");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "barbaz" });
      });
    });
    it("ignore spaces at the head of line", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "    foo=bar");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("ignore spaces before key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo    =bar");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("ignore spaces after key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=    bar");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("escapes key terminator by back-slash", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo\\=bar=baz");
        const result = await parseFile(fileResult.path);
        expect(result[0]).toStrictEqual({ key: "foo=bar", value: "baz" });
      });
    });
    it("parses property without value", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo", value: "" });
      });
    });
    it("treats comment", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(
          fileResult.path,
          "# this is comment\r\nfoo=bar",
        );
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(2);
        expect(result[0]).toStrictEqual({ text: "# this is comment" });
        expect(result[1]).toStrictEqual({ key: "foo", value: "bar" });
      });
    });
    it("set an empty string if there is no non-whitespace char after the key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=\nbar= ");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(2);
        expect(result[0]).toStrictEqual({ key: "foo", value: "" });
        expect(result[1]).toStrictEqual({ key: "bar", value: "" });
      });
    });
    it("no value is set if there is no key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo");
        const result = await parseFile(fileResult.path);
        expect(result).toHaveLength(1);
        expect(result[0]).toStrictEqual({ key: "foo" });
      });
    });
  });
  describe("#stringify", () => {
    it("stringify properties", () => {
      const result = stringify([
        { key: "foo", value: "bar" },
        { key: "baz", value: "42" },
      ]);
      expect(result).toContain("foo = bar");
      expect(result).toContain("baz = 42");
      expect(result).toBe("foo = bar\nbaz = 42\n");
    });
    it("escapes multibyte chars", () => {
      const result = stringify([{ key: "face", value: "😁" }]);
      expect(result).toContain("face = \\ud83d\\ude01");
    });
    it("escapes CR", () => {
      const result = stringify([{ key: "text", value: "foo\rbar" }]);
      expect(result).toContain("text = foo\\rbar");
    });
    it("escapes LF", () => {
      const result = stringify([{ key: "text", value: "foo\nbar" }]);
      expect(result).toContain("text = foo\\nbar");
    });
    it("escapes = in key", () => {
      const result = stringify([{ key: "foo=bar", value: "baz" }]);
      expect(result).toContain("foo\\=bar = baz");
    });
    it("stringifies comments", () => {
      const result = stringify([{ text: "# comment" }]);
      expect(result).toContain("# comment");
    });
  });
  it("parses escaped multibyte chars", () => {
    const result = parse("face = \\ud83d\\ude01");
    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual({ key: "face", value: "😁" });
  });
  it("parses URL type value", () => {
    const result = parse("some_url = https://lol.gov");
    expect(result).toHaveLength(1);
    expect(result[0]).toStrictEqual({
      key: "some_url",
      value: "https://lol.gov",
    });
  });
  it("generates .properties file", async () => {
    const path = (await file()).path;
    await write(
      [
        { key: "foo", value: "bar" },
        { key: "baz", value: "42" },
      ],
      path,
    );

    const lines = await promises.readFile(path, { encoding: "utf8" });

    expect(lines).toContain("foo = bar");
    expect(lines).toContain("baz = 42");
  });
});
