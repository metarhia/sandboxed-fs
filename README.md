<h1>
  sandboxed-fs

  <a href="https://www.npmjs.com/package/sandboxed-fs">
    <img src="https://img.shields.io/npm/v/sandboxed-fs.svg?style=flat"/>
  </a>

  <a href="https://travis-ci.org/metarhia/sandboxed-fs">
    <img src="https://travis-ci.org/metarhia/sandboxed-fs.svg?branch=master"/>
  </a>

  <a href="https://www.npmjs.com/package/sandboxed-fs">
    <img src="https://img.shields.io/npm/dm/sandboxed-fs.svg"/>
  </a>

  <a href="https://www.npmjs.com/package/sandboxed-fs">
    <img src="https://img.shields.io/npm/dt/sandboxed-fs.svg"/>
  </a>

  <a href="https://github.com/metarhia/sandboxed-fs/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
</h1>

`sandboxed-fs` is a sandboxed wrapper for Node.js file system module implementing
the same API but bound to a certain directory, reliably locked in it.

## Usage

- Install: `npm install sandboxed-fs`
- Require: `const fs = require('sandboxed-fs').bind(path);`

## Examples:

```javascript
const fs = require('sandboxed-fs').bind(path);

fs.readFile('file.ext', (err, data) => {
  if (err) return console.log('Cannot read file');
});

fs.readFile('../../file.ext', (err, data) => {
  if (err) return console.log('Cannot read file');
});
```
