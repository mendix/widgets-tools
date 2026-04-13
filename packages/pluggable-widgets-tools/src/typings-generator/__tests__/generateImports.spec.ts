import { ImportableModule, generateImports } from "../generateImports";

describe("generateImports", () => {
    let myModules: ImportableModule[];

    beforeEach(() => {
        myModules = [new ImportableModule("my-module", ["foo", "bar", "baz"])];
    });

    describe("given code without names in importable modules", () => {
        const code = `
            function add(x, y) {
                return x + y + magicNumber
            }
        `;

        it("produces no import statements", () => {
            const imports = generateImports(myModules, code);
            expect(imports).toHaveLength(0);
        });
    })

});
