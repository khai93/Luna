/**
 * Tests Balancer Options Value Object
 * 
 * @group unit/common
 */

import { BalancerOptions, BalancerOptionsNotValidError } from "./balancerOptions";

describe("BalancerOptions class", () => {
    it("should throw NotValidError if passed in a non-number as weight", () => {
        try {
            const n = new BalancerOptions({weight: "" as any});
        } catch (e) {
            expect(e).toThrowError(BalancerOptionsNotValidError)
        }
    })
})