# tshtml User Guide

## What is tshtml?
tshtml is a TypeScript template system that generates HTML at **build time**, not at runtime:

- Templates are written as TypeScript code and executed during the webpack build process
- The resulting HTML is static and becomes part of your Angular components
- Ships with a webpack loader (`tshtml-loader`) that turns `.tshtml` files into HTML
- Provides a small runtime API (`tag`, `html`, `cssClass`, `expr`, etc.) for programmatic template generation
- **No runtime template execution**: template logic executes at build time

### When to Use tshtml

tshtml is most useful for:

- **Template inheritance** for component class hierarchies (Angular can inherit behavior, but not templates)
- **Reusable markup helpers** that emit Angular template syntax (bindings/directives) consistently across the app
- **Lightweight components** where you want markup reuse without runtime component behavior

Detailed use cases (with examples) live in [docs/index.md](./index.md#when-to-use-tshtml).

## Installation
```bash
npm install tshtml tshtml-loader
```

### Webpack/Angular integration (summary)
1. Add a rule for `.tshtml` files with `tshtml-loader`
2. Author templates as `.tshtml` modules exporting a default template
3. The loader produces HTML at build time; no runtime dependency is added

## Writing templates

### Using raw template strings
```ts
// hello.tshtml
export default `<p>Hello world!</p>`;
```

### Using `html` tagged template (structure-safe)
```ts
import { html } from "tshtml";

export default html`
  <div class="card">
    <h1>${"Title"}</h1>
    <p>${"Body"}</p>
  </div>
`;
```

#### Composing with conditionals
```ts
import { html } from "tshtml";

const showCta = true;
const items = ["One", "Two"];

export default html`
  <section class="panel">
    <h2>${"Dashboard"}</h2>

    ${items.map(text => html`<p>${text}</p>`) }

    ${showCta ? html`<button class="primary">Continue</button>` : ""}
  </section>
`;
```

#### Optional blocks
```ts
import { html } from "tshtml";

function hero({ subtitle }: { subtitle?: string }) {
  return html`
    <header class="hero">
      <h1>${"Welcome"}</h1>
      ${subtitle ? html`<p class="sub">${subtitle}</p>` : ""}
    </header>
  `;
}

export default hero({ subtitle: "Build-time templates" });
```

### Using the DOM-like builder API
```ts
import { tag, div, span, cssClass, expr } from "tshtml";

const classes = cssClass("card primary");
classes.addClass("interactive");

export default div(
  { class: classes },
  tag("h2", "Title"),
  tag("p", { style: { color: "red", fontSize: "14px" } }, "Body"),
  tag("button", { onclick: expr("handleClick()") }, "Click")
);
```

### When to use `tag`
- Prefer `html` for readability when authoring markup-like templates.
- Use `tag` when you need to construct elements programmatically (e.g., loops that build deeply nested trees, or when working outside template literals).

```ts
import { tag } from "tshtml";

const columns = [
  { header: "Name", field: "name" },
  { header: "Email", field: "email" },
];

// Build-time loop over `columns`, emitting an Angular runtime `*ngFor`.
const table = tag(
  "table",
  tag("thead",
    tag("tr", columns.map(c => tag("th", c.header)))
  ),
  tag("tbody",
    tag("tr", { "*ngFor": "let row of rows" },
      columns.map(c => tag("td", `{{ row.${c.field} }}`))
    )
  )
);

export default table;
```

### Dynamic class and JS expressions
- `cssClass(...)` manages class lists safely (`addClass`, `removeClass`, `render()`)
- `expr(...)` wraps values that should be emitted as JavaScript expressions (not quoted)

### Attributes helper
Use `transformAttrs` to map component-style props to HTML attributes, with renaming, defaults, and value transforms:
```ts
import { transformAttrs } from "tshtml";

const attrs = transformAttrs(
  { href: "/home", ngIf: "isReady" },
  { ngIf: "ng-if", ngShow: { to: "ng-show", default: false } }
);

// Resulting attrs object:
// { href: "/home", "ng-if": "isReady", "ng-show": false }
```

## Rendering to string
At runtime (or in tests), you can render:
```ts
import { tag, tagToString } from "tshtml";

const html = tagToString(tag("div", { class: "box" }, "Content"));
// => '<div class="box">Content</div>'
```

## CLI helper
Compile a single `.tshtml` to `.html`:
```bash
npx tshtml-loader-export-template ./path/to/file.tshtml
```

## Troubleshooting
- Ensure the template exports `default`
- Self-closing HTML tags are auto-handled (`<img />`, `<br />`, etc.)
- Style objects must be plain key-value pairs (`{ color: "red", fontSize: "14px" }`)
- For boolean attributes, use `EmptyAttribute` to emit the attribute without a value
