import { describe, it, expect } from "vitest"
import { calculateDamage } from "../../engine/damageCalculator"

// Add more cases as more stats interact with each other, try cases of boundary values for stats
describe("calculateDamage", () => {
  it("returns the same number for a positive damage value", () => {
    expect(calculateDamage(100)).toBe(100)
  })

  it("returns 0 when given 0", () => {
    expect(calculateDamage(0)).toBe(0)
  })

  it("returns the same value for negative numbers (passes-through)", () => {
    expect(calculateDamage(-10)).toBe(-10)
  })
})
