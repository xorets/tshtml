# tshtml

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
