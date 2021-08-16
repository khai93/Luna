/**
 * Tests Balancer Options Value Object
 * 
 * @group unit/common
 */

import { BalancerOptions, BalancerOptionsNotValidError } from "./balancerOptions";

describe("BalancerOptions class", () => {
    it("should throw NotValidError if passed in a non-number as weight", () => {
        expect.assertions(1)

        try {
            new BalancerOptions({weight: "2" as any})
        } catch (e) {
            expect(e).toBeInstanceOf(BalancerOptionsNotValidError)
        }
    })
})