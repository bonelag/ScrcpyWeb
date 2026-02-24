# GitHub Copilot Instructions for ws-scrcpy

This repository hosts `ws-scrcpy`, a web client for Android (scrcpy) and iOS devices. It uses a Node.js server and a browser-based client, heavily relying on TypeScript and Webpack with conditional compilation.

## Architecture Overview

- **Server (`src/server`)**: Node.js backend.
  - Entry point: [src/server/index.ts](src/server/index.ts).
  - Manages device connections (ADB for Android, WDA for iOS).
  - Exposes HTTP and WebSocket servers.
  - Uses Middleware (`mw`) pattern for handling WebSocket connections (e.g., `WebsocketProxy`, `WebsocketMultiplexer`).
- **Client (`src/app`)**: Browser frontend.
  - Entry point: [src/app/index.ts](src/app/index.ts).
  - Handles video rendering (MSE, WebAssembly, WebCodecs) and user input.
  - Communicates with the server via WebSockets.
- **Shared (`src/common`)**: Shared TypeScript definitions, constants, and utility classes used by both server and client.
- **Build System**: Webpack-based.
  - Configured in `webpack/`.
  - Uses `ifdef-loader` for feature flagging.

## Critical Developer Workflows

- **Build**: Run `npm run dist` to build both server and client. Output goes to `dist/`.
- **Development Build**: Run `npm run dist:dev` for source maps and development settings.
- **Start**: Run `npm start` to launch the built server.
- **Configuration**:
  - Build-time configuration: `build.config.override.json` (overrides [webpack/default.build.config.json](webpack/default.build.config.json)).
  - Runtime configuration: `config.yaml` (or `config.example.yaml`).

## Project-Specific Conventions

### Conditional Compilation
The project extensively uses `ifdef-loader` to include/exclude features at build time.
- **Syntax**: `/// #if FLAG_NAME` ... `/// #endif`
- **Usage**: Used in both server and client code to conditionally import modules.
- **Example**:
  ```typescript
  /// #if INCLUDE_GOOG
  async function loadGoogModules() {
      const { ControlCenter } = await import('./goog-device/services/ControlCenter');
      // ...
  }
  /// #endif
  ```
- **Implication**: When adding new features or dependencies, consider if they should be behind a feature flag. Check [webpack/default.build.config.json](webpack/default.build.config.json) for available flags.

### Dynamic Imports
To support conditional compilation and reduce bundle size, modules are often imported dynamically inside functions or conditional blocks.
- **Pattern**: `const { ModuleName } = await import('./path/to/Module');`

### Device Abstraction
Code is separated by platform:
- **Android**: `src/**/goog-device` (Server) / `src/**/googDevice` (Client).
- **iOS**: `src/**/appl-device` (Server) / `src/**/applDevice` (Client).

### Message Passing
- **Definitions**: Message structures are defined in `src/types` and `src/common`.
- **Serialization**: Binary protocols are often used for performance (video streams). Check [src/common/Constants.ts](src/common/Constants.ts) and specific message parsers.

## Key Files & Directories

- [src/server/index.ts](src/server/index.ts): Server entry point, service initialization.
- [src/app/index.ts](src/app/index.ts): Client entry point, player registration.
- [webpack/ws-scrcpy.common.ts](webpack/ws-scrcpy.common.ts): Shared Webpack configuration.
- [src/common/](src/common/): Shared logic.
- [vendor/](vendor/): Third-party dependencies (decoders, etc.).

## External Dependencies
- **adbkit**: For Android Device Bridge communication.
- **scrcpy**: The underlying Android server (pushed to device).
- **Video Decoders**: Broadway, TinyH264, h264-converter (MSE).
