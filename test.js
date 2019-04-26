'use strict';

const sandboxedFs = require('.');
const fs = sandboxedFs.bind('./test');

fs.readFile('file.ext', (err, data) => {
  if (err) {
    console.log('Cannot read file');
    return;
  }
  console.log(data.toString());
});

fs.readFile('../../file.ext', (err, data) => {
  if (err) {
    console.log('Cannot read file');
    return;
  }
  console.log(data.toString());
});
