import { groupBy } from "./helpers";

export class ImportableModule {

    constructor(
        public readonly from: string,
        public readonly exportedMembers: string[]
    ) { }

    /**
    * Creates an import statement which binds names found in the given code to exported members of the module.
    */
    generateImportStatement(unboundCode: string): ImportStatement {
        const usedNames = this.exportedMembers.filter(type => new RegExp(`\\W${type}\\W`).test(unboundCode));
        return new ImportStatement(this.from, usedNames);
    }
}

export class ImportStatement {
    constructor(
        public readonly from: string,
        public readonly members: string[]
    ) { }

    get type() {
        return this.members.length > 0 ? this.members.length === 1 ? "single" : "multiple" : "none";
    }

    public toString() {
        return `import { ${this.members.join(", ")} } from "${this.from}";`;
    }
}

export function generateImports(importableModules: ImportableModule[], generatedTypesCode: string): ImportStatement[] {
    const importsByType = importableModules
        .map(m => m.generateImportStatement(generatedTypesCode))
        .reduce(groupBy(({ type }: ImportStatement) => type), {});

    // Sort according to eslint sort-imports default settings.
    return [importsByType.multiple ?? [], importsByType.single ?? []]
        .flatMap(s => s.sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
}

