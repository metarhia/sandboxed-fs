'use strict';

const sandboxedFs = require('.');
const fs = sandboxedFs.bind('./test');

fs.readFile('file.ext', (err, data) => {
  if (err) return console.log('Cannot read file');
});

fs.readFile('../../file.ext', (err, data) => {
  if (err) return console.log('Cannot read file');
});
