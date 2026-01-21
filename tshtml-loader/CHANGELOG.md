# tshtml-loader

## 1.4.3

### Patch Changes

- 126573f: Fixing publishing pipeline
- Updated dependencies [126573f]
  - tshtml@1.4.3

## 1.4.2

### Patch Changes

- 34cc808: Enable npm trusted publishing and prepare patch release.
- Updated dependencies [34cc808]
  - tshtml@1.4.2

## 1.4.1

### Patch Changes

- 70974c0: Version 1.4
- Updated dependencies [70974c0]
  - tshtml@1.4.1

## 1.4.0

### Minor Changes

- Package modernization: publish `dist/` output, add `exports` map, and include `types`/`publishConfig` metadata.
- Loader: remove `tsconfig-paths/register` auto-registration and compile templates with `ts-node` using Node16 module resolution (`module: Node16`, `moduleResolution: node16`, `target: es2022`).
- Loader: `templateToString()` now returns an empty string for `null`/`undefined` builders.
- Tooling: add `test`, `coverage` (nyc), and `prepublishOnly` scripts.

### Patch Changes

- Updated dependencies
  - tshtml@1.4.0
