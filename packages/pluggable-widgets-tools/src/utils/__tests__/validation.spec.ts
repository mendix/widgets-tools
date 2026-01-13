import { WidgetValidationError, throwOnIllegalChars, throwOnNoMatch } from "../validation"

describe("Validation Utilities", () => {

    describe("throwOnIllegalChars", () => {

        it("throws when the input does not match the pattern", () => {
            expect(throwOnIllegalChars.bind(null, "abc", '0-9', "Test")).toThrow(WidgetValidationError)
        })

        it("does not throw when the input does match the pattern", () => {
            expect(throwOnIllegalChars.bind(null, "abc", 'a-z', "Test")).not.toThrow()
        })
    })

    describe("throwOnNoMatch", () => {

        it("throws when the input does not match the pattern", () => {
            expect(throwOnNoMatch.bind(null, "abc", /^$/, "Test")).toThrow(WidgetValidationError)
        })

        it("does not throw when the input does match the pattern", () => {
            expect(throwOnNoMatch.bind(null, "abc", /[a-z]/, "Test")).not.toThrow()
        })
    })

})

