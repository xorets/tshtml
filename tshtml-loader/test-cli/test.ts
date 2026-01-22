/**
 * Integration tests for tshtml-to-html CLI command
 * 
 * These tests verify that the CLI works correctly when installed via npm-link
 * Run with: npm run link && npm test (from test-cli directory)
 */

import { exec } from "child_process";
import { existsSync, readFileSync, unlinkSync, rmSync } from "fs";
import { join, resolve } from "path";

const testDir = __dirname;

/**
 * Run a command and capture output
 */
function runCommand(command: string, args: string[]): Promise<{
    code: number | null;
    stdout: string;
    stderr: string;
}> {
    return new Promise((resolve) => {
        // Build the full command string with proper quoting
        const escapedArgs = args
            .map(arg => {
                // Add quotes around arguments that contain spaces or special characters
                if (arg.includes(" ") || arg.includes("$") || arg.includes("`")) {
                    return `"${arg.replace(/"/g, '\\"')}"`;
                }
                return arg;
            })
            .join(" ");

        const fullCommand = `${command} ${escapedArgs}`;

        exec(fullCommand, { cwd: testDir }, (error, stdout, stderr) => {
            resolve({
                code: error?.code || (error ? 1 : 0),
                stdout,
                stderr,
            });
        });
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    console.log("🧪 tshtml-to-html CLI Integration Tests\n");

    // Test 1: Single file compilation
    console.log("Test 1: Single file compilation");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "hello.tshtml"]);
        const outputExists = existsSync(join(testDir, "hello.html"));

        if (result.code === 0 && outputExists) {
            const content = readFileSync(join(testDir, "hello.html"), "utf-8");
            if (content.includes("Hello from CLI test template")) {
                console.log("✅ PASS: Single file compiled correctly\n");
                passed++;
                unlinkSync(join(testDir, "hello.html"));
            } else {
                console.log("❌ FAIL: Output content incorrect\n");
                failed++;
            }
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}, output exists: ${outputExists}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 2: Multiple file compilation
    console.log("Test 2: Multiple file compilation");
    try {
        const result = await runCommand("npx", [
            "tshtml-to-html",
            "hello.tshtml",
            "entities.tshtml",
            "nested.tshtml",
        ]);

        const helloExists = existsSync(join(testDir, "hello.html"));
        const entitiesExists = existsSync(join(testDir, "entities.html"));
        const nestedExists = existsSync(join(testDir, "nested.html"));

        if (result.code === 0 && helloExists && entitiesExists && nestedExists) {
            console.log("✅ PASS: Multiple files compiled correctly\n");
            passed++;
            unlinkSync(join(testDir, "hello.html"));
            unlinkSync(join(testDir, "entities.html"));
            unlinkSync(join(testDir, "nested.html"));
        } else {
            console.log(
                `❌ FAIL: Exit code ${result.code}, hello: ${helloExists}, entities: ${entitiesExists}, nested: ${nestedExists}\n`
            );
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 3: Template inheritance - .tshtml importing from .ts file
    console.log("Test 3: Template inheritance - .tshtml importing from .ts file");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "extended.tshtml"]);
        const outputExists = existsSync(join(testDir, "extended.html"));

        if (result.code === 0 && outputExists) {
            const content = readFileSync(join(testDir, "extended.html"), "utf-8");
            if (content.includes("User Registration") && content.includes("Username") && content.includes("Email")) {
                console.log("✅ PASS: Extended template importing from .ts file compiled correctly\n");
                passed++;
                unlinkSync(join(testDir, "extended.html"));
            } else {
                console.log("❌ FAIL: Output content missing expected elements\n");
                console.log(`  Content: ${content.substring(0, 200)}\n`);
                failed++;
            }
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}, output exists: ${outputExists}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 4: Multiple files including template with cross-file import
    console.log("Test 4: Multiple files including template with cross-file import");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "hello.tshtml", "extended.tshtml", "nested.tshtml"]);
        const helloExists = existsSync(join(testDir, "hello.html"));
        const extendedExists = existsSync(join(testDir, "extended.html"));
        const nestedExists = existsSync(join(testDir, "nested.html"));

        if (result.code === 0 && helloExists && extendedExists && nestedExists) {
            const extendedContent = readFileSync(join(testDir, "extended.html"), "utf-8");
            if (extendedContent.includes("User Registration") && extendedContent.includes("Username")) {
                console.log("✅ PASS: Multiple files with cross-file import compiled correctly\n");
                passed++;
                unlinkSync(join(testDir, "hello.html"));
                unlinkSync(join(testDir, "extended.html"));
                unlinkSync(join(testDir, "nested.html"));
            } else {
                console.log("❌ FAIL: Extended template content incorrect\n");
                failed++;
            }
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}, files exist: hello=${helloExists}, extended=${extendedExists}, nested=${nestedExists}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 5: Files in subdirectory
    console.log("Test 5: Files in subdirectory");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "subdir/sub-template.tshtml"]);
        const outputExists = existsSync(join(testDir, "subdir/sub-template.html"));

        if (result.code === 0 && outputExists) {
            const content = readFileSync(join(testDir, "subdir/sub-template.html"), "utf-8");
            if (content.includes("Template in subdirectory")) {
                console.log("✅ PASS: Subdirectory file compiled correctly\n");
                passed++;
                unlinkSync(join(testDir, "subdir/sub-template.html"));
            } else {
                console.log("❌ FAIL: Output content incorrect\n");
                failed++;
            }
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}, output exists: ${outputExists}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 6: Multiple files in subdirectory
    console.log("Test 6: Multiple files including subdirectories");
    try {
        const result = await runCommand("npx", [
            "tshtml-to-html",
            "hello.tshtml",
            "subdir/sub-template.tshtml",
            "subdir/nested-subdir.tshtml",
        ]);

        const helloExists = existsSync(join(testDir, "hello.html"));
        const subExists = existsSync(join(testDir, "subdir/sub-template.html"));
        const nestedSubExists = existsSync(join(testDir, "subdir/nested-subdir.html"));

        if (result.code === 0 && helloExists && subExists && nestedSubExists) {
            console.log("✅ PASS: Mixed files with subdirectories compiled correctly\n");
            passed++;
            unlinkSync(join(testDir, "hello.html"));
            unlinkSync(join(testDir, "subdir/sub-template.html"));
            unlinkSync(join(testDir, "subdir/nested-subdir.html"));
        } else {
            console.log(
                `❌ FAIL: Exit code ${result.code}, hello: ${helloExists}, sub: ${subExists}, nestedSub: ${nestedSubExists}\n`
            );
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 7: stdout output
    console.log("Test 7: Output to stdout with --stdout flag");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "hello.tshtml", "--stdout"]);

        if (result.code === 0 && result.stdout.includes("Hello from CLI test template")) {
            console.log("✅ PASS: stdout output works correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stdout) console.log(`  stdout: ${result.stdout.substring(0, 100)}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 8: stdout with nested template
    console.log("Test 8: stdout with nested tag template");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "nested.tshtml", "--stdout"]);

        if (result.code === 0 && result.stdout.includes("Nested Template") && result.stdout.includes("<div>")) {
            console.log("✅ PASS: stdout with nested tags works correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stdout) console.log(`  stdout: ${result.stdout.substring(0, 100)}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 9: Error handling - missing file
    console.log("Test 9: Error handling - missing file");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "nonexistent.tshtml"]);

        if (result.code !== 0 && result.stderr.includes("Error processing file")) {
            console.log("✅ PASS: Missing file error handled correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 10: Error handling - wrong extension
    console.log("Test 10: Error handling - wrong file extension");
    try {
        const result = await runCommand("npx", ["tshtml-to-html", "hello.txt"]);

        if (result.code !== 0 && result.stderr.includes("Input file must have .tshtml extension")) {
            console.log("✅ PASS: Extension validation works correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 11: Error handling - no files specified
    console.log("Test 11: Error handling - no files specified");
    try {
        const result = await runCommand("npx", ["tshtml-to-html"]);

        if (result.code !== 0 && result.stderr.includes("Please specify at least one .tshtml file")) {
            console.log("✅ PASS: Empty arguments error handled correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Test 12: Error handling - stdout with multiple files
    console.log("Test 12: Error handling - --stdout with multiple files");
    try {
        const result = await runCommand("npx", [
            "tshtml-to-html",
            "hello.tshtml",
            "entities.tshtml",
            "--stdout",
        ]);

        if (result.code !== 0 && result.stderr.includes("Cannot use --stdout with multiple files")) {
            console.log("✅ PASS: Multi-file stdout restriction works correctly\n");
            passed++;
        } else {
            console.log(`❌ FAIL: Exit code ${result.code}\n`);
            if (result.stderr) console.log(`  stderr: ${result.stderr}\n`);
            failed++;
        }
    } catch (err) {
        console.log(`❌ FAIL: ${err}\n`);
        failed++;
    }

    // Summary
    console.log("\n📊 Test Summary");
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();

