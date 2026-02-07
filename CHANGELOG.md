# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-02-07

### Changed
- Refocused project exclusively on feature gate detection, analysis, and patching
- Stripped tool injection system to simplify codebase

### Added
- Complete binary scan of Claude Code v2.1.37 (605 flags cataloged)
- Reverse-engineered all 15 previously unknown gates (marble-anvil, marble-kite, coral-fern, quiet-fern, plank-river-frost, scarf-coffee, cork-m4q, tst-kx7, plum-vx3, tool-pear, flicker, quartz-lantern, cache-plum-violet, kv7-prompt-sort, workout)
- Environment variable reference documentation (docs/ENV-VARS.md)
- Binary patcher test coverage with proper codesign mocking
- Version delta tracking (v2.1.34 to v2.1.37)

### Fixed
- Binary patcher tests now properly mock `child_process.execSync`
- Silver-lantern detection regex updated for v2.1.37 ternary pattern

## [1.0.0] - 2026-01-15

### Added
- Feature gate detection and patching system
- Support for JS bundle patching (string replacement)
- Support for native binary patching (byte-length-preserving)
- macOS ARM64 codesign re-signing after binary modification
- CLI interface (`claude-patcher gates`)
- Programmatic TypeScript API
- Gate registry with tier classification (1-5)
- Backup/restore system for patched bundles
