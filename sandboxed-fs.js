'use strict';

const sandboxedFs = {};
module.exports = sandboxedFs;

const fs = require('fs');
const pathModule = require('path');

const { makePathSafe, makeFsArgSafe } = require('./utils');

const stringPathFunctionsWrapper = (func, path, allowTmp) => (p, ...args) => {
  if (typeof p === 'string') {
    p = pathModule.join(path, makePathSafe(p, allowTmp));
  }
  return func(p, ...args);
};

const pathFunctionsWrapper = (func, path, allowTmp) => (p, ...args) =>
  func(makeFsArgSafe(p, path, allowTmp), ...args);

const pathFunctionsWithNativeWrapper = (func, path, allowTmp) => {
  const f = pathFunctionsWrapper(func, path, allowTmp);
  if (func.native) {
    f.native = pathFunctionsWrapper(func.native, path, allowTmp);
  }
  return f;
};

const fileFunctionsWrapper = (func, path, allowTmp) => (file, ...args) => {
  if (typeof file === 'number') {
    return func(file, ...args);
  }
  return func(makeFsArgSafe(file, path, allowTmp), ...args);
};

const twoPathFunctionsWrapper = (func, path, allowTmp) => (p1, p2, ...args) =>
  func(
    makeFsArgSafe(p1, path, allowTmp),
    makeFsArgSafe(p2, path, allowTmp),
    ...args
  );

const functionTypes = {
  pathFunctions: {
    names: [
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
    ],
    wrapper: pathFunctionsWrapper,
    hasSyncCounterpart: true,
  },
  stringPathFunctions: {
    names: ['mkdtemp'],
    wrapper: stringPathFunctionsWrapper,
    hasSyncCounterpart: true,
  },
  pathFunctionsWithNative: {
    names: ['realpath'],
    wrapper: pathFunctionsWithNativeWrapper,
    hasSyncCounterpart: true,
  },
  pathNonSyncFunctions: {
    names: [
      'createReadStream',
      'createWriteStream',
      'unwatchFile',
      'watch',
      'watchFile',
    ],
    wrapper: pathFunctionsWrapper,
    hasSyncCounterpart: false,
  },
  fileFunctions: {
    names: ['appendFile', 'readFile', 'writeFile'],
    wrapper: fileFunctionsWrapper,
    hasSyncCounterpart: true,
  },
  twoPathFunctions: {
    names: ['copyFile', 'link', 'rename', 'symlink'],
    wrapper: twoPathFunctionsWrapper,
    hasSyncCounterpart: true,
  },
};

sandboxedFs.bind = (path, allowTmp = true) => {
  const wrapped = Object.assign({}, fs);

  for (const typeName of Object.keys(functionTypes)) {
    const type = functionTypes[typeName];
    for (const name of type.names) {
      const fn = fs[name];
      if (!fn) continue;
      wrapped[name] = type.wrapper(fn, path, allowTmp);
      if (type.hasSyncCounterpart) {
        const syncName = name + 'Sync';
        wrapped[syncName] = type.wrapper(fs[syncName], path, allowTmp);
      }
    }
  }

  return wrapped;
};
