# kfa Translator

A React web application for translating English text to the kfa (QWERTY Phonetic Alphabet) system.

## Overview

This application provides real-time translation between English, IPA (International Phonetic Alphabet), and kfa phonetic representations. It uses a comprehensive 123,000+ word dictionary with American English pronunciation prioritization.

## Key Features

- **Real-time translation** between English ↔ IPA ↔ kfa
- **Tokenization-based processing** for accurate word boundary handling
- **American pronunciation priority** using structured JSON dictionary
- **Unknown word bracketing** for missing dictionary entries
- **Comprehensive phoneme mapping** including stress marks and variants
- **Clean 2-column interface** for easy comparison

## Core kfa Mappings

The application maps all 44 English phonemes using only QWERTY characters:

**Consonant highlights:**
- `ng` → NG sound (sing, thinking, long)
- `T` → TH sounds (think, this)  
- `S` → SH sound (ship, washing)
- `Z` → ZH sound (pleasure, vision)
- `J` → J sound (jump, magic)
- `c` → CH sound (chair, teacher)

**Vowel patterns:**
- Core vowels: u, i, y, a, O, e, o, U
- Diphthongs: ay, uy, uO, aO, ir, er, ur, oy

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check for linting errors
npm run preview  # Preview production build
```

## Dictionary Management

The application uses `/public/data/ipadict.json` with structure:
```json
{
  "word": [
    {"ipa": "pronunciation", "priority": 1, "region": "american"},
    {"ipa": "variant", "priority": 2, "region": "british"}
  ]
}
```

Use `scripts/convertDictionary.cjs` to convert from tab-separated format to structured JSON.