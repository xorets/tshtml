# GitHub Workflows Guide for Automated Publishing

This document explains the npm package publishing workflow for the tshtml monorepo, covering CI (Continuous Integration), version management, and release automation.

## Overview

The monorepo uses **GitHub Actions** to automate:
1. **Testing** on every pull request and commit (CI)
2. **Version management** using Changesets
3. **Publishing** to npm with provenance attestation

### Key Technologies

- **Changesets**: Manages version bumping and changelog generation across both packages in sync
- **GitHub Actions**: Automated workflows that run on specific triggers
- **npm link**: Local development with symlinked packages (no publishing needed)
- **npm pack**: Create tarballs for pre-release testing
- **npm provenance**: Cryptographic proof that packages were built by your CI/CD pipeline

## Workflow Files

Two GitHub Actions workflow files control the process:

### 1. `.github/workflows/ci.yml` - Continuous Integration

**Triggers**: Runs on every:
- Push to `main` or `develop` branches
- Pull request to `main` or `develop` branches

**What it does**:
- Tests on Node.js 18 and 20
- Runs `npm test` to execute test suite
- Runs `npm run coverage` to ensure coverage thresholds are met
- Runs `npm audit` to check for vulnerable dependencies

**Status**: Fails if tests fail or coverage thresholds not met - PRs cannot be merged unless CI passes.

### 2. `.github/workflows/publish.yml` - Automated Publishing

**Triggers**: Runs when `.changeset/` folder is modified on `main` branch

**Two-phase process**:

#### Phase 1: Changeset → Version PR
The `changesets/action` automatically:
1. Detects all changesets in `.changeset/` folder
2. Bumps versions in package.json files (synchronized across both packages)
3. Generates/updates CHANGELOG.md files
4. Creates a "Publish Packages" PR with all changes

**You should**:
- Review the PR for correctness
- Merge the PR when ready to publish
- This triggers Phase 2 automatically

#### Phase 2: Publish to npm
After the Version PR is merged, the workflow:
1. Builds both packages (`npm run build`)
2. Runs full test suite
3. Publishes each package to npm with `--provenance` flag
4. Creates GitHub Release notes

**Important**: Publish only happens after Version PR merge. You control the timing.

## Testing Packages Locally

Before publishing, you can test the packaged versions locally:

### Packing Packages to `/dist`

Create tarball packages ready for distribution or local testing:

```bash
npm run pack
```

This:
1. Builds both packages
2. Creates `dist/tshtml-1.4.0.tgz` and `dist/tshtml-loader-1.4.0.tgz`

**Why `/dist`?** This is a best practice for monorepos:
- Keeps source code clean and separate from artifacts
- Allows consumers to test packages before publishing to npm
- Enables version-specific testing (e.g., test with 1.4.0, then 1.5.0)
- Can be committed to git for CI/CD workflows

### Using Packaged Versions in Tests

You can test projects using the packaged versions (without npm):

```json
// In your test project's package.json
{
  "dependencies": {
    "tshtml": "file:../dist/tshtml-1.4.0.tgz",
    "tshtml-loader": "file:../dist/tshtml-loader-1.4.0.tgz"
  }
}
```

Then `npm install` will use the local tarballs instead of npm registry.

**Example**: The [tshtml-integration-guide](../samples/tshtml-integration-guide) sample uses this approach to test against packaged versions.

---

### Step 1: Create a Changeset (During Development)

When you make changes that should be published, create a changeset:

```bash
cd tshtml
npx changeset add
```

This opens an interactive prompt:

```
? Which packages would you like to include? (use arrow keys / space to select)
  ✓ tshtml
  ✓ tshtml-loader

? Which packages should have a major bump? (none)
? Which packages should have a minor bump? 
  ✓ tshtml
  ✓ tshtml-loader

? Please enter a summary for this change (what did you change?)
> Add new feature X, fix bug Y, etc.
```

A new file is created in `.changeset/` with a random name (e.g., `.changeset/blue-whales-dance.md`):

```markdown
---
"tshtml": minor
"tshtml-loader": minor
---

Added new feature X, fixed bug Y
```

**Commit this file** as part of your PR. **Do NOT commit the generated package.json/CHANGELOG files** - the workflow creates those automatically.

### Step 2: Submit PR with Changeset

When your PR is merged to `main`:
1. CI workflow runs (tests, coverage)
2. Once merged, publish workflow detects the changeset file

### Step 3: Changeset Action Creates Version PR

GitHub Actions automatically:
1. Creates a new PR titled "Changeset: publish packages"
2. Updates all package.json versions (both bump together due to `"fixed"` configuration)
3. Generates CHANGELOG.md entries
4. Commits these changes to the PR

**Review the PR** to ensure versions and changelogs look correct.

### Step 4: Merge Version PR to Trigger Publishing

When you merge the Version PR:
1. The publish workflow automatically runs
2. Packages are built and tested again (safety check)
3. Both packages published to npm with `--provenance`
4. Versions must be synchronized (1.5.0 for both, never 1.5.0 and 1.4.0)

## Version Numbering Strategy

Both packages **always version together**. This is configured in `.changeset/config.json`:

```json
{
  "fixed": [["tshtml", "tshtml-loader"]]
}
```

**Examples**:
- ✅ `tshtml@1.4.0` + `tshtml-loader@1.4.0` (good)
- ❌ `tshtml@1.4.0` + `tshtml-loader@1.3.0` (bad - don't do this)

This ensures users can always use compatible versions together.

## Version Types

When creating a changeset, select one of:

| Type | Version Change | When to Use | Example |
|------|---|---|---|
| **Major** | 1.0.0 → 2.0.0 | Breaking changes | Removed API |
| **Minor** | 1.0.0 → 1.1.0 | New features | Added new function |
| **Patch** | 1.0.0 → 1.0.1 | Bug fixes | Fixed crash |

## Changeset Configuration

Located in `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [["tshtml", "tshtml-loader"]],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**Key settings**:
- `"fixed"`: Both packages version together
- `"access": "public"`: Publish as public packages on npm
- `"baseBranch": "main"`: Changesets PR created against main
- `"updateInternalDependencies": "patch"`: Bump tshtml-loader patch version if tshtml changes

## What Happens During Publishing

### Build Phase
```bash
npm run build          # Builds both packages
npm run test           # Verifies tests pass
```

Each package generates:
- `lib/index.js` + `lib/index.d.ts` (CommonJS with type definitions)
- Supporting modules in `lib/`
- Files excluded via `.npmignore`: source code, tests, coverage, etc.

### Publish Phase

```bash
npm publish --workspace tshtml --provenance
npm publish --workspace tshtml-loader --provenance
```

**What's Published**:
- Only files in `lib/` folder (per `files` field in package.json)
- Type definitions (.d.ts files)
- package.json with metadata
- README.md (if linked in package.json)

**Provenance**: npm records cryptographic proof that:
- Package came from this GitHub repository
- Built by GitHub Actions workflow (specific commit/run)
- Has full audit trail at npm registry

Users can verify: `npm view tshtml@1.4.0 --json | grep provenance`

## Authentication

Publishing requires npm authentication. Setup steps:

### For Repository Maintainers

1. **Generate npm token** (at https://npmjs.com/settings/~/tokens):
   - Click "Generate New Token"
   - Select "Automation" type (allows npm publish)
   - Copy the token

2. **Add to GitHub Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste the token
   - Click "Add secret"

3. **Token permissions**: Must have write access to both `tshtml` and `tshtml-loader` packages (or publish from npm account that owns them)

## Troubleshooting

### Problem: Tests fail in CI workflow

**Solution**: 
1. Fix the code locally
2. Ensure `npm test` passes locally
3. Push to your PR branch - CI will re-run

### Problem: Changeset action doesn't create Version PR

**Likely cause**: Changeset file not committed to repository

**Solution**:
```bash
git status                    # Verify .changeset/*.md exists
git add .changeset/
git commit -m "Add changeset"
git push origin your-branch
```

### Problem: Version PR shows wrong version numbers

**Cause**: Manual package.json edits before changesets ran

**Solution**: Don't manually edit package versions. Let changesets manage them.

### Problem: "Invalid tag format" or npm publish errors

**Cause**: Missing NPM_TOKEN secret in GitHub

**Solution**: 
1. Check repository Settings → Secrets → Actions
2. Verify `NPM_TOKEN` exists and is not expired
3. Generate new token if needed

### Problem: Packages published with different versions

**Cause**: Bypassed changeset workflow or manual npm publish

**Solution**: 
1. Always use Changeset workflow (don't `npm publish` manually)
2. The `fixed` configuration in `.changeset/config.json` enforces sync versions

## Skipping Changesets (Advanced)

To publish without creating a changeset PR (e.g., urgent hotfix):

```bash
npm pack -w tshtml              # Creates tshtml-1.4.0.tgz
npm publish tshtml-1.4.0.tgz    # Publish directly (not recommended)
```

**⚠️ Warning**: This bypasses:
- Automated version bumping
- Changelog generation  
- CHANGELOG.md synchronization
- Provenance attestation

**Only use for emergencies.** Always use the Changeset workflow for normal releases.

## File Reference

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Test workflow (runs on PR/push) |
| `.github/workflows/publish.yml` | Publish workflow (runs on changeset) |
| `.changeset/config.json` | Changesets configuration |
| `.changeset/*.md` | Individual changeset entries |
| `tshtml/package.json` | Package 1 metadata + version |
| `tshtml-loader/package.json` | Package 2 metadata + version |
| `tshtml/.npmignore` | Files to exclude from npm publish |
| `tshtml-loader/.npmignore` | Files to exclude from npm publish |
| `package.json` (root) | Monorepo workspace config |

## Related Documentation

- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)

## Quick Reference

### Common Commands

```bash
# Create a changeset (do this during development)
npx changeset add

# Test what would be published (don't commit this)
npm pack --dry-run -w tshtml
npm pack --dry-run -w tshtml-loader

# View changeset status
ls .changeset/

# Manually trigger version bump (only for testing)
npx changeset version
```

### Workflow Status Checks

Check workflow runs in GitHub:
- Go to repository → Actions tab
- "Continuous Integration" = PR/push tests
- "Publish Packages" = Publishing workflow

View logs by clicking the workflow run name.

## Dependency Management with Dependabot

The project uses **Dependabot** for automated dependency updates. Configuration is in [.github/dependabot.yml](.github/dependabot.yml).

### What Dependabot Does

Automatically creates PRs when:
- npm packages have updates available (weekly)
- GitHub Actions need updates (weekly)

### Review Process

1. Dependabot creates a PR with dependency update(s)
2. CI runs automatically (tests, coverage, audit)
3. Review the changes and security advisories
4. Merge when ready - no manual version bumping needed

### Configuration

Located in `.github/dependabot.yml`:
- **npm**: Weekly updates on Mondays at 3 AM
- **github-actions**: Weekly updates on Mondays at 4 AM
- **Labels**: Auto-labeled as `dependencies` or `ci` for filtering
- **Ignore Rules**: Major Angular updates ignored (review manually)

To disable Dependabot, remove the `.github/dependabot.yml` file.

## Alternative: Semantic-Release

This monorepo uses **Changesets** for version management. Here's how it compares to **semantic-release**:

### Changesets vs Semantic-Release

| Feature | Changesets | semantic-release |
|---------|-----------|------------------|
| **Version Bumping** | Manual via changeset files | Automatic from commit messages |
| **Changelog Generation** | Separate PR step | Automatic on publish |
| **Control** | High - team decides when to publish | Low - publishes on every merge |
| **Monorepo Support** | ✅ Built-in `fixed` groups | ✅ Good (needs config) |
| **Learning Curve** | Easy - clear workflow | Medium - must follow conventions |
| **Use Case** | Multiple maintainers, controlled releases | CI/CD teams, SemVer automation |

### Why Changesets?

We chose **Changesets** because:
1. **Control**: You review and approve every version bump via PR
2. **Clarity**: Easy to understand what changed in CHANGELOG
3. **Safety**: Can release on schedule, not on every commit
4. **Flexibility**: Handle monorepo versions together in one PR

### If You Want Semantic-Release Instead

Semantic-release automates the entire release:
- Parses commit messages: `feat:` = minor, `fix:` = patch, `BREAKING CHANGE:` = major
- Bumps versions automatically
- Publishes immediately to npm
- Generates changelogs automatically

**Migration steps** (if you ever want to switch):
```bash
npm uninstall @changesets/cli
npm install -D semantic-release
```

Then update `.github/workflows/publish.yml` to run `semantic-release` instead.

**Recommendation**: Stick with Changesets. It gives you more control over releases. Migrate to semantic-release only if your team prefers fully automated releases with no human approval step.
