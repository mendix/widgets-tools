import { join } from "path";
import { shellCommandBuilder, ShellCommandContext } from "../shellCommand";

const ctx: ShellCommandContext = {
    toolsRoot: "/opt/textBox/node_modules/@mendix/pluggable-widgets-tools",
    widgetRoot: "/opt/textBox"
};

const aCommand = shellCommandBuilder("a");

describe("ShellCommandBuilder", () => {
    it("builds an empty string with no input", () => {
        const result = shellCommandBuilder().build(ctx);
        expect(result).toBe("");
    });

    it("builds space separated string from input", () => {
        const result = shellCommandBuilder("a", "b", "c").build(ctx);
        expect(result).toBe("a b c");
    });

    it("builds without unnecessary whitespace", () => {
        const result = shellCommandBuilder(" a ", " ", " c ").build(ctx);
        expect(result).toBe("a c");
    });

    it("builds contextual strings", () => {
        const result = shellCommandBuilder("a", ({ widgetRoot }) => widgetRoot + "/b").build(ctx);
        expect(result).toBe("a /opt/textBox/b");
    });

    it("builds with quotes", () => {
        const result = shellCommandBuilder("a", `"$MX_INSTALL_DIR/widgets"`).build(ctx);
        expect(result).toBe(`a "$MX_INSTALL_DIR/widgets"`);
    });

    describe("arguments", () => {
        it("builds string arguments", () => {
            const result = aCommand.arg("b").build(ctx);
            expect(result).toBe("a b");
        });

        it("builds contextual arguments", () => {
            const result = aCommand.arg(({ widgetRoot }) => widgetRoot + "/b").build(ctx);
            expect(result).toBe("a /opt/textBox/b");
        });

        it("builds mixed arguments", () => {
            const result = aCommand
                .arg("b")
                .arg(({ widgetRoot }) => widgetRoot + "/c")
                .arg("d")
                .build(ctx);
            expect(result).toBe("a b /opt/textBox/c d");
        });

        it("builds mixed arguments in single call", () => {
            const result = aCommand.arg("b", ({ widgetRoot }) => widgetRoot + "/c", "d").build(ctx);
            expect(result).toBe("a b /opt/textBox/c d");
        });
    });

    describe("options", () => {
        it("builds string option", () => {
            const result = aCommand.option("b", "c").build(ctx);
            expect(result).toBe("a --b c");
        });

        it("builds contextual option", () => {
            const result = aCommand.option("b", ({ widgetRoot }) => widgetRoot + "/c").build(ctx);
            expect(result).toBe("a --b /opt/textBox/c");
        });

        it("builds overwritten option", () => {
            const aCommandWithC = aCommand.option("b", "c");
            expect(aCommandWithC.build(ctx)).toBe("a --b c");

            const aCommandWithD = aCommandWithC.option("b", "d");
            expect(aCommandWithD.build(ctx)).toBe("a --b d");
        });

        it("builds overwritten contextual option", () => {
            const aCommandWithWidget = aCommand.option("b", ({ widgetRoot }) => widgetRoot);
            expect(aCommandWithWidget.build(ctx)).toBe("a --b /opt/textBox");

            const aCommandWithTools = aCommandWithWidget.option("b", ({ toolsRoot }) => toolsRoot);
            expect(aCommandWithTools.build(ctx)).toBe(
                "a --b /opt/textBox/node_modules/@mendix/pluggable-widgets-tools"
            );
        });

        it("builds multiple options", () => {
            const result = aCommand
                .option("b", "foo")
                .option("c", "bar")
                .option("d", ({ widgetRoot }) => widgetRoot)
                .build(ctx);
            expect(result).toBe("a --b foo --c bar --d /opt/textBox");
        });
    });

    describe("flags", () => {
        it("builds with a flag", () => {
            const result = aCommand.flag("foo").build(ctx);
            expect(result).toBe("a --foo");
        });

        it("builds single letter flags with a different prefix", () => {
            const result = aCommand.flag("b").build(ctx);
            expect(result).toBe("a -b");
        });

        it("builds with multiple flags", () => {
            const result = aCommand.flag("foo").flag("bar").build(ctx);
            expect(result).toBe("a --foo --bar");
        });

        it("only builds a flag once", () => {
            const result = aCommand.flag("foo").flag("foo").build(ctx);
            expect(result).toBe("a --foo");
        });

        it("does not build an unset flag", () => {
            const result = aCommand.flag("foo").unFlag("foo").build(ctx);
            expect(result).toBe("a");
        });

        it("does not build an unset flag amongst others", () => {
            const result = aCommand.flag("b").flag("foo").flag("bar").flag("c").unFlag("foo").build(ctx);
            expect(result).toBe("a -b --bar -c");
        });
    });

    describe("examples", () => {
        it("builds rollup commands", () => {
            const result = shellCommandBuilder("rollup")
                .option("config", ({ toolsRoot }) => join(toolsRoot, "configs/rollup.config.mjs"))
                .flag("watch")
                .flag("configProduction")
                .build(ctx);

            expect(result).toBe(
                "rollup --config /opt/textBox/node_modules/@mendix/pluggable-widgets-tools/configs/rollup.config.mjs --watch --configProduction"
            );
        });

        it("builds eslint commands", () => {
            const result = shellCommandBuilder("eslint")
                .option("config", ({ widgetRoot }) => join(widgetRoot, ".eslintrc.js"))
                .flag("fix")
                .build(ctx);
            expect(result).toBe("eslint --config /opt/textBox/.eslintrc.js --fix");
        });

        it("builds prettier commands", () => {
            const prettierFix = shellCommandBuilder("prettier")
                .option("config", ({ widgetRoot }) => join(widgetRoot, "prettier.config.js"))
                .arg(`"{src,typings,tests}/**/*.{js,jsx,ts,tsx,scss}"`)
                .flag("write");

            expect(prettierFix.build(ctx)).toBe(
                `prettier --config /opt/textBox/prettier.config.js "{src,typings,tests}/**/*.{js,jsx,ts,tsx,scss}" --write`
            );

            const prettierLint = prettierFix.unFlag("write").flag("check").build(ctx);
            expect(prettierLint).toBe(
                `prettier --config /opt/textBox/prettier.config.js "{src,typings,tests}/**/*.{js,jsx,ts,tsx,scss}" --check`
            );
        });
    });
});
