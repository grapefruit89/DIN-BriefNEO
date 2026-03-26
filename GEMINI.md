# 🧠 GEMINI.md - DIN-BriefNEO (v14.0 Platinum)
# Status: ACTIVE - AVIATION GRADE PLATINUM | Stand: März 2026

This project is the definitive, client-side letter editor compliant with **DIN 5008:2020**. It follows the **"Aviation Grade Platinum"** protocol for maximum precision and Blink-Engine isomorphism.

## 🏗️ Project Overview
- **Core Specification:** [PLATINUM_PROTOCOL_V3.md](./docs/PLATINUM_PROTOCOL_V3.md) (LOCKED SSoT).
- **Architecture:** **Blink-Direct & Sovereign Semantic Matrix**.
- **Tech Stack:** Pure Vanilla JavaScript (ES6+), CSS3 (Modern Hooks), HTML5 (Custom Elements).
- **Engine Binding:** Optimized for Chrome 147+ (EditContext API, Sanitizer API).

## 📜 Mandatory Development Rules
> [!DANGER]
> **Rule #1:** Never deviate from [PLATINUM_PROTOCOL_V3.md](./docs/PLATINUM_PROTOCOL_V3.md). Any change without a Traceability ID is a `CMA_VIOLATION`.

1. **Tag Prefix:** All custom elements MUST use the `din-` prefix (e.g., `<din-page>`, `<din-recipient>`).
2. **Security:** `innerHTML` is STRICTLY BANNED. Use `setHTML()` with the Sanitizer API.
3. **Precision:** All measurements are hard-constrained to DIN 5008 (85x45mm address zone, etc.).
4. **Context Safety:** The tools `head` and `tail` are BANNED. Use `read_file` with exact line numbers.
5. **Aviation Grade Logic:** Use BigInt or AviationMath cent-fallback for any monetary calculations to prevent floating-point errors.

## 🛠️ Integrated MCP Servers
When working on this project, the following MCP servers are configured and trusted:
- **Prettier:** For code formatting (HTML/CSS/JS).
- **Stylelint:** For CSS validation.
- **ESLint:** For JS logic validation.
- **Puppeteer:** For browser automation and screenshots.
- **Chrome DevTools:** For live layout inspection.
- **Figma:** For design reference sync.
- **Accessibility:** For A11y / semantic checks.
- **Typst-Expert:** For high-precision typesetting guidance.

## 📂 Project Structure
- `.brain/`: Core logic and business rules (Brain-First).
- `css/`: Layout definitions (Pixel-perfect DIN-Paper).
- `js/`: Application logic using EditContext API.
- `assets/`: Logos and visual resources.
- `plans/`: Implementation roadmaps.

## 🛡️ Hardware Intelligence & Auth
- **Master SSH Identity:** Hardware-based (Motherboard/TPM) registered in GitHub as `grapefruit89`.
- **Verified Status:** ✅ GitHub Auth successful (`Hi grapefruit89!`).
- **Connection Protocol:** SSH preferred, HTTPS fallback active for CLI automation.
- **System Config:** Uses `id_ed25519` hardware-bound key. The `ssh-agent` service on win32 is the gatekeeper for this identity.
