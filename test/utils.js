'use strict';

const os = require('os');
const { URL } = require('url');
const { join } = require('path');
const metatests = require('metatests');
const utils = require('../utils');

const TEMP_DIR = os.tmpdir();
const BOUND_DIR = '/boundDir';
const WIN_BOUND_DIR = `C:\\boundDir`;
const ANOTHER_DIR = 'anotherDir';

const cases = {
  posix: {
    makePathSafeCases: [
      ['../../..', true, '/'],
      [ANOTHER_DIR, true, `/${ANOTHER_DIR}`],
      [join('..', ANOTHER_DIR), true, `/${ANOTHER_DIR}`],
      [join('..', ANOTHER_DIR), false, `/${ANOTHER_DIR}`],
      [TEMP_DIR, true, TEMP_DIR],
      [TEMP_DIR, false, TEMP_DIR],
      [BOUND_DIR, true, BOUND_DIR],
      [`${BOUND_DIR}/../${ANOTHER_DIR}`, true, `/${ANOTHER_DIR}`],
    ],
    makeFsArgSafeCases: [
      ['../../..', BOUND_DIR, true, `${BOUND_DIR}/`],
      ['file.ext', BOUND_DIR, true, join(BOUND_DIR, 'file.ext')],
      [ANOTHER_DIR, BOUND_DIR, true, join(BOUND_DIR, ANOTHER_DIR)],
      [Buffer.from('file.ext'), BOUND_DIR, true, join(BOUND_DIR, 'file.ext')],
      [TEMP_DIR, BOUND_DIR, true, TEMP_DIR],
      [TEMP_DIR, BOUND_DIR, false, join(BOUND_DIR, TEMP_DIR)],
      [
        new URL('file:///tmp/file.ext'),
        BOUND_DIR,
        true,
        new URL('file:///tmp/file.ext'),
      ],
      [
        new URL('file:///tmp/file.ext'),
        BOUND_DIR,
        false,
        new URL(join('file://', BOUND_DIR, 'tmp/file.ext')),
      ],
      [
        `${BOUND_DIR}/../${ANOTHER_DIR}`,
        BOUND_DIR,
        true,
        join(BOUND_DIR, ANOTHER_DIR),
      ],
    ],
  },
  win: {
    makePathSafeCases: [
      ['C:..\\..\\..', true, ''],
      ['C:file.ext', true, 'file.ext'],
      [ANOTHER_DIR, true, ANOTHER_DIR],
      [`C:..\\${ANOTHER_DIR}`, true, ANOTHER_DIR],
      [`C:..\\${ANOTHER_DIR}`, false, ANOTHER_DIR],
      [TEMP_DIR, true, TEMP_DIR],
      [TEMP_DIR, false, TEMP_DIR.substring(3)],
      [WIN_BOUND_DIR, true, WIN_BOUND_DIR.substring(3)],
      [`${WIN_BOUND_DIR}/../${ANOTHER_DIR}`, true, ANOTHER_DIR],
      [`\\\\?\\C:\\${ANOTHER_DIR}`, true, ANOTHER_DIR],
      ['\\\\hostname\\sharedDir\\', true, ''],
      [`\\\\hostname\\sharedDir\\${ANOTHER_DIR}`, true, ANOTHER_DIR],
    ],
    makeFsArgSafeCases: [
      ['C:..\\..\\..', WIN_BOUND_DIR, true, WIN_BOUND_DIR],
      ['file.ext', WIN_BOUND_DIR, true, join(WIN_BOUND_DIR, 'file.ext')],
      [ANOTHER_DIR, WIN_BOUND_DIR, true, join(WIN_BOUND_DIR, ANOTHER_DIR)],
      ['\\\\hostname\\sharedDir\\', WIN_BOUND_DIR, true, WIN_BOUND_DIR],
      [TEMP_DIR, WIN_BOUND_DIR, true, TEMP_DIR],
      [
        TEMP_DIR,
        WIN_BOUND_DIR,
        false,
        join(WIN_BOUND_DIR, TEMP_DIR.substring(3)),
      ],
      [
        `${WIN_BOUND_DIR}/../${ANOTHER_DIR}`,
        WIN_BOUND_DIR,
        true,
        join(WIN_BOUND_DIR, ANOTHER_DIR),
      ],
      [
        new URL(join('file://', TEMP_DIR)),
        WIN_BOUND_DIR,
        true,
        new URL(join('file://', TEMP_DIR)),
      ],
      [
        new URL(join('file://', TEMP_DIR)),
        WIN_BOUND_DIR,
        false,
        new URL(join('file://', WIN_BOUND_DIR, TEMP_DIR.substring(3))),
      ],
      [
        new URL(`file:///C:/${ANOTHER_DIR}/`),
        WIN_BOUND_DIR,
        true,
        new URL(join('file://', WIN_BOUND_DIR, `${ANOTHER_DIR}/`)),
      ],
      [
        Buffer.from('file.ext'),
        WIN_BOUND_DIR,
        true,
        join(WIN_BOUND_DIR, 'file.ext'),
      ],
    ],
  },
};

const { makePathSafeCases, makeFsArgSafeCases } = utils.isWindows
  ? cases.win
  : cases.posix;

metatests.case(
  'Test utils',
  { utils },
  {
    'utils.makePathSafe': makePathSafeCases,
    'utils.makeFsArgSafe': makeFsArgSafeCases,
  }
);
