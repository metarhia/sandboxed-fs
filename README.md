## sandboxedFs

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
