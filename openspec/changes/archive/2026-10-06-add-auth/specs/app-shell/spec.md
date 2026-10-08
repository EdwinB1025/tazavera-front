# Spec Delta

## Purpose

Adds the response header that keeps the application's pages isolated while a popup window keeps its opener, to the response-header policy `app-shell` already owns.

## ADDED Requirements

### Requirement: Cross-Origin-Opener-Policy
Every document response of the application except the callback route SHALL carry `Cross-Origin-Opener-Policy: same-origin-allow-popups`, so the application's pages stay isolated while a popup window keeps its opener.

#### Scenario: Opener kept outside the callback
- **WHEN** a page other than the callback route answers a request
- **THEN** its response carries `Cross-Origin-Opener-Policy: same-origin-allow-popups`
