# tshtml

**Build-time TypeScript HTML template engine for Angular**

Write HTML templates as TypeScript code that executes during webpack build, generating static HTML for your Angular components. Get the full power of TypeScript metaprogramming with zero runtime overhead.

## Why tshtml?

- **Template Inheritance** - Use standard OOP class inheritance for templates, solving Angular's limitation where components inherit behavior but not templates
- **Reusable Markup Helpers** - Create TypeScript functions that generate complex HTML structures and components based on parameters
- **Zero Runtime Cost** - Templates execute at build time and produce static HTML, maintaining Angular's fast rendering performance
- **Type Safety** - Full TypeScript support with IntelliSense, compile-time checking, and refactoring tools

## Quick Example

```typescript
// hello.tshtml
export default `
    <h1>Hello, ${process.env.APP_NAME}!</h1>
    <p>Built at: ${new Date().toISOString()}</p>
`;
```

This TypeScript code runs during webpack build and produces static HTML that Angular components consume.

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
