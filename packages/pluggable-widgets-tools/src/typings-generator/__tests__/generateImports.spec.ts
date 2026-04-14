import { ImportableModule, generateImports, ImportStatement } from "../generateImports";

describe("generateImports", () => {

    describe("with no modules", () => {
        it("returns no import statements for empty code", () => {
            const result = generateImports([], "");
            expect(result).toEqual([]);
        });

        it("returns no import statements", () => {
            const result = generateImports([], "const x = 5; const y = 10;");
            expect(result).toEqual([]);
        });
    });

    describe("with modules", () => {
        const foobarModule = new ImportableModule("foobar", ["foo", "bar", "baz"]);
        const numbersModule = new ImportableModule("numbers", ["pi", "e", "infinity"]);
        const animalsModule = new ImportableModule("animals", ["cat", "dog", "capibara"]);

        describe("with no matching members in code", () => {

            it("returns no import statements", () => {
                const code = "x y z";
                const result = generateImports([foobarModule, numbersModule, animalsModule], code);

                expect(result).toEqual([]);
            });

        });

        describe("with matching members in code", () => {

            it("returns import statements for each module with matching members", () => {
                const code = " foo  cat ";
                const result = generateImports([foobarModule, animalsModule], code);

                expect(result).toHaveLength(2);
                expect(result[0].from).toBe("animals");
                expect(result[1].from).toBe("foobar");
            });

            it("orders import statements alphabetically by module name", () => {
                const code = " foo  pi  cat ";
                const result = generateImports([foobarModule, numbersModule, animalsModule], code);

                expect(result.map(s => s.from)).toEqual(["animals", "foobar", "numbers"]);
            });

            describe("with mixed import types", () => {
                const code = " foo  bar  pi  e  cat ";
                const result = generateImports([numbersModule, animalsModule, foobarModule], code);

                it("groups import statements by type (multiple, single)", () => {
                    // Multiple-member imports should come first
                    expect(result[0].members).toHaveLength(2);
                    expect(result[1].members).toHaveLength(2);

                    // Single-member imports should come last
                    expect(result[2].members).toHaveLength(1);
                });

                it("sorts grouped imports alphabetically", () => {
                    expect(result[0].from).toBe("foobar")
                    expect(result[1].from).toBe("numbers")
                });
            })

        });

    });

});

describe("ImportableModule", () => {

    describe("generateImportStatement()", () => {
        const module = new ImportableModule("test-module", ["TypeA", "TypeB", "helper"]);

        it("finds no members for empty code", () => {
            const statement = module.generateImportStatement("");
            expect(statement.members).toEqual([]);
            expect(statement.from).toBe("test-module");
        });

        it("finds no members for code with names containing members", () => {
            // Should NOT match partial names like "TypeAbc" or "myhelper"
            const code = "TypeAbc myhelper";
            const statement = module.generateImportStatement(code);
            expect(statement.members).toEqual([]);
        });

        it.each([" TypeA ", "(TypeA)", "{TypeA}", "<TypeA>", "'TypeA'", '"TypeA"', " TypeA.foo", " TypeA:"])(
            "matches member TypeA in code `%s`", (code) => {
                const statement = module.generateImportStatement(code);
                expect(statement.members).toContain("TypeA");
            });
    });
});

describe("ImportStatement", () => {

    describe("type property", () => {

        it("returns 'none' for statement with no members", () => {
            const statement = new ImportStatement("test-module", []);
            expect(statement.type).toBe("none");
        });

        it("returns 'single' for statement with 1 member", () => {
            const statement = new ImportStatement("test-module", ["TypeA"]);
            expect(statement.type).toBe("single");
        });

        it("returns 'multiple' for statement with multiple members", () => {
            const statement = new ImportStatement("test-module", ["TypeA", "TypeB"]);
            expect(statement.type).toBe("multiple");
        });
    });

    describe("toString() formats string properly", () => {

        it("for statement with 1 member", () => {
            const statement = new ImportStatement("test-module", ["TypeA"]);
            expect(statement.toString()).toBe('import { TypeA } from "test-module";');
        });

        it("for statement with multiple members", () => {
            const statement = new ImportStatement("test-module", ["TypeA", "TypeB", "helper"]);
            expect(statement.toString()).toBe('import { TypeA, TypeB, helper } from "test-module";');
        });
    });
});
