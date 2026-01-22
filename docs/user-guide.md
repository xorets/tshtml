# tshtml User Guide

## What is tshtml?
tshtml is a TypeScript-first way to author **Angular templates**.

In Angular projects, `.tshtml` files are executed at **build time** to produce a template string. That output is usually an Angular template (with bindings/directives), and Angular still evaluates those bindings at **runtime**.

- Templates are written as TypeScript modules and executed during the webpack build process
- The output becomes the template string used by your Angular components
- Ships with a webpack loader (`tshtml-loader`) that turns `.tshtml` files into HTML
- Includes a small CLI (`tshtml-to-html`) that can compile `.tshtml` to `.html` for debugging or non-webpack workflows
- Provides a small runtime API (`tag`, `html`, `cssClass`, `expr`, etc.) for programmatic template generation

### Build-time vs runtime: the important mental model

- TypeScript interpolation (`${ ... }`) runs at **build time** (when webpack executes the module).
- Angular bindings (`{{ ... }}`, `*ngIf`, `*ngFor`, `[(ngModel)]`, etc.) run at **runtime** (in the browser).

Most Angular usage of tshtml is: use TypeScript to *emit* Angular template syntax.

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
    <h1>{{ title }}</h1>
    <p>{{ body }}</p>
  </div>
`;
```

#### Composing with conditionals
```ts
import { html } from "tshtml";

const showCta = true; // build-time feature flag or config

export default html`
  <section class="panel">
    <h2>Dashboard</h2>

    <p *ngFor="let item of items">{{ item }}</p>

    ${showCta ? html`<button class="primary" (click)="continue()">Continue</button>` : ""}
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
If you are using tshtml outside Angular (or in tests), you can render builder output to a plain HTML string:
```ts
import { tag, tagToString } from "tshtml";

const html = tagToString(tag("div", { class: "box" }, "Content"));
// => '<div class="box">Content</div>'
```

## CLI helper
The `tshtml-loader` package ships a small CLI called `tshtml-to-html` that executes one or more `.tshtml` files and writes the resulting HTML.

Compile a single `.tshtml` next to the source file:
```bash
npx tshtml-to-html ./path/to/file.tshtml
```

Print the rendered HTML to stdout:
```bash
npx tshtml-to-html ./path/to/file.tshtml --stdout
```

Compile multiple files in one command:
```bash
npx tshtml-to-html file1.tshtml file2.tshtml subdir/template.tshtml
```

Notes:
- Only `.tshtml` inputs are accepted.
- `--stdout` only works for a single input file.
- Output files are written as `inputName.html` alongside each input.

In Angular projects, you typically don’t need this CLI: Angular consumes the compiled template string produced by the webpack loader.

## Troubleshooting
- Ensure the template exports `default`
- Self-closing HTML tags are auto-handled (`<img />`, `<br />`, etc.)
- Style objects must be plain key-value pairs (`{ color: "red", fontSize: "14px" }`)
- For boolean attributes, use `EmptyAttribute` to emit the attribute without a value
