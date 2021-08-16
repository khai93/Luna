/**
 * Tests Balancer Options Value Object
 * 
 * @group unit/common
 */

import { BalancerOptions, BalancerOptionsNotValidError } from "./balancerOptions";

describe("BalancerOptions class", () => {
    it("should throw NotValidError if passed in a non-number as weight", () => {
        expect( new BalancerOptions({weight: "" as any})).toThrowError(BalancerOptionsNotValidError)
    })
})