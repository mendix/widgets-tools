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

/**
 * Execute a command and log output
 */
function exec(command, cwd) {
    console.log(`\n📦 Running: ${command}`);
    try {
        execSync(command, {
            cwd,
            stdio: "inherit",
            env: { ...process.env, FORCE_COLOR: "1" }
        });
    } catch (error) {
        console.error(`❌ Command failed: ${command}`);
        process.exit(1);
    }
}

/**
 * Check if a file exists
 */
function checkFile(path, description) {
    if (!existsSync(path)) {
        console.error(`❌ Missing ${description}: ${path}`);
        process.exit(1);
    }
    const stats = statSync(path);
    console.log(`✓ ${description}: ${path} (${stats.size} bytes)`);
    return path;
}

/**
 * Verify that a file is a valid ZIP archive (MPK files are ZIP files)
 */
function verifyZipFile(path) {
    const buffer = readFileSync(path);
    // Check ZIP magic bytes: 0x50 0x4B (PK)
    if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
        console.log(`✓ MPK file is a valid ZIP archive`);
        return true;
    }
    console.error(`❌ MPK file is not a valid ZIP archive (invalid magic bytes)`);
    process.exit(1);
}

console.log("🧪 Integration Test for @mendix/vite-config-widgets-web\n");
console.log("=" .repeat(60));

// Phase 0: Setup - Create temp directory and prepare results directory
console.log("\n📦 Phase 0: Setting up test environment...");
const tempDir = join(tmpdir(), `vite-config-widgets-web-test-${Date.now()}`);
const testWidgetDir = join(tempDir, "test-checkbox");

console.log(`Creating temporary directory: ${tempDir}`);
mkdirSync(tempDir, { recursive: true });

// Ensure results directory exists and is clean
if (existsSync(resultsDir)) {
    rmSync(resultsDir, { recursive: true, force: true });
}
mkdirSync(resultsDir, { recursive: true });
console.log(`✓ Results directory ready: ${resultsDir}`);

// Phase 1: Build the vite-config package
console.log("\n📦 Phase 1: Building vite-config package...");
exec("pnpm build", packageRoot);
const builtConfigPath = checkFile(join(packageRoot, "dist/config.web.mjs"), "Built config file");

// Phase 2: Copy test widget to temp directory
console.log("\n📦 Phase 2: Copying test widget to temp directory...");
cpSync(testWidgetSourceDir, testWidgetDir, {
    recursive: true,
    filter: (src) => {
        // Exclude node_modules and dist from copy
        return !src.includes("node_modules") && !src.includes("dist");
    }
});
console.log(`✓ Copied test widget to: ${testWidgetDir}`);

// Pack the vite-config package and install from tarball
console.log("\n📦 Phase 3: Packing vite-config package...");
exec("pnpm pack --pack-destination " + tempDir, packageRoot);

// Find the tarball
const tarballName = `mendix-vite-config-widgets-web-${JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf-8")).version}.tgz`;
const tarballPath = join(tempDir, tarballName);
checkFile(tarballPath, "Package tarball");

// Update vite.config.ts to use the npm package
const viteConfigPath = join(testWidgetDir, "vite.config.ts");
const viteConfig = readFileSync(viteConfigPath, "utf-8");
const updatedViteConfig = viteConfig.replace(
    'from "../../dist/config.web.mjs"',
    'from "@mendix/vite-config-widgets-web/config.web"'
);
writeFileSync(viteConfigPath, updatedViteConfig);
console.log(`✓ Updated vite.config.ts to use npm package`);

// Update package.json to install from tarball
const testPackageJsonPath = join(testWidgetDir, "package.json");
const testPackageJson = JSON.parse(readFileSync(testPackageJsonPath, "utf-8"));
testPackageJson.devDependencies["@mendix/vite-config-widgets-web"] = `file:${tarballPath}`;
writeFileSync(testPackageJsonPath, JSON.stringify(testPackageJson, null, 2));
console.log(`✓ Updated test widget package.json to use tarball`);

// Phase 4: Install dependencies for test widget
console.log("\n📦 Phase 4: Installing test widget dependencies...");
exec("npm install", testWidgetDir);

// Phase 5: Build the test widget
console.log("\n📦 Phase 5: Building test widget...");
exec("npm run build", testWidgetDir);

// Phase 6: Verify artifacts
console.log("\n📦 Phase 6: Verifying build artifacts...");
console.log("-" .repeat(60));

const distDir = join(testWidgetDir, "dist");
const mpkPath = checkFile(
    join(distDir, "1.0.0/TestCheckbox.mpk"),
    "MPK file"
);

checkFile(
    join(distDir, "tmp/widgets/mendix/testcheckbox/testcheckbox/TestCheckbox.js"),
    "Runtime JS file"
);

checkFile(
    join(distDir, "tmp/widgets/mendix/testcheckbox/testcheckbox/TestCheckbox.mjs"),
    "Runtime MJS file"
);

checkFile(
    join(distDir, "tmp/widgets/TestCheckbox.xml"),
    "Widget XML"
);

checkFile(
    join(distDir, "tmp/widgets/package.xml"),
    "Package XML"
);

// Verify MPK is a valid ZIP
verifyZipFile(mpkPath);

// Phase 7: Copy results back to repository
console.log("\n📦 Phase 7: Copying results to test/results/...");
cpSync(distDir, resultsDir, { recursive: true });
console.log(`✓ Copied build artifacts to: ${resultsDir}`);

// Cleanup temp directory
console.log("\n📦 Cleaning up temporary directory...");
rmSync(tempDir, { recursive: true, force: true });
console.log(`✓ Removed temporary directory: ${tempDir}`);

console.log("\n" + "=".repeat(60));
console.log("✅ Integration test PASSED");
console.log("=" .repeat(60));
console.log("\nAll build artifacts created successfully!");
console.log(`\nResults location: ${resultsDir}`);
console.log(`MPK location: ${join(resultsDir, "1.0.0/TestCheckbox.mpk")}`);
