# tshtml Integration Guide Test Project

This project demonstrates a fresh Angular 21 application that has been successfully integrated with **tshtml** and **tshtml-loader**, following the [Angular 21 Integration Guide](../../docs/angular-21-integration.md) step-by-step.

## Purpose

This project serves as a **reference implementation** that proves:

1. ✅ The integration guide is accurate and complete
2. ✅ A standard Angular 21 project can be converted to use tshtml with minimal configuration changes
3. ✅ All integration steps work as documented
4. ✅ The application builds and runs successfully with tshtml templates

## How This Project Was Created

This project was created by following every step of the [Angular 21 Integration Guide](../../docs/angular-21-integration.md).

### Quick Summary of Changes

1. **Installed packages:**
   - `tshtml` and `tshtml-loader`
   - `@angular-builders/custom-webpack@^21.0.0`

2. **Created `angular.webpack.js`** with webpack rule for `.tshtml` files

3. **Updated `angular.json`** to use `@angular-builders/custom-webpack:browser`

4. **Updated `tsconfig.json`** to include `moduleResolution: "node"`

5. **Created `app.tshtml`** template with dynamic content generation

   (In this repo, the sample focuses on emitting Angular bindings/directives. TypeScript composition happens at build time; Angular renders runtime values.)

6. **Updated `app.ts`** component to use `templateUrl: './app.tshtml'`

## Development

To start a local development server, run:

```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

## Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Key Files

- **[angular.webpack.js](./angular.webpack.js)** — Webpack configuration (7 lines)
- **[src/app/app.tshtml](./src/app/app.tshtml)** — Example tshtml template
- **[src/app/app.ts](./src/app/app.ts)** — Component using the template
- **[angular.json](./angular.json)** — Angular configuration with custom webpack
- **[tsconfig.json](./tsconfig.json)** — TypeScript configuration

## Integration Guide Reference

For detailed instructions on integrating tshtml into your own Angular 21 project:
→ [Angular 21 Integration Guide](../../docs/angular-21-integration.md)

## Verification Results

✅ Fresh Angular 21 project successfully integrated with tshtml
✅ All steps from integration guide verified working
✅ Application builds and runs successfully
✅ Hot reload working
