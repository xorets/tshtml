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
- **npm trusted publishing (OIDC)**: Publish from GitHub Actions without long-lived npm tokens
- **npm link**: Local development with symlinked packages
- **npm pack**: Optional tarballs for “as-published” testing
- **npm provenance**: Cryptographic proof a package was built/published from your CI

## Workflow Files

Three GitHub Actions workflow files control the process:

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

**Triggers**: Runs on pushes to `main` when changes touch `.changeset/`, package folders, or the publish workflow itself

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
3. Publishes packages to npm (via Changesets)

**Important**: Publish only happens after Version PR merge. You control the timing.

### 3. `.github/workflows/docs.yml` - Documentation Deployment

**Triggers**: Runs on pushes to `main` when changes touch:
- Source files in `tshtml/src/**`
- `tshtml/package.json`
- Documentation in `docs/**`
- The docs workflow file itself
- Can also be manually triggered via `workflow_dispatch`

**What it does**:
1. Builds TypeDoc documentation (`npm run docs`)
2. Uploads documentation artifacts to GitHub Pages
3. Deploys to https://xorets.github.io/tshtml/

**Status**: Documentation is automatically updated on every push to `main` that affects source code or docs.

## Local Development (Recommended)

For day-to-day development, use the monorepo’s `npm link` tooling so you can iterate on `tshtml` / `tshtml-loader` without publishing.

### Link the monorepo packages

From the repository root:

```bash
npm run link
```

This uses the root scripts:
- `npm run link`: links `tshtml`, then links `tshtml-loader` (and links it against the local `tshtml`)
- `npm run unlink`: removes the global links

### Use the linked packages in a consuming project

In your Angular (or other) project:

```bash
npm link tshtml tshtml-loader
```

When done:

```bash
npm unlink tshtml tshtml-loader
```

### Optional: “as-published” tarball testing

If you specifically want to test the exact tarballs that would be published (a closer approximation to npm install), you can still use:

```bash
npm run pack
```

This builds both packages and writes `dist/*.tgz` at the repo root.

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
- `dist/index.js` + `dist/index.d.ts` (CommonJS with type definitions)
- Supporting modules in `dist/`
- Files excluded via `.npmignore`: source code, tests, coverage, etc.

### Publish Phase

```bash
changeset publish
```

When publishing via **trusted publishing**, npm automatically generates provenance attestations and no npm publish token is required in CI.

**What's Published**:
- Only files in `dist/` folder (per the `files` field in each package.json)
- Type definitions (.d.ts files)
- package.json with metadata
- README.md (if linked in package.json)

**Provenance**: npm records cryptographic proof that:
- Package came from this GitHub repository
- Built by GitHub Actions workflow (specific commit/run)
- Has full audit trail at npm registry

Users can verify by inspecting `npm view tshtml@1.4.0 --json` and looking for provenance / attestation-related fields.

## Authentication

### Recommended: npm trusted publishing (OIDC)

npm now recommends **trusted publishing** for GitHub Actions. This creates a trust relationship between npm and GitHub Actions using OIDC, so publishes do not require a long-lived `NPM_TOKEN` secret.

High-level flow:
- You configure each package on npmjs.com to trust this repo + workflow filename.
- During `npm publish`, the npm CLI detects the GitHub Actions OIDC environment and authenticates using short-lived credentials.

**Prerequisites / limitations**:
- Requires GitHub-hosted runners (self-hosted runners are not currently supported).
- Requires npm CLI **11.5.1+**.
- Trusted publishing applies to `npm publish`. If you have *private* npm dependencies, `npm ci` may still need a separate read-only token.

#### Step 1: Configure trusted publishers on npmjs.com

Do this for **each** package (`tshtml` and `tshtml-loader`):
1. Open the package page on npmjs.com → **Settings**
2. Find **Trusted Publisher**
3. Select **GitHub Actions**
4. Enter:
    - Organization/user: your GitHub org/user
    - Repository: `tshtml`
    - Workflow filename: `publish.yml`
    - (Optional) Environment name: only if you publish via a GitHub Environment

Note: A package can have only one trusted publisher configuration at a time.

#### Step 2: Ensure the workflow has OIDC permission

The publish workflow must include:

```yml
permissions:
  id-token: write
```

This repo’s publish workflow already requests this permission.
It also pins npm to a version that supports trusted publishing.

### Fallback: token-based publishing (not preferred)

If you cannot use trusted publishing (for example, due to CI constraints), you can still publish with an automation token stored as a GitHub secret. Prefer trusted publishing when possible.

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

**Cause**: Trusted publishing not configured correctly (or missing/expired token if using fallback token publishing)

**Solution**:
1. Verify npm trusted publisher settings for both packages (repo + workflow filename must match exactly)
2. Ensure the workflow has `permissions: id-token: write` and runs on a GitHub-hosted runner
3. If using fallback token publishing, verify the token secret exists and is not expired

### Problem: Packages published with different versions

**Cause**: Bypassed changeset workflow or manual npm publish

**Solution**: 
1. Always use Changeset workflow (don't `npm publish` manually)
2. The `fixed` configuration in `.changeset/config.json` enforces sync versions

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
- [npm Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers)

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

The project uses **Dependabot** for automated dependency updates. Configuration is in [.github/dependabot.yml](../.github/dependabot.yml).

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

