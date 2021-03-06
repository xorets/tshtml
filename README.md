# tshtml

## Installation
```
npm i tshtml tshtml-loader
```


## What is it?
tshtml-file is a TypeScript template that emits HTML code during build-time.
The simplest one could look like this:

```
// test.tshtml

export default `<p>Hello world!</p>`;
```
Obviosly this does not differ much from a static HTML file with the same paragraph. 
But now you can start write code in the template, just like this:

```
export default `
    <p>Hello world!</p>
    <p>Build time is ${Date()}.</p>`;
```

This code is executed at build time, and only the resulting 
HTML will be fed to Angular. This way we produce just the same fast Angular templates,
but with help of possible very sophisticated code in tshtml.
So, it's a lovely little metaprogramming: code that creates code.

You can write helper functions to extract repetitive patterns of template code,
import constants and static data structures used at run time to generate some
template elements out of them, and also create templates that inherit other templates.
The latter is very handy when you have Angular components derived from some
base components.

## _html_ function
Combining HTML by hands is not very pleasant task. You must ensure that it is well-formed
so usually it requires more efforts than just to concatenate strings together. 

To simplify this task we created `html` function. It parses the text into a 
tree of node-like objects that can be later serialized to a well-formed HTML.
Since the tree is just a graph of plain JavaScript objects, you can update it:
change attributes, add new children and so on.

The simplest example with `html` added looks basically the same:
```
import { html } from "tshtml";

export default html`<p>Hello world!</p>`;
```

Let's combine two HTML trees together:
```
import { html } from "tshtml";

const buildTime = html`<p>Build time is ${Date()}.</p>`;

// Resulting tree has buildTime subtree inserted at the appropriate place
const res = html`
    <p>Hello world!</p>
    ${buildTime}`;
    
// Tree of template elements will be converted to string by the loader
export default res;    
```

Here `builtTime` is not a string, it's an object, but you can still use standard
template string placeholder syntax to combine HTML fragments together.

The tree can be manipulated using methods of `TemplateItem` class. 
```
import { htmlEl } from "tshtml";

const res = htmlEl`<p>Hello world!</p>`;

// Add an attribute
res.attrs( { "color": "red } );

export default res; 
```

## To use in your Angular project
First, configure Angular build as described here: 
https://codeburst.io/customizing-angular-cli-6-build-an-alternative-to-ng-eject-a48304cd3b21

For that you need to install necessary packages:
```
npm install @angular-devkit/build-angular --save-dev
npm install @angular-builders/custom-webpack --save-dev
```
Add "architect" section to the "angular.json" if it is not already there. Change
builder configuration and specify the name of additional webpack config file:
```
"architect": {
    "build": {
        "builder": "@angular-builders/custom-webpack:browser",
        "options": {
        "customWebpackConfig": {
            "path": "./extra-webpack.config.js",
            "replaceDuplicatePlugins": true
        },
        ...
    },
    "serve": {
        "builder": "@angular-builders/custom-webpack:dev-server",
        ...
```

Add `extra-webpack.config.js`:
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.tshtml$/,
                use: ["tshtml-loader"],
                enforce: "pre"
            },
        ]
    }
};
```

You also need to have "tshtml" and  "tshtml-loader" packages in your project.

Finally you just use tshtml-files instead of html-files in your Angular components.


## Library development

In tshtml folder:
```
npm run test
npm run build
```

### Debugging

If you need to debug the tests, then you can do the following:

1. In the console where you are going to execute tests set environment variable:
`set-item env:NODE_OPTIONS "--inspect"`
   
1. Configure you debugger to attach to Node.js at port 9229. Start the debugger

1. Start test: `node ./test/jasmine "TEST NAME"`

### tshtml-loader

In tshtml-loader folder:
```
npm run build
```

