import "mocha"
import { expect } from "chai"
import { promises } from "fs"
import { file } from "tmp-promise";
import { stringify, write } from "../src/index"

describe("public API", () => {
  it("provides methods returning Promise instance", () => {
    const result = stringify({ foo: "bar" })
    expect(result).to.be.an.instanceOf(Promise)
  })
  it("stringify properties", (done) => {
    stringify({ foo: "bar", baz: 42 }).then(result => {
      expect(result).to.include("foo = bar")
      expect(result).to.include("baz = 42")
      done()
    })
  })
  it("generates .properties file", (done) => {
    file().then(fileResult => {
      write({
        foo: "bar",
        baz: 42
      }, fileResult.path).then(() => {
        promises.readFile(fileResult.path, { encoding: 'utf8' }).then(lines => {
          expect(lines).to.include("foo = bar")
          expect(lines).to.include("baz = 42")
          done()
        }).catch(err => done(err))
      }).catch(err => done(err))
    }).catch(err => done(err))
  })
})
