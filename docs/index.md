# tshtml

## Installation
```
npm i tshtml tshtml-loader
```

## Documentation
- **[Angular 21 Integration Guide](./angular-21-integration.md)** — Step-by-step guide to add tshtml to your Angular 21 project
- **[User Guide](./user-guide.md)** — Template authoring, API reference, and examples
- **[Development Guide](./development.md)** — Repository structure, contributing, and development setup
- **[Workflows & Publishing](./github-workflows.md)** — CI, Changesets release PRs, and publishing to npm (trusted publishing)
- **[API Reference](./typedoc/index.html)** — Complete TypeScript API documentation


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
  <p>Build time is ${new Date().toISOString()}.</p>`;
```

**Important**: This code is executed at build time only. The resulting HTML is static and fed to Angular. There's no runtime overhead—you get the same fast Angular templates, but generated through TypeScript metaprogramming.

## When to Use tshtml

tshtml is particularly useful in these scenarios:

### 1. **Template Inheritance for Component Hierarchies**
Angular components can inherit behaviors from base classes, but they cannot inherit templates. tshtml solves this using standard OOP inheritance:

```typescript
// base-form.tshtml
import { tagToString, TemplateFragment, html } from 'tshtml';

export abstract class BaseFormTemplate {
  protected abstract getTitle(): string;
  protected abstract getFields(): TemplateFragment;

  protected build(): TemplateFragment {
    return html`
      <form class="form-container">
        <h2>${this.getTitle()}</h2>
        ${this.getFields()}
        <button type="submit">Submit</button>
      </form>
    `;
  }

  toString(): string {
    return tagToString(this.build());
  }
}
```

```typescript
// user-form.tshtml
import { html, TemplateFragment } from 'tshtml';
import { BaseFormTemplate } from './base-form.tshtml';

class UserFormTemplate extends BaseFormTemplate {
  protected getTitle(): string {
    return 'User Registration';
  }

  protected getFields(): TemplateFragment {
    return html`
      <div>
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" type="text" [(ngModel)]="username" name="username" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" [(ngModel)]="email" name="email" />
        </div>
      </div>
    `;
  }
}

// Export class directly - it will be instantiated and toString() called
export default UserFormTemplate;
```

### 2. **Helper Functions for Complex Markup**
Create build-time helpers that emit consistent Angular template syntax (bindings/directives) without duplicating markup across files:

```typescript
// table-helper.tshtml
import { html } from "tshtml";

type Column = { header: string; field: string };

// `columns` is build-time configuration.
// `rows` is a *runtime* Angular value referenced by the emitted template.
export function dataTable(columns: Column[]) {
  return html`
    <table class="data-table">
      <thead>
        <tr>
          ${columns.map(c => html`<th>${c.header}</th>`)}
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of rows">
          ${columns.map(c => html`<td>{{ row.${c.field} }}</td>`)}
        </tr>
      </tbody>
    </table>
  `;
}
```

### 3. **Lightweight Components**
For components that only provide markup without behavior, tshtml can act as a "lightweight component" with better performance:

```typescript
// icon.tshtml
import { html } from 'tshtml';

export function icon(name: string, size: number = 24) {
  return html`
    <svg class="icon icon-${name}" width="${size}" height="${size}">
      <use href="#icon-${name}"></use>
    </svg>
  `;
}
```

Since the template is resolved at build time, there's no component overhead at runtime—just pure HTML (which can still contain Angular bindings/directives if you emit them).

You can write helper functions to extract repetitive patterns, import constants and static data structures to generate template elements, and create templates that inherit other templates.

## Next Steps

- Integrate with Angular: [Angular 21 Integration Guide](./angular-21-integration.md)
- Learn template authoring and APIs: [User Guide](./user-guide.md)
- Contribute / develop locally: [Development Guide](./development.md)
- Browse the full API surface: [API Reference](./typedoc/index.html)

