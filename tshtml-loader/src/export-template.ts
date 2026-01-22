#!/usr/bin/env node

/**
 * CLI helper to compile .tshtml files to .html on disk or stdout.
 * 
 * Usage:
 *   tshtml-to-html file.tshtml              # Writes file.html
 *   tshtml-to-html file.tshtml --stdout     # Outputs to stdout
 *   tshtml-to-html file1.tshtml file2.tshtml # Writes file1.html and file2.html
 */
import { readFile, writeFile } from "fs";
import * as path from "node:path";
import { executeTemplate, templateToString } from "./index";

// Parse command line arguments
const args = process.argv.slice(2);
const useStdout = args.includes("--stdout");
const fileArgs = args.filter(arg => !arg.startsWith("--"));

if (fileArgs.length === 0) {
    console.error("Please specify at least one .tshtml file");
    process.exit(1);
}

if (fileArgs.length > 1 && useStdout) {
    console.error("Cannot use --stdout with multiple files");
    process.exit(1);
}

// Validate all files have .tshtml extension
for (const fileArg of fileArgs) {
    const extension = path.extname(fileArg).toLowerCase();
    if (extension !== ".tshtml") {
        console.error("Input file must have .tshtml extension");
        process.exit(1);
    }
}

// Process each file with Promise-based approach
async function processFiles() {
    let errorCount = 0;

    for (const fileArg of fileArgs) {
        const absoluteFileName = path.resolve(fileArg);
        const extension = path.extname(absoluteFileName).toLowerCase();
        const fileNameNoExtension = absoluteFileName.substr(0, absoluteFileName.length - extension.length);
        const outputFileName = fileNameNoExtension + ".html";

        try {
            // Read file
            const data = await new Promise<string>((resolve, reject) => {
                readFile(absoluteFileName, { encoding: 'utf-8' }, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            // Transform the source
            const result = executeTemplate(data, absoluteFileName);
            const htmlResult = templateToString(result.exports.default);

            if (useStdout) {
                // Output to stdout
                process.stdout.write(htmlResult);
            } else {
                // Write to destination file
                await new Promise<void>((resolve, reject) => {
                    writeFile(outputFileName, htmlResult, {
                        encoding: "utf8",
                        flag: "w",
                    }, (writeErr) => {
                        if (writeErr) reject(writeErr);
                        else resolve();
                    });
                });
                console.log(`File is written: ${outputFileName}`);
            }
        } catch (err) {
            console.error(`Error processing file ${absoluteFileName}:`, err);
            errorCount++;
        }
    }

    return errorCount;
}

// Run and exit
processFiles().then(errorCount => {
    process.exit(errorCount > 0 ? 1 : 0);
}).catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});