# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-11

### Added
- TypeScript definitions (`dist/sadrazam.d.ts`)
- ESM build output (`dist/sadrazam.esm.js`) alongside UMD
- Security section in README documenting `innerHTML` usage
- ARIA `role="alert"`, `aria-live`, `aria-atomic` attributes to Toast notifications

### Changed
- `Document.copyInputText()` now uses the modern Clipboard API instead of the deprecated `document.execCommand('copy')`
- README Script Tag examples now include copy instructions for clarity

### Removed
- `globalThis.Sadrazam` assignment from library source (consumers are now responsible for global assignment)
