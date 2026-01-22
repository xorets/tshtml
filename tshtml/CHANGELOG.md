# tshtml

## 1.4.5

### Patch Changes

- 7d52558: Restored `tsconfig-paths` auto-registration for backward compatibility with applications using path aliases (e.g., `@shared/...`). This was inadvertently removed in v1.4.0.

## 1.4.4

### Patch Changes

- dde6c24: Documentation update

## 1.4.3

### Patch Changes

- 126573f: Fixing publishing pipeline

## 1.4.2

### Patch Changes

- 34cc808: Enable npm trusted publishing and prepare patch release.

## 1.4.1

### Patch Changes

- 70974c0: Version 1.4

## 1.4.0

### Minor Changes

- Package modernization: publish `dist/` output, add `exports` map, and include `types`/`publishConfig` metadata.
- Tooling: switch tests to `tsx`, add `coverage` via `nyc`, and run `test` + `build` in `prepublishOnly`.
- Types: allow object-style values for the `style` attribute (`Record<string, string | number>`).
- Runtime: `cssClass()` now ignores empty class tokens when splitting whitespace.
- Repo docs: refresh documentation and Angular integration guide.
