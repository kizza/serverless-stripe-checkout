import { ensureArray, mapKeys } from "../src/util"

describe("Util", () => {
  describe("ensureArray", () => {
    it("works when not an array", async () => {
      expect(ensureArray("item")).toEqual(["item"])
    })

    it("works when already an array", async () => {
      expect(ensureArray(["item"])).toEqual(["item"])
    })
  })

  describe("mapKeys", () => {
    it("maps keys", async () => {
      const original = {one: "one", two: "two"}
      const mapped = mapKeys(original, (key: string) => `${key}Mapped`)
      expect(mapped).toEqual({oneMapped: "one", twoMapped: "two"})
    })
  })
})
