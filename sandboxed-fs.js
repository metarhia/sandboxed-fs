'use strict';

const sandboxedFs = {};
module.exports = sandboxedFs;

const fs = require('fs');
const os = require('os');
const pathModule = require('path');
const { URL } = require('url');

const isWindows = (
  process.platform === 'win32' ||
  process.env.OSTYPE === 'cygwin' ||
  process.env.OSTYPE === 'msys'
);

const isUncPath = (path) => /^[\\/]{2,}[^\\/]+[\\/]+[^\\/]+/.test(path);

const makePathSafe = (path, allowTmp) => {
  const safePath = pathModule.resolve('/', path);

  if (allowTmp && safePath.startsWith(os.tmpdir())) {
    return safePath;
  }

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
};

const makeFsArgSafe = (arg, path, allowTmp) => {
  let safePath;
  if (typeof arg === 'string' || Buffer.isBuffer(arg)) {
    safePath = makePathSafe(arg.toString(), allowTmp);
    if (allowTmp && safePath.startsWith(os.tmpdir())) {
      arg = safePath;
    } else {
      arg = pathModule.join(path, safePath);
    }
  } else if (arg instanceof URL && arg.protocol === 'file:') {
    safePath = makePathSafe(arg.pathname, allowTmp);
    if (allowTmp && safePath.startsWith(os.tmpdir())) {
      arg.pathname = safePath;
    } else {
      arg.pathname = pathModule.join(path, safePath);
    }
  }
  return arg;
};

const stringPathFunctionsWrapper = (func, path, allowTmp) => (p, ...args) => {
  if (typeof p === 'string') {
    p = pathModule.join(path, makePathSafe(p, allowTmp));
  }
  return func(p, ...args);
};

const pathFunctionsWrapper = (func, path, allowTmp) =>
  (p, ...args) =>
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
