# tshtml-to-html CLI Integration Tests

This directory contains integration tests for the `tshtml-to-html` CLI command, testing it as an end-user would use it.

## Purpose

These tests verify that:
1. The CLI works correctly when installed as an npm package
2. The `tshtml-to-html` command is properly linked and executable
3. All CLI features work in a realistic environment

## Setup Instructions

### One-time Setup

1. **Install dependencies in test-cli**:
   ```bash
   cd tshtml-loader/test-cli
   npm install
   ```

2. **Link tshtml-loader locally**:
   From the tshtml-loader directory:
   ```bash
   npm link
   ```
   
   Then from test-cli directory:
   ```bash
   npm link tshtml-loader
   ```

   This allows test-cli to use the local development version of tshtml-loader instead of a published npm package.

### Running Tests

```bash
cd tshtml-loader/test-cli
npm test
```

### Interactive Testing

You can also test the CLI manually:

```bash
# After npm link tshtml-loader
npx tshtml-to-html hello.tshtml
npx tshtml-to-html hello.tshtml --stdout
npx tshtml-to-html hello.tshtml entities.tshtml
```

## Test Templates

- **hello.tshtml**: Simple template with plain text
- **entities.tshtml**: Template with HTML entities
- **nested.tshtml**: Template using tshtml tag API
- **base.tshtml**: Base class template with overridable methods
- **extended.tshtml**: Extended class that inherits from base.tshtml
- **subdir/sub-template.tshtml**: Simple template in subdirectory
- **subdir/nested-subdir.tshtml**: Template with tags in subdirectory

## What Gets Tested

1. ✅ Single file compilation to .html
2. ✅ Multiple file compilation
3. ✅ Template inheritance (class extending base class)
4. ✅ Extended template with overridden methods
5. ✅ Files in subdirectories
6. ✅ Multiple files including subdirectories
7. ✅ stdout output with --stdout flag
8. ✅ stdout with nested tag templates
9. ✅ Error: missing files
10. ✅ Error: wrong file extension
11. ✅ Error: no arguments provided
12. ✅ Error: --stdout with multiple files

## Cleanup

Generated .html files are automatically cleaned up during testing. To manually clean:

```bash
rm *.html
```

## How It Works

The test-cli directory is a separate npm package that depends on `tshtml-loader`. By using `npm link`, it uses the local version under development rather than the published package. This allows testing the CLI as if it were properly installed globally or as a dependency, catching issues that might not be caught by unit tests alone.
