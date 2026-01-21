# tshtml

## Installation
```
npm i tshtml tshtml-loader
```

## Documentation
- **[Angular 21 Integration Guide](docs/angular-21-integration.md)** — Step-by-step guide to add tshtml to an Angular 21 project
- **[User Guide](docs/user-guide.md)** — Template authoring, API reference, and examples  
- **[Development Guide](docs/development.md)** — Repository structure, contributing, and development setup
- **[API Reference](docs/typedoc/index.html)** — Complete TypeScript API documentation


## What is it?
tshtml is a TypeScript template system that generates HTML at **build time**, not at runtime. Templates are written as TypeScript code and executed during the webpack build process, producing static HTML that becomes part of your Angular components.

The simplest template could look like this:

```typescript
// test.tshtml

export default `<p>Hello world!</p>`;
```

Obviously this does not differ much from a static HTML file with the same paragraph. 
But now you can write code in the template:

```typescript
export default `
    <p>Hello world!</p>
    <p>Build time is ${Date()}.</p>`;
```

**Important**: This code is executed at build time only. The resulting HTML is static and fed to Angular. There's no runtime overhead—you get the same fast Angular templates, but generated through TypeScript metaprogramming.

## When to Use tshtml

tshtml excels in three main scenarios:

1. **Template Inheritance** - Solve Angular's limitation where components inherit behavior but not templates. Use standard OOP class inheritance for templates.

2. **Reusable Markup Helpers** - Create functions that generate complex HTML structures and Angular components based on parameters.

3. **Lightweight Components** - Replace components that only provide markup with faster build-time generated templates.

**[See detailed use cases and examples →](docs/index.md#when-to-use-tshtml)**

## Learn more

- Template authoring and APIs: [docs/user-guide.md](docs/user-guide.md)
- Angular integration: [docs/angular-21-integration.md](docs/angular-21-integration.md)
- Development / contributing: [docs/development.md](docs/development.md)
- CI/CD, Changesets, publishing: [docs/github-workflows.md](docs/github-workflows.md)

