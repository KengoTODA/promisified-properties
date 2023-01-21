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
        expect(result.get("foo")).toBe("bar");
      });
    });
    it("uses colon as key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo:bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("bar");
      });
    });
    it("parses multiple natural lines in one logical line", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=bar\\\nbaz");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("barbaz");
      });
    });
    it("ignore spaces at the head of line", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "    foo=bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("bar");
      });
    });
    it("ignore spaces before key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo    =bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("bar");
      });
    });
    it("ignore spaces after key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=    bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("bar");
      });
    });
    it("escapes key terminator by back-slash", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo\\=bar=baz");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo=bar")).toBe("baz");
      });
    });
    it("parses property without value", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("");
      });
    });
    it("ignores comment", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(
          fileResult.path,
          "# this is comment\r\nfoo=bar"
        );
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("bar");
        expect(result.size).toBe(1);
      });
    });
    it("set an empty string if there is no non-whitespace char after the key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo=\nbar= ");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("");
        expect(result.get("bar")).toBe("");
      });
    });
    it("set an empty string if there is no key terminator", async () => {
      return file().then(async (fileResult) => {
        await promises.writeFile(fileResult.path, "foo");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).toBe("");
      });
    });
  });
  describe("#stringify", () => {
    it("stringify properties", () => {
      const result = stringify(
        new Map([
          ["foo", "bar"],
          ["baz", "42"],
        ])
      );
      expect(result).toContain("foo = bar");
      expect(result).toContain("baz = 42");
      expect(result).toBe("foo = bar\nbaz = 42\n");
    });
    it("escapes multibyte chars", () => {
      const result = stringify(new Map([["face", "😁"]]));
      expect(result).toContain("face = \\ud83d\\ude01");
    });
    it("escapes CR", () => {
      const result = stringify(new Map([["text", "foo\rbar"]]));
      expect(result).toContain("text = foo\\rbar");
    });
    it("escapes LF", () => {
      const result = stringify(new Map([["text", "foo\nbar"]]));
      expect(result).toContain("text = foo\\nbar");
    });
    it("escapes = in key", () => {
      const result = stringify(new Map([["foo=bar", "baz"]]));
      expect(result).toContain("foo\\=bar = baz");
    });
  });
  it("parses escaped multibyte chars", () => {
    const result = parse("face = \\ud83d\\ude01");
    expect(result.get("face")).toBe("😁");
  });
  it("parses URL type value", () => {
    const result = parse("some_url = https://lol.gov");
    expect(result.get("some_url")).toBe("https://lol.gov");
  });
  it("generates .properties file", async () => {
    const path = (await file()).path;
    await write(
      new Map([
        ["foo", "bar"],
        ["baz", "42"],
      ]),
      path
    );

    const lines = await promises.readFile(path, { encoding: "utf8" });

    expect(lines).toContain("foo = bar");
    expect(lines).toContain("baz = 42");
  });
});
