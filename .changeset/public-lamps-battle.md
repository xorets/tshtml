---
"tshtml-loader": patch
"tshtml": patch
---

Restored `tsconfig-paths` auto-registration for backward compatibility with applications using path aliases (e.g., `@shared/...`). This was inadvertently removed in v1.4.0.
