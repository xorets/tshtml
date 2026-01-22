import { spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { tmpdir } from "os";
import * as fs from "fs/promises";

describe("export-template CLI", () => {
    const fixturesDir = join(__dirname, "../fixtures");
    const projectRoot = resolve(__dirname, "../..");
    let tempDir: string;

    /**
     * Helper to run CLI command and capture stdout/stderr
     */
    function runCli(command: string, args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
        return new Promise((resolve) => {
            let stdout = "";
            let stderr = "";
            const child = spawn(command, args, {
                cwd: projectRoot,
                stdio: ["pipe", "pipe", "pipe"]
            });

            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            child.on("close", (code) => {
                resolve({ code, stdout, stderr });
            });

            child.on("error", (err) => {
                stderr += err.toString();
                resolve({ code: 1, stdout, stderr });
            });
        });
    }

    beforeAll(async () => {
        // dist/ is already built by pretest script
        // Just verify it exists
        const cliScript = join(projectRoot, "dist/export-template.js");
        if (!existsSync(cliScript)) {
            throw new Error("dist/export-template.js not found. Run 'npm run build' first.");
        }
    });

    beforeEach(async () => {
        // Create a temp directory for test outputs
        tempDir = join(tmpdir(), `tshtml-cli-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        await fs.mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
        // Clean up temp directory
        if (existsSync(tempDir)) {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    });

    describe("CLI behavior with valid input", () => {
        const cliScript = join(projectRoot, "dist/export-template.js");

        beforeEach(() => {
            // Verify dist/export-template.js exists
            if (!existsSync(cliScript)) {
                throw new Error("dist/export-template.js not found. Build may have failed.");
            }
        });

        it("should compile .tshtml file to .html file", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");
            const outputFile = join(fixturesDir, "simple-string.html");

            try {
                const result = await runCli("node", [cliScript, inputFile]);

                expect(result.code).toBe(0);
                expect(result.stderr).toBe("");
                expect(existsSync(outputFile)).toBe(true);

                const output = readFileSync(outputFile, "utf-8");
                expect(output).toBeTruthy();
            } finally {
                if (existsSync(outputFile)) {
                    await fs.unlink(outputFile);
                }
            }
        });

        it("should handle template with tshtml tags", async () => {
            const inputFile = join(fixturesDir, "with-tag.tshtml");
            const outputFile = join(fixturesDir, "with-tag.html");

            try {
                const result = await runCli("node", [cliScript, inputFile]);

                expect(result.code).toBe(0);
                expect(result.stderr).toBe("");
                expect(existsSync(outputFile)).toBe(true);

                const output = readFileSync(outputFile, "utf-8");
                expect(output).toContain("<div>");
            } finally {
                if (existsSync(outputFile)) {
                    await fs.unlink(outputFile);
                }
            }
        });

        it("should handle template with html tagged template", async () => {
            const inputFile = join(fixturesDir, "with-html-template.tshtml");
            const outputFile = join(fixturesDir, "with-html-template.html");

            try {
                const result = await runCli("node", [cliScript, inputFile]);

                expect(result.code).toBe(0);
                expect(result.stderr).toBe("");
                expect(existsSync(outputFile)).toBe(true);

                const output = readFileSync(outputFile, "utf-8");
                expect(output).toContain("<div>");
            } finally {
                if (existsSync(outputFile)) {
                    await fs.unlink(outputFile);
                }
            }
        });

        it("should output to stdout with --stdout flag", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");

            const result = await runCli("node", [cliScript, inputFile, "--stdout"]);

            expect(result.code).toBe(0);
            expect(result.stdout).toBeTruthy();
            expect(result.stdout).toContain("Hello");
        });

        it("should process multiple files without --stdout", async () => {
            const file1 = join(tempDir, "test1.tshtml");
            const file2 = join(tempDir, "test2.tshtml");
            const output1 = join(tempDir, "test1.html");
            const output2 = join(tempDir, "test2.html");

            await fs.writeFile(file1, "export default 'first';");
            await fs.writeFile(file2, "export default 'second';");

            const result = await runCli("node", [cliScript, file1, file2]);

            expect(result.code).toBe(0);
            expect(existsSync(output1)).toBe(true);
            expect(existsSync(output2)).toBe(true);
            expect(result.stderr).toBe("");
        });
    });

    describe("CLI error handling", () => {
        const cliScript = join(projectRoot, "dist/export-template.js");

        it("should reject files with non-.tshtml extension", async () => {
            const invalidFile = join(tempDir, "invalid.html");
            await fs.writeFile(invalidFile, "export default 'test';");

            const result = await runCli("node", [cliScript, invalidFile]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain("Input file must have .tshtml extension");
        });

        it("should reject missing input file", async () => {
            const missingFile = join(tempDir, "nonexistent.tshtml");

            const result = await runCli("node", [cliScript, missingFile]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain("Error processing file");
        });

        it("should require at least one file", async () => {
            const result = await runCli("node", [cliScript]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain("Please specify at least one .tshtml file");
        });

        it("should reject --stdout with multiple files", async () => {
            const file1 = join(tempDir, "test1.tshtml");
            const file2 = join(tempDir, "test2.tshtml");
            await fs.writeFile(file1, "export default 'test';");
            await fs.writeFile(file2, "export default 'test';");

            const result = await runCli("node", [cliScript, file1, file2, "--stdout"]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain("Cannot use --stdout with multiple files");
        });

        it("should handle invalid template syntax", async () => {
            const invalidTemplate = join(tempDir, "invalid.tshtml");
            await fs.writeFile(invalidTemplate, "this is not valid typescript");

            const result = await runCli("node", [cliScript, invalidTemplate]);

            expect(result.code).not.toBe(0);
            expect(result.stderr).toContain("Error processing file");
        });

        it("should handle template with no default export gracefully", async () => {
            const noExportTemplate = join(tempDir, "no-export.tshtml");
            await fs.writeFile(noExportTemplate, "export const value = 'test';");
            const outputFile = join(tempDir, "no-export.html");

            const result = await runCli("node", [cliScript, noExportTemplate]);

            // Should succeed but output file will be empty or contain undefined
            expect(result.code).toBe(0);
            expect(existsSync(outputFile)).toBe(true);
        });
    });

    describe("CLI with --stdout option", () => {
        const cliScript = join(projectRoot, "dist/export-template.js");

        it("should output only HTML to stdout without any log messages", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");

            const result = await runCli("node", [cliScript, inputFile, "--stdout"]);

            expect(result.code).toBe(0);
            // Should not contain "File is written" message
            expect(result.stdout).not.toContain("File is written");
            // Should contain actual HTML content
            expect(result.stdout).toContain("Hello");
        });

        it("should handle multiple templates with different content", async () => {
            const file1 = join(tempDir, "template1.tshtml");
            const file2 = join(tempDir, "template2.tshtml");
            const file3 = join(tempDir, "template3.tshtml");
            
            await fs.writeFile(file1, "export default 'First template';");
            await fs.writeFile(file2, "export default 'Second template';");
            await fs.writeFile(file3, "export default 'Third template';");

            const result = await runCli("node", [cliScript, file1, file2, file3]);

            expect(result.code).toBe(0);
            expect(result.stdout).toContain("File is written");
            const output1 = existsSync(join(tempDir, "template1.html"));
            const output2 = existsSync(join(tempDir, "template2.html"));
            const output3 = existsSync(join(tempDir, "template3.html"));
            expect(output1).toBe(true);
            expect(output2).toBe(true);
            expect(output3).toBe(true);
        });

        it("should preserve template with special characters", async () => {
            const specialCharsTemplate = join(tempDir, "special-chars.tshtml");
            await fs.writeFile(specialCharsTemplate, "export default '<div>&special < > chars</div>';");
            const outputFile = join(tempDir, "special-chars.html");

            const result = await runCli("node", [cliScript, specialCharsTemplate]);

            expect(result.code).toBe(0);
            expect(existsSync(outputFile)).toBe(true);
            const output = readFileSync(outputFile, "utf-8");
            expect(output).toContain("&special");
        });

        it("should handle partial file path argument", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");

            const result = await runCli("node", [cliScript, inputFile, "--stdout"]);

            expect(result.code).toBe(0);
            expect(result.stdout).toBeTruthy();
        });
    });

    describe("CLI argument parsing", () => {
        const cliScript = join(projectRoot, "dist/export-template.js");

        it("should ignore flags that don't start with double dash", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");
            const outputFile = join(fixturesDir, "simple-string.html");

            try {
                // Test with a flag-like argument that doesn't start with --
                const result = await runCli("node", [cliScript, inputFile, "-v"]);

                // Should treat -v as a file and fail
                expect(result.code).not.toBe(0);
                expect(result.stderr).toContain("Input file must have .tshtml extension");
            } finally {
                if (existsSync(outputFile)) {
                    await fs.unlink(outputFile);
                }
            }
        });

        it("should handle --stdout flag in different positions", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");

            const result = await runCli("node", [cliScript, "--stdout", inputFile]);

            expect(result.code).toBe(0);
            expect(result.stdout).toContain("Hello");
        });

        it("should handle multiple --stdout flags (last one counts)", async () => {
            const inputFile = join(fixturesDir, "simple-string.tshtml");

            const result = await runCli("node", [cliScript, inputFile, "--stdout", "--stdout"]);

            expect(result.code).toBe(0);
            expect(result.stdout).toContain("Hello");
        });
    });
});

