'use strict';

const os = require('os');
const { URL } = require('url');
const pathModule = require('path');

const isWindows =
  process.platform === 'win32' ||
  process.env.OSTYPE === 'cygwin' ||
  process.env.OSTYPE === 'msys';

const isUncPath = path => /^[\\/]{2,}[^\\/]+[\\/]+[^\\/]+/.test(path);

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

module.exports = {
  isWindows,
  makePathSafe,
  makeFsArgSafe,
};
