'use strict';

const sandboxedFs = {};
module.exports = sandboxedFs;

const fs = require('fs');
const pathModule = require('path');
const isWindows = process.platform === 'win32' ||
      process.env.OSTYPE === 'cygwin' ||
      process.env.OSTYPE === 'msys';
const isUncPath = function(path) {
  return /^[\\/]{2,}[^\\/]+[\\/]+[^\\/]+/.test(path);
};

const errorMessage = 'path must be a string';

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

const pathFunctionsWrapper = (func, path) => (p, ...args) => {
  if (typeof p === 'string') {
    return func(pathModule.join(path, makePathSafe(p)), ...args);
  }

  throw new TypeError(errorMessage);
};

const fileFunctionsWrapper = (func, path) => (file, ...args) => {
  if (typeof file === 'string') {
    return func(pathModule.join(path, makePathSafe(file)), ...args);
  }
  if (typeof file === 'number') {
    return func(file, ...args);
  }

  throw new TypeError(errorMessage);
};

const twoPathFunctionsWrapper = (func, path) => (p1, p2, ...args) => {
  if (typeof p1 === 'string' || typeof p2 === 'string') {
    return func(
      pathModule.join(path, makePathSafe(p1)),
      pathModule.join(path, makePathSafe(p2)),
      ...args
    );
  }

  throw new TypeError(errorMessage);
};

const functionTypes = {
  pathFunctions: {
    names: [
      'access',
      'chmod',
      'chown',
      'exists',
      'lstat',
      'mkdir',
      'mkdtemp',
      'open',
      'readdir',
      'readlink',
      'realpath',
      'rmdir',
      'stat',
      'truncate',
      'unlink',
      'utimes'
    ],
    wrapper: pathFunctionsWrapper,
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
      wrapped[name] = type.wrapper(fs[name], path);
      if (type.hasSyncCounterpart) {
        const syncName = name + 'Sync';
        wrapped[syncName] = type.wrapper(fs[syncName], path);
      }
    }
  }

  return wrapped;
};
