import "mocha";
import { expect } from "chai";
import { promises } from "fs";
import { file } from "tmp-promise";
import { parse, parseFile, stringify, write } from "../src/index";

describe("public API", () => {
  describe("#parseFile", () => {
    it("parses .properties file", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo=bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
      });
    });
    it("uses colon as key terminator", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo:bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
      });
    });
    xit("parses multiple natural lines in one logical line", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo=bar\\\nbaz");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("barbaz");
      });
    });
    it("ignore spaces at the head of line", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "    foo=bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
      });
    });
    it("ignore spaces before key terminator", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo    =bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
      });
    });
    it("ignore spaces after key terminator", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo=    bar");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
      });
    });
    it("escapes key terminator by back-slash", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo\\=bar=baz");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo=bar")).to.equal("baz");
      });
    });
    xit("ignores comment", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(
          fileResult.path,
          "# this is comment\r\nfoo=bar"
        );
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("bar");
        expect(result).to.have.lengthOf(1);
      });
    });
    it("set an empty string if there is no non-whitespace char after the key terminator", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo=\nbar= ");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("");
        expect(result.get("bar")).to.equal("");
      });
    });
    it("set an empty string if there is no key terminator", async () => {
      return file().then(async fileResult => {
        await promises.writeFile(fileResult.path, "foo");
        const result = await parseFile(fileResult.path);
        expect(result.get("foo")).to.equal("");
      });
    });
  });
  describe("#stringify", () => {
    it("provides methods returning Promise instance", () => {
      const result = stringify({ foo: "bar" });
      expect(result).to.be.an.instanceOf(Promise);
    });
    it("stringify properties", async () => {
      return stringify({ foo: "bar", baz: 42 }).then(result => {
        expect(result).to.include("foo = bar");
        expect(result).to.include("baz = 42");
        expect(result).to.equal("foo = bar\nbaz = 42\n");
      });
    });
    it("escapes multibyte chars", async () => {
      const result = await stringify({ face: "😁" });
      expect(result).to.include("face = \\ud83d\\ude01");
    });
    it("escapes CR", async () => {
      const result = await stringify({ text: "foo\rbar" });
      expect(result).to.include("text = foo\\rbar");
    });
    it("escapes LF", async () => {
      const result = await stringify({ text: "foo\nbar" });
      expect(result).to.include("text = foo\\nbar");
    });
    it("escapes = in key", async () => {
      const result = await stringify({ "foo=bar": "baz" });
      expect(result).to.include("foo\\=bar = baz");
    });
  });
  it("parses escaped multibyte chars", async () => {
    const result = await parse("face = \\ud83d\\ude01");
    expect(result.get("face")).to.equal("😁");
  });
  it("generates .properties file", done => {
    file()
      .then(fileResult => {
        write(
          {
            foo: "bar",
            baz: 42
          },
          fileResult.path
        )
          .then(() => {
            promises
              .readFile(fileResult.path, { encoding: "utf8" })
              .then(lines => {
                expect(lines).to.include("foo = bar");
                expect(lines).to.include("baz = 42");
                done();
              })
              .catch(err => done(err));
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });
});
