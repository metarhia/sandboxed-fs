'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { URL } = require('url');

const TMP_DIR = os.tmpdir();

const isWindows =
  process.platform === 'win32' ||
  process.env.OSTYPE === 'cygwin' ||
  process.env.OSTYPE === 'msys';

const isUncPath = (location) => /^[\\/]{2,}[^\\/]+[\\/]+[^\\/]+/.test(location);

const makePathSafe = (location, allowTmp) => {
  const safePath = path.resolve('/', location);

  if (allowTmp && safePath.startsWith(TMP_DIR)) {
    return safePath;
  }

  // As Windows is the only non-UNIX like platform supported by node
  // https://github.com/nodejs/node/blob/master/BUILDING.md#supported-platforms-1
  if (isWindows) {
    if (isUncPath(safePath)) {
      return safePath.substring(path.parse(safePath).root.length);
    } else {
      // If the path is a non-unc path on windows, the root is fixed to 3
      // characters like 'C:\'
      return safePath.substring(3);
    }
  }

  return safePath;
};

const makeFsArgSafe = (arg, location, allowTmp) => {
  if (typeof arg === 'string' || Buffer.isBuffer(arg)) {
    const safePath = makePathSafe(arg.toString(), allowTmp);
    const isTemp = allowTmp && safePath.startsWith(TMP_DIR);
    return isTemp ? safePath : path.join(location, safePath);
  }
  if (arg instanceof URL && arg.protocol === 'file:') {
    const safePath = makePathSafe(arg.pathname, allowTmp);
    const isTemp = allowTmp && safePath.startsWith(TMP_DIR);
    arg.pathname = isTemp ? safePath : path.join(location, safePath);
  }
  return arg;
};

const stringPathFunctionsWrapper =
  (func, location, allowTmp) =>
  (name, ...args) =>
    func(
      typeof name === 'string'
        ? path.join(location, makePathSafe(name, allowTmp))
        : name,
      ...args,
    );

const pathFunctionsWrapper =
  (func, location, allowTmp) =>
  (name, ...args) =>
    func(makeFsArgSafe(name, location, allowTmp), ...args);

const pathFunctionsWithNativeWrapper = (func, location, allowTmp) => {
  const f = pathFunctionsWrapper(func, location, allowTmp);
  if (func.native) {
    f.native = pathFunctionsWrapper(func.native, location, allowTmp);
  }
  return f;
};

const fileFunctionsWrapper =
  (func, location, allowTmp) =>
  (file, ...args) =>
    func(
      typeof file === 'number' ? file : makeFsArgSafe(file, location, allowTmp),
      ...args,
    );

const twoPathFunctionsWrapper =
  (func, location, allowTmp) =>
  (p1, p2, ...args) =>
    func(
      makeFsArgSafe(p1, location, allowTmp),
      makeFsArgSafe(p2, location, allowTmp),
      ...args,
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

const bind = (location, allowTmp = true) => {
  const wrapped = Object.assign({}, fs);
  for (const typeName of Object.keys(functionTypes)) {
    const type = functionTypes[typeName];
    for (const name of type.names) {
      const fn = fs[name];
      if (!fn) continue;
      wrapped[name] = type.wrapper(fn, location, allowTmp);
      if (type.hasSyncCounterpart) {
        const syncName = name + 'Sync';
        wrapped[syncName] = type.wrapper(fs[syncName], location, allowTmp);
      }
    }
  }
  return wrapped;
};

module.exports = { bind };
