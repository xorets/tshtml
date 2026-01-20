# tshtml Development Guide

## Repo layout
- `tshtml/` — core library (TypeScript APIs: tag/html builders, render helpers)
- `tshtml-loader/` — webpack loader and CLI exporter
- `docs/` — user and development guides, generated typedoc in `docs/typedoc`
- `samples/` — example Angular setup

## Prerequisites
- Node.js 18+
- npm 8+

## Setup
```bash
npm install
```

## Common scripts (root)
- `npm run build` — build both packages
- `npm run test` — run all tests (tshtml + tshtml-loader)
- `npm run coverage` — coverage for both packages
- `npm run docs` — generate typedoc for tshtml
- `npm run clean` — remove build and coverage artifacts

### Package-specific (workspaces)
```bash
npm run build -w tshtml
npm run test -w tshtml
npm run coverage -w tshtml

npm run build -w tshtml-loader
npm run test -w tshtml-loader
npm run coverage -w tshtml-loader
```

## Testing
- Test runner: Jasmine via `tsx ./test/jasmine.js`
- Snapshot-free; assertions are plain expectations
- Coverage: `nyc` (reports in `coverage/` under each package)

## Debugging tests
```bash
# In the package folder you want to debug
set-item env:NODE_OPTIONS "--inspect"
npm run test -- --filter "spec name"
# Attach debugger to Node on port 9229
```

## Releasing / publishing
- Build artifacts live in `lib/` per package
- Ensure tests and coverage pass before publishing

## Coding guidelines
- Prefer the builder APIs (`tag`, `html`, `cssClass`, `expr`)
- Use TemplateValue implementations for dynamic rendering
- Avoid non-ASCII in source unless required
- Keep JSDoc current; run typedoc after API changes
