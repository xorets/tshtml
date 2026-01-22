# tshtml

**TypeScript-authored Angular templates (compiled at build time)**

Write Angular templates as TypeScript modules executed during the webpack build. The output is a template string that can include Angular bindings/directives (runtime), while TypeScript helps you compose and share markup (build time).

## Why tshtml?

- **Template Inheritance** - Use standard OOP class inheritance for templates, solving Angular's limitation where components inherit behavior but not templates
- **Reusable Markup Helpers** - Create TypeScript functions that generate complex HTML structures and components based on parameters
- **Zero Runtime Cost** - Templates execute at build time and produce static HTML, maintaining Angular's fast rendering performance
- **Type Safety** - Full TypeScript support with IntelliSense, compile-time checking, and refactoring tools

## Quick Example

```typescript
// hello.tshtml
import { html } from 'tshtml';

export default html`
    <h1>Hello {{ userName }}</h1>
    <p *ngIf="isAdmin">Admin mode</p>
`;
```

This TypeScript module runs during the webpack build and produces an Angular template string.

## Installation

```bash
npm install tshtml tshtml-loader
```

## Documentation

📖 **[Complete Documentation & Guides on GitHub](https://github.com/xorets/tshtml)**

- [Angular 21 Integration Guide](https://github.com/xorets/tshtml/blob/main/docs/angular-21-integration.md)
- [User Guide & API Reference](https://github.com/xorets/tshtml/blob/main/docs/user-guide.md)
- [TypeDoc API Documentation](https://xorets.github.io/tshtml/typedoc/)

## License

MIT
