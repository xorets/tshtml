# tshtml

## Installation
```
npm i tshtml tshtml-loader
```

`tshtml-loader` also provides a CLI (`tshtml-to-html`) that can compile `.tshtml` files to `.html` (handy for debugging or non-webpack usage).

## Documentation
- **[Angular 21 Integration Guide](docs/angular-21-integration.md)** — Step-by-step guide to add tshtml to an Angular 21 project
- **[User Guide](docs/user-guide.md)** — Template authoring, API reference, and examples  
- **[Development Guide](docs/development.md)** — Repository structure, contributing, and development setup
- **[API Reference](docs/typedoc/index.html)** — Complete TypeScript API documentation


## What is it?
tshtml is a TypeScript-first way to author **Angular templates**.

In an Angular build, `.tshtml` files are executed at **build time** (via webpack + `tshtml-loader`) to produce a **template string**.
That template string typically contains Angular bindings/directives (e.g. `{{ ... }}`, `*ngFor`), which Angular still evaluates at **runtime**.

The simplest template could look like this:

```typescript
// test.tshtml

export default `<p>Hello world!</p>`;
```

Obviously this does not differ much from a static HTML file with the same paragraph. 
But the main value is that you can **compose templates with TypeScript** while still using Angular runtime bindings.

```typescript
// app.component.tshtml
import { html } from 'tshtml';

// TypeScript runs at build time and can help you *emit* Angular template syntax.
export default html`
    <h1>Hello {{ userName }}</h1>

    <ul>
        <li *ngFor="let item of items">{{ item }}</li>
    </ul>
`;
```

**Rule of thumb**
- Use TypeScript (`${ ... }`) to generate/compose *template code*.
- Use Angular (`{{ ... }}`, `*ngIf`, `*ngFor`, etc.) for *runtime data*.

Build-time HTML generation (where you evaluate data into final HTML) is an **advanced** pattern and is not the primary focus of the Angular samples in this repo.

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

