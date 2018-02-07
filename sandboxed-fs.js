'use strict';

const sandboxedFs = {};
module.exports = sandboxedFs;

const fs = require('fs');
const pathModule = require('path');
const { URL } = require('url');
const isWindows = process.platform === 'win32' ||
      process.env.OSTYPE === 'cygwin' ||
      process.env.OSTYPE === 'msys';
const isUncPath = function(path) {
  return /^[\\/]{2,}[^\\/]+[\\/]+[^\\/]+/.test(path);
};

function makePathSafe(path) {
  const safePath = pathModule.resolve('/', path);

  // As Windows is the only non-UNIX like platform supported by node
  // https://github.com/nodejs/node/blob/master/BUILDING.md#supported-platforms-1
  if (isWindows) {
    if (isUncPath(safePath)) {
      return safePath.substring(pathModule.parse(safePath).root.length);
    } else {
      // If the path is a non-unc path on windows, the root is fixed to 3
      // characters like 'C:\'
      return safePath.substring(3);
    }
  }

  return safePath;
}

function makeFsArgSafe(arg, path) {
  if (typeof arg === 'string') {
    arg = pathModule.join(path, makePathSafe(arg));
  } else if (Buffer.isBuffer(arg)) {
    arg = pathModule.join(path, makePathSafe(arg.toString()));
  } else if (arg instanceof URL && arg.protocol === 'file:') {
    arg.pathname = pathModule.join(path, makePathSafe(arg.pathname));
  }
  return arg;
}

const stringPathFunctionsWrapper = (func, path) => (p, ...args) => {
  if (typeof p === 'string') {
    p = pathModule.join(path, makePathSafe(p));
  }
  return func(p, ...args);
};

const pathFunctionsWrapper = (func, path) => (p, ...args) =>
  func(makeFsArgSafe(p, path), ...args);

const pathFunctionsWithNativeWrapper = (func, path) => {
  const f = pathFunctionsWrapper(func, path);
  if (func.native) {
    f.native = pathFunctionsWrapper(func.native, path);
  }
  return f;
};

const fileFunctionsWrapper = (func, path) => (file, ...args) => {
  if (typeof file === 'number') {
    return func(file, ...args);
  }

  return func(makeFsArgSafe(file, path), ...args);
};

const twoPathFunctionsWrapper = (func, path) => (p1, p2, ...args) =>
  func(
    makeFsArgSafe(p1, path),
    makeFsArgSafe(p2, path),
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
      'utimes'
    ],
    wrapper: pathFunctionsWrapper,
    hasSyncCounterpart: true
  },
  stringPathFunctions: {
    names: [
      'mkdtemp'
    ],
    wrapper: stringPathFunctionsWrapper,
    hasSyncCounterpart: true
  },
  pathFunctionsWithNative: {
    names: [
      'realpath'
    ],
    wrapper: pathFunctionsWithNativeWrapper,
    hasSyncCounterpart: true
  },
  pathNonSyncFunctions: {
    names: [
      'createReadStream',
      'createWriteStream',
      'unwatchFile',
      'watch',
      'watchFile'
    ],
    wrapper: pathFunctionsWrapper,
    hasSyncCounterpart: false
  },
  fileFunctions: {
    names: [
      'appendFile',
      'readFile',
      'writeFile'
    ],
    wrapper: fileFunctionsWrapper,
    hasSyncCounterpart: true
  },
  twoPathFunctions: {
    names: [
      'copyFile',
      'link',
      'rename',
      'symlink'
    ],
    wrapper: twoPathFunctionsWrapper,
    hasSyncCounterpart: true
  }
};

sandboxedFs.bind = (path) => {
  const wrapped = Object.assign({}, fs);

  for (const typeName of Object.keys(functionTypes)) {
    const type = functionTypes[typeName];
    for (const name of type.names) {
      if (!fs[name]) continue;
      wrapped[name] = type.wrapper(fs[name], path);
      if (type.hasSyncCounterpart) {
        const syncName = name + 'Sync';
        wrapped[syncName] = type.wrapper(fs[syncName], path);
      }
    }
  }

  return wrapped;
};
