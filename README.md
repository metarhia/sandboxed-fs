## sandboxedFs

[![npm version](https://badge.fury.io/js/sandboxed-fs.svg)](https://badge.fury.io/js/sandboxed-fs)
[![Build Status](https://travis-ci.org/metarhia/sandboxed-fs.svg?branch=master)](https://travis-ci.org/metarhia/sandboxed-fs)
[![bitHound Dependencies](https://www.bithound.io/github/metarhia/sandboxed-fs/badges/dependencies.svg)](https://www.bithound.io/github/metarhia/sandboxed-fs/master/dependencies/npm)
[![bitHound Overall Score](https://www.bithound.io/github/metarhia/sandboxed-fs/badges/score.svg)](https://www.bithound.io/github/metarhia/sandboxed-fs)

sandboxedFs is a sandboxed wrapper for Node.js file system module implementing
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
