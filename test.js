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

(async () => {
  let data = undefined;
  try {
    data = await fs.promises.readFile('file.ext');
  } catch (e) {
    console.log('Cannot read file');
  }
  if (data) console.log(data.toString());
})();

(async () => {
  let data = undefined;
  try {
    data = await fs.promises.readFile('../../file.ext');
  } catch (e) {
    console.log('Cannot read file');
  }
  if (data) console.log(data.toString());
})();
