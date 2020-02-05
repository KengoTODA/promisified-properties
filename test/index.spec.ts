import "mocha"
import { expect } from "chai"
import { stringify } from "../src/index"

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
})
