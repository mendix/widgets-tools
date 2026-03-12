#!/usr/bin/env node

import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");
const testWidgetSourceDir = join(__dirname, "test-checkbox");
const resultsDir = join(__dirname, "results");

function log(message) {
    console.log(`  ${message}`);
}

function logSuccess(message) {
    console.log(`  ✓ ${message}`);
}

function logError(message) {
    console.error(`  ❌ ${message}`);
}

function exec(command, cwd, description) {
    if (description) {
        log(`${description}...`);
    }
    log(`Running: ${command}`);
    try {
        execSync(command, {
            cwd,
            stdio: "inherit",
            env: { ...process.env, FORCE_COLOR: "1" }
        });
        if (description) {
            logSuccess(description);
        }
    } catch (error) {
        logError(`Command failed: ${command}`);
        process.exit(1);
    }
}

function checkFile(path, description) {
    if (!existsSync(path)) {
        logError(`Missing ${description}`);
        logError(`Expected: ${path}`);
        process.exit(1);
    }
    const stats = statSync(path);
    const size = stats.size < 1024 ? `${stats.size} bytes` : `${(stats.size / 1024).toFixed(1)} KB`;
    logSuccess(`${description} (${size})`);
    return path;
}

function verifyZipFile(path) {
    const buffer = readFileSync(path);
    if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
        logSuccess("MPK is valid ZIP archive");
        return true;
    }
    logError("MPK is not a valid ZIP archive");
    process.exit(1);
}

console.log("\n🧪 Integration Test for @mendix/vite-config-widgets-web");
console.log("=".repeat(60));

// Phase 0: Setup
console.log("\n📦 Phase 0: Setup test environment");
const tempDir = join(tmpdir(), `vite-config-widgets-web-test-${Date.now()}`);
const testWidgetDir = join(tempDir, "test-checkbox");

log(`Creating temp directory: ${tempDir.split("/").pop()}`);
mkdirSync(tempDir, { recursive: true });
logSuccess("Created temp directory");

if (existsSync(resultsDir)) {
    rmSync(resultsDir, { recursive: true, force: true });
}
mkdirSync(resultsDir, { recursive: true });
logSuccess("Results directory ready");

// Phase 1: Copy test widget
console.log("\n📦 Phase 1: Copy test widget");
log("Copying test-checkbox to temp directory...");
cpSync(testWidgetSourceDir, testWidgetDir, {
    recursive: true,
    filter: (src) => !src.includes("node_modules") && !src.includes("dist")
});
logSuccess("Copied test widget");

// Phase 2: Pack vite-config package
console.log("\n📦 Phase 2: Pack vite-config package");
exec("pnpm pack --pack-destination " + tempDir, packageRoot, "Packing vite-config-widgets-web");

const tarballName = `mendix-vite-config-widgets-web-${JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf-8")).version}.tgz`;
const tarballPath = join(tempDir, tarballName);
checkFile(tarballPath, "Package tarball");

log("Updating test widget to use packed tarball...");
const viteConfigPath = join(testWidgetDir, "vite.config.ts");
const viteConfig = readFileSync(viteConfigPath, "utf-8");
const updatedViteConfig = viteConfig.replace(
    'from "../../dist/config.web.mjs"',
    'from "@mendix/vite-config-widgets-web/config.web"'
);
writeFileSync(viteConfigPath, updatedViteConfig);

const testPackageJsonPath = join(testWidgetDir, "package.json");
const testPackageJson = JSON.parse(readFileSync(testPackageJsonPath, "utf-8"));
testPackageJson.devDependencies["@mendix/vite-config-widgets-web"] = `file:${tarballPath}`;
writeFileSync(testPackageJsonPath, JSON.stringify(testPackageJson, null, 2));
logSuccess("Updated vite.config.ts and package.json");

// Phase 3: Install dependencies
console.log("\n📦 Phase 3: Install test widget dependencies");
exec("npm install", testWidgetDir, "Installing dependencies");

// Phase 4: Build test widget
console.log("\n📦 Phase 4: Build test widget");
exec("npm run build", testWidgetDir, "Building widget with Vite");

// Phase 5: Verify artifacts
console.log("\n📦 Phase 5: Verify build artifacts");
const distDir = join(testWidgetDir, "dist");
const mpkPath = checkFile(join(distDir, "1.0.0/TestCheckbox.mpk"), "MPK file");
checkFile(join(distDir, "tmp/widgets/mendix/testcheckbox/testcheckbox/TestCheckbox.js"), "Runtime JS");
checkFile(join(distDir, "tmp/widgets/mendix/testcheckbox/testcheckbox/TestCheckbox.mjs"), "Runtime MJS");
checkFile(join(distDir, "tmp/widgets/TestCheckbox.xml"), "Widget XML");
checkFile(join(distDir, "tmp/widgets/package.xml"), "Package XML");
checkFile(join(testWidgetDir, "typings/TestCheckboxProps.d.ts"), "TypeScript typings");
verifyZipFile(mpkPath);

// Phase 6: Copy results
console.log("\n📦 Phase 6: Copy results");
log("Copying artifacts to test/results...");
cpSync(distDir, resultsDir, { recursive: true });
logSuccess("Copied build artifacts");

log("Cleaning up temp directory...");
rmSync(tempDir, { recursive: true, force: true });
logSuccess("Removed temp directory");

console.log("\n" + "=".repeat(60));
console.log("✅ Integration test PASSED");
console.log("=".repeat(60));
console.log(`\nResults: ${resultsDir}`);
console.log(`MPK:     ${join(resultsDir, "1.0.0/TestCheckbox.mpk")}`);
