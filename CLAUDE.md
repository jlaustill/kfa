# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **kfa (QWERTY Phonetic Alphabet)** project - a text-to-speech web application that demonstrates a phonetic alphabet system using only standard QWERTY keyboard characters (A-Z, a-z) to represent the 44 distinct sounds of English.

The project consists of:
- **Root level**: Documentation and roadmap for the kfa phonetic system
- **`/app` directory**: React + TypeScript + Vite client-side web application for testing kfa pronunciation
- **`/app-backend` directory**: C++ API to provide TTS for the frontend

## Development Commands

**Primary development (run from `/app` directory):**
```bash
cd app
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check for ESLint errors
npm run lint:fix     # Auto-fix ESLint issues
npm run prettier     # Format code with Prettier
npm run prettier:fix # Check Prettier formatting
npm run preview      # Preview production build
```

**Quality checks before committing:**
```bash
npm run lint && npm run prettier:fix && npm run build
```

## Architecture & Technology Stack

**Frontend Stack:**
- **React** with TypeScript
- **Vite** for build tooling and development server
- **Material-UI (MUI)** for UI components and theming
- **ESLint + Prettier** for code quality and formatting

**Project Structure:**
```
kfa/
├── README.md           # Complete kfa phonetic system documentation
├── roadmap.md          # Development roadmap and phases
├── app/                # React application
│   ├── src/
│   │   ├── components/ # React components (to be created)
│   │   ├── utils/      # Utility functions (to be created)
│   │   ├── types/      # TypeScript type definitions (to be created)
│   │   └── App.tsx     # Main application component
│   ├── package.json
│   └── vite.config.ts
```

## Key Implementation Details

**kfa System:**
- Maps all 44 English phonemes using only QWERTY letters
- Core vowels: u, i, y, E, a, O, e, A, o, U
- Diphthongs: ey, ay, uO, au, iE, eE, UE, oUy
- Special consonants: T (TH-this), Q (TH-thin), S (SH), Z (ZH), G (NG), J (J sound), c (CH)
- Source of Truth(SOT or SOR) is the README.md in the roof of the project

**Application Goals:**
- Direct kfa text → Speech
- Montana English pronunciation as baseline
- Real-time pronunciation testing and validation

**Code Quality Standards:**
- Strict TypeScript configuration with explicit return types
- ESLint with React hooks and TypeScript rules
- Prettier for consistent formatting
- Default exports preferred over named exports and only 1 thing per file period, no exceptions
- KISS principle - simple, straightforward implementation
- Always import types by type

## Development Workflow

1. **Setup**: All development happens in the `/app` directory
2. **Code Quality**: Run `npm run lint && npm run format:check` before commits
3. **Testing**: 
4. **Build**: Ensure `npm run build` passes before deployment
5. **Architecture**: Follow the established React + MUI + TypeScript patterns

## Current State

The project is in early development with nothing setup. The roadmap outlines a comprehensive plan from basic TTS integration through complete kfa system implementation and accent variation support.

## Strict Implementation Guidelines

- do NOT fall back to Web Speech API, EVER
- do NOT mock speech, EVER if something fails, add more error handling and logging and figure out why, don't mask it

## Operational Guidance

- When generating sample mp3's or wave files for the user to listen to and validate, always put them in an output folder for easier maintenance
- Always delete all the files in the output folder before creating new ones, ZERO EXCEPTIONS