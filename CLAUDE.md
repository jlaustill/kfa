# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **kfa (QWERTY Phonetic Alphabet)** project - a text-to-speech web application that demonstrates a phonetic alphabet system using only standard QWERTY keyboard characters (A-Z, a-z) to represent the 44 distinct sounds of English.

The project consists of:
- **Root level**: Documentation and roadmap for the kfa phonetic system
- **`/app` directory**: React + TypeScript + Vite client-side web application for testing kfa pronunciation via Web Speech API

## Development Commands

**Primary development (run from `/app` directory):**
```bash
cd app
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check for ESLint errors
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check Prettier formatting
npm run preview      # Preview production build
```

**Quality checks before committing:**
```bash
npm run lint && npm run format:check && npm run build
```

## Architecture & Technology Stack

**Frontend Stack:**
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Material-UI (MUI)** for UI components and theming
- **Web Speech API** for client-side text-to-speech synthesis
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

**Application Goals:**
- 100% client-side operation (no backend required)
- Direct kfa text → Web Speech API synthesis
- Montana English pronunciation as baseline
- Real-time pronunciation testing and validation

**Code Quality Standards:**
- Strict TypeScript configuration with explicit return types
- ESLint with React hooks and TypeScript rules
- Prettier for consistent formatting
- Default exports preferred over named exports
- KISS principle - simple, straightforward implementation
- Always import types by type

## Development Workflow

1. **Setup**: All development happens in the `/app` directory
2. **Code Quality**: Run `npm run lint && npm run format:check` before commits
3. **Testing**: Use Web Speech API for immediate pronunciation validation
4. **Build**: Ensure `npm run build` passes before deployment
5. **Architecture**: Follow the established React + MUI + TypeScript patterns

## Current State

The project is in early development with a basic Vite + React setup. The roadmap outlines a comprehensive plan from basic TTS integration through complete kfa system implementation and accent variation support.

## Strict Implementation Guidelines

- do NOT fall back to Web Speech API, EVER

## Operational Guidance

- Always delete all the files in the output_waves folder before creating new ones, ZERO EXCEPTIONS