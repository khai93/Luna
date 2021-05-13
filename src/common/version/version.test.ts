import Version from '.'
import { VersionNotValidError } from './version'

describe('Version Value Object', () => {
    describe('#isValid', () => {
        it.each([
            [undefined],
            [-5],
            [""],
            [false],
            [.0393]
        ])(
            'should throw VersionNotValidError if value is %i',
            (a) => {
                expect(
                    () => new Version(a as unknown as number),
                ).toThrowErrorMatchingInlineSnapshot(
                    `"Version number provided is not a postive integer."`,
                )
            },
        )
    });

    describe('#equals', () => {
        it.each([
            [1, 2, false],
            [500, 5, false],
            [20, 58287, false],
            [2, 2, true],
            [58378, 58378, true]
        ])('.equals(%i, %i): %s ', (a, b, expected) => {
            const aVersion = new Version(a);
            const bVersion = new Version(b);

            expect(aVersion.equals(bVersion)).toBe(expected);
        });
    });
})
