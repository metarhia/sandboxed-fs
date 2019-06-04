'use strict';

const { testSync } = require('metatests');
const fs = require('fs');
const sandboxedFs = require('..').bind(__dirname);

const hasSyncCounterpartFunctions = [
  'access',
  'chmod',
  'chown',
  'exists',
  'lchmod',
  'lchown',
  'lstat',
  'mkdir',
  'open',
  'readdir',
  'readlink',
  'rmdir',
  'stat',
  'truncate',
  'unlink',
  'utimes',
  'mkdtemp',
  'realpath',
  'appendFile',
  'readFile',
  'writeFile',
  'copyFile',
  'link',
  'rename',
  'symlink',
];

const wrappedFunctions = [
  'watch',
  'watchFile',
  'unwatchFile',
  'createReadStream',
  'createWriteStream',
  ...hasSyncCounterpartFunctions,
  ...hasSyncCounterpartFunctions.map(fn => `${fn}Sync`),
];

testSync('must be wrapped correctly', test => {
  test.strictSame(Object.keys(sandboxedFs).sort(), Object.keys(fs).sort());

  for (const key in fs) {
    if (!wrappedFunctions.includes(key)) {
      test.strictSame(sandboxedFs[key], fs[key]);
    } else if (fs[key]) {
      test.strictNotSame(sandboxedFs[key], fs[key]);
    }
  }
});
