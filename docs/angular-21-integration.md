# Integrating tshtml with Angular 21

This guide explains how to modify a standard Angular 21 application to use tshtml and tshtml-loader for TypeScript-first HTML templates.

## What is tshtml?

tshtml is a TypeScript template system that generates HTML at **build time**, not at runtime. Your templates are written as TypeScript code and executed during the webpack build process, producing static HTML that becomes part of your Angular components.

In Angular projects, `.tshtml` typically **emits Angular template syntax** (bindings and directives) rather than rendering runtime data.

**Key Point**: All template logic runs during compilation. The resulting HTML is static with no runtime overhead.

### Why Use tshtml with Angular?

tshtml solves key Angular limitations:

- **Template Inheritance** - Angular components inherit behavior but not templates. tshtml enables template inheritance through standard OOP class patterns.
- **Reusable Markup Helpers** - Build complex HTML structures with Angular directives programmatically.
- **Lightweight Components** - Replace components that only provide markup with faster build-time templates.

**[See detailed examples and use cases →](./index.md#when-to-use-tshtml)**

## Prerequisites

- **Node.js**: 18+ recommended
- **npm**: 8+
- **Angular CLI**: 21.x
- Existing Angular 21 project or ability to create one with `ng new`

## Step 1: Install Dependencies

In your Angular project root, install the required packages:

```bash
npm install tshtml tshtml-loader
npm install --save-dev @angular-builders/custom-webpack
```

**What these packages do:**
- `tshtml`: Core library providing the `html` tagged template and build-time template rendering
- `tshtml-loader`: Webpack loader that processes `.tshtml` files during the build
- `@angular-builders/custom-webpack`: Allows Angular CLI to use custom webpack configurations

> **Note**: `@angular-devkit/build-angular` (the default Angular build system) is already included in Angular 21.

## Step 2: Create Custom Webpack Configuration

Create a file named `angular.webpack.js` in your project root (same directory as `angular.json`):

```javascript
// angular.webpack.js
module.exports = (config) => {
  config.module.rules.push({
    test: /\.tshtml($|\?)/,
    use: ['tshtml-loader'],
    enforce: 'pre'
  });
  return config;
};
```

**Important details:**
- `test: /\.tshtml($|\?)/`: Matches both `.tshtml` files and `.tshtml?ngResource` (with query parameters that Angular 21 appends)
- `use: ['tshtml-loader']`: Specifies the loader to use
- `enforce: 'pre'`: Ensures the loader runs before other loaders (critical for proper processing)

## Step 3: Update angular.json

Modify your `angular.json` to use the custom webpack configuration:

**Find the build section** (typically under `projects > [your-app] > architect > build`):

```json
"build": {
  "builder": "@angular-builders/custom-webpack:browser",
  "options": {
    "customWebpackConfig": {
      "path": "angular.webpack.js"
    },
    // ... rest of build options
  }
}
```

**Before (default Angular 21):**
```json
"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
    // ...
  }
}
```

**After (with custom webpack):**
```json
"build": {
  "builder": "@angular-builders/custom-webpack:browser",
  "options": {
    "customWebpackConfig": {
      "path": "angular.webpack.js"
    },
    // Keep all existing options...
  }
}
```

Also update the `serve` section if present:

```json
"serve": {
  "builder": "@angular-builders/custom-webpack:dev-server",
  "options": {
    "customWebpackConfig": {
      "path": "angular.webpack.js"
    },
    // ... rest of serve options
  }
}
```

## Step 4: Update tsconfig.json

Ensure your `tsconfig.json` has the correct module resolution settings:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    // ... other options
  }
}
```

> **Note**: Most Angular 21 projects already include this. If your build fails with module resolution errors, add `"moduleResolution": "node"` to `compilerOptions`.

## Step 5: Create Your First tshtml Template

Create a `.tshtml` file in your component directory:

```typescript
// app.component.tshtml
import { html } from 'tshtml';

export default html`
  <div class="container">
    <h1>Welcome to tshtml!</h1>
    <p>This template was generated at build-time using TypeScript.</p>
    <p>Build time: ${new Date().toISOString()}</p>
    <p>Runtime (Angular binding): {{ now }}</p>
  </div>
`;
```

## Step 6: Reference tshtml in Your Component

Update your Angular component to use the tshtml template:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import template from './app.component.tshtml';

@Component({
  selector: 'app-root',
  template: template,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My App';
  now = new Date().toISOString();
}
```

Or using `templateUrl`:

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.tshtml',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My App';
  now = new Date().toISOString();
}
```

> **Note**: Both approaches work. The loader processes both `template` imports and `templateUrl` references.

## Step 7: Build and Run

Start the development server:

```bash
ng serve
# or
npm start
```

Your application will compile with tshtml support. Visit `http://localhost:4200` to see your app.

## Advanced: Template Composition

tshtml allows you to compose templates programmatically at build time. Prefer emitting Angular directives (e.g. `*ngFor`) when the data is only available at runtime.

```typescript
// shared-header.tshtml
import { html } from 'tshtml';

export default html`
  <header>
    <h1>My Application</h1>
  </header>
`;
```

```typescript
// app.component.tshtml
import { html } from 'tshtml';
import header from './shared-header.tshtml';

export default html`
  <div>
    ${header}
    <main>
      <ul>
        <li *ngFor="let item of items">{{ item }}</li>
      </ul>
    </main>
  </div>
`;
```

**Note**: This emits Angular template code. At runtime, Angular will render `items` (a component field) via `*ngFor`.

## Troubleshooting

### "Cannot find module 'tshtml'"
- Ensure `tshtml` is installed: `npm install tshtml`
- Check that `tsconfig.json` has `"moduleResolution": "node"`

### Blank page or template not rendering
- Verify `angular.webpack.js` exists and the webpack rule is correct
- Check that `angular.json` uses `@angular-builders/custom-webpack:browser`
- Ensure the webpack rule regex includes `($|\?)` to match query parameters

### "tshtml-loader not applied"
- Confirm `angular.webpack.js` has `enforce: 'pre'` in the rule
- Verify the file path in `customWebpackConfig.path` is correct
- Check webpack output for module processing (look for `.tshtml` files being processed)

### Build performance slow
- Initial builds may be slower when using custom webpack; subsequent hot reloads are typically 2-5 seconds


## Minimal Configuration Checklist

You've successfully integrated tshtml when:

- ✅ `tshtml` and `tshtml-loader` are in `package.json` dependencies
- ✅ `@angular-builders/custom-webpack` is in devDependencies
- ✅ `angular.webpack.js` exists with the webpack rule (7 lines)
- ✅ `angular.json` uses `@angular-builders/custom-webpack:browser` builder
- ✅ `angular.json` specifies `customWebpackConfig.path`
- ✅ `tsconfig.json` has `"moduleResolution": "node"`
- ✅ First `.tshtml` file created and referenced in a component
- ✅ Build succeeds: `ng build` or `ng serve`

## Performance Notes

- **Build time**: Templates are processed during webpack compilation
  - First build: ~10-15 seconds
  - Hot reloads: ~2-5 seconds
- **Runtime performance**: Zero overhead
  - Templates are pre-rendered to static HTML at build time
  - No template evaluation or processing happens at runtime
  - Identical performance to hand-written HTML templates
- **Bundle size**: Minimal impact
  - tshtml-loader runs only at build time and is not included in the bundle
  - Only the generated HTML is included in your application
  - The tshtml runtime API is not needed unless you use rendering functions at runtime (rare)

## Next Steps

- Read the [User Guide](./user-guide.md) for advanced template features
- Check [API Documentation](./typedoc/index.html) for complete tshtml API
- See [../samples/tshtml-integration-guide](../samples/tshtml-integration-guide) for a working Angular 21 + tshtml example

## Support

For issues or questions:
- Check the [User Guide](./user-guide.md)
- Review the `samples/` directory for working examples
- Open an issue on GitHub with your configuration and error messages
