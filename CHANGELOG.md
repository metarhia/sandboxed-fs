# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased][unreleased]

### Added

- CHANGELOG.md file.

### Removed

- Dropped support for Node.js 6.

## [0.3.2][] - 2018-06-27

### Fixed

- Issues in the `README.md` file.

## [0.3.1][] - 2018-05-10

### Added

- Argument to control enabling access to `os.tmpdir()`.

### Changed

- Access to `os.tmpdir()` is enabled by default.

## [0.3.0][] - 2018-02-07

### Added

- Support for `Buffer` and `URL` as arguments.
- Support for more methods:
  - `fs.copyFile()` and `fs.copyFileSync()`
  - `fs.realpath.native()` and `fs.realpathSync.native()`
  - `fs.lchmod()` and `fs.lchown()`

## [0.2.0][] - 2018-02-05

### Added

- Windows support.

## [0.1.0][] - 2017-03-27

### Added

- The first implementation of the package.

[unreleased]: https://github.com/metarhia/sandboxed-fs/compare/v0.3.2...HEAD
[0.3.2]: https://github.com/metarhia/sandboxed-fs/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/metarhia/sandboxed-fs/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/metarhia/sandboxed-fs/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/metarhia/sandboxed-fs/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/metarhia/sandboxed-fs/releases/tag/v0.1.0
