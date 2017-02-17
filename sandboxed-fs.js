'use strict';

const sandboxedFs = {};
module.exports = sandboxedFs;

const fs = require('fs');

sandboxedFs.bind = (path) => {
  const wrapped = fs;

  // wrapper implementation

  return wrapped;
};
