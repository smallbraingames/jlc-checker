# JLC Part Checker

A utility to match JLC PCB parts with your canonical bill of materials (BOM), helping you quickly identify part substitutions and inconsistencies.

## 🚀 Features

- Cross-references JLCPCB parts with your canonical BOM
- Identifies matching parts across both lists
- Shows parts unique to JLCPCB that might be substitutions
- Highlights parts from your BOM not found in JLCPCB's list
- Supports both CSV and Excel formats
- Concurrent processing for faster results

## 📋 Prerequisites

- [Bun](https://bun.sh) runtime
- Playwright for web scraping

## 🔧 Installation

```bash
bun install
```

## 📁 Data Setup

Place your files in the `data` directory:
- `data/current.xls` - The Excel file from JLCPCB
- `data/canonical/bom.csv` - Your canonical BOM in CSV format

## 🏃‍♂️ Usage

Run the checker with:

```bash
bun run index.ts
```

## 📊 Output

The tool provides three color-coded sections:
- **Blue**: Parts that match between both lists
- **Yellow**: Parts in JLCPCB's list but not in your canonical BOM (potential substitutions)
- **Magenta**: Parts in your canonical BOM not found in JLCPCB's list (missing parts)
