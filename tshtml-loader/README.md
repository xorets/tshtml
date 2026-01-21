# tshtml-loader

**Webpack loader for tshtml template files**

This webpack loader enables `.tshtml` template files in your Angular projects, executing TypeScript template code at build time to generate static HTML.

## What It Does

The tshtml-loader integrates with webpack to:
- Process `.tshtml` files containing TypeScript template code
- Execute templates during the build process
- Generate static HTML output for Angular components
- Provide full TypeScript compilation support for template files

## Why Use It?

- **Build-Time Templates** - Generate HTML during webpack build, not at runtime
- **TypeScript Power** - Use classes, functions, imports, and type safety in templates
- **Seamless Integration** - Works with Angular CLI and standard webpack configurations
- **Zero Runtime Overhead** - Output is plain HTML consumed by Angular

## Installation

```bash
npm install tshtml tshtml-loader
```

## Basic Usage

### webpack.config.js
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tshtml$/,
        use: ['tshtml-loader']
      }
    ]
  }
};
```

### Angular Component
```typescript
@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.tshtml'
})
export class HelloComponent {}
```

### Template File (hello.component.tshtml)
```typescript
export default `<h1>Hello from tshtml!</h1>`;
```

## Documentation

📖 **[Complete Setup Guide & Documentation on GitHub](https://github.com/xorets/tshtml)**

- [Angular 21 Integration Guide](https://github.com/xorets/tshtml/blob/main/docs/angular-21-integration.md)
- [Template Authoring Guide](https://github.com/xorets/tshtml/blob/main/docs/user-guide.md)
- [Development Guide](https://github.com/xorets/tshtml/blob/main/docs/development.md)

## License

MIT
