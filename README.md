# PasswordCard Android — Auto-Rotating Cryptographic Grid

An offline-first Android application and interactive web edition of [PasswordCard.org](https://www.passwordcard.org/en), built with **Material UI** and featuring an automatic **5-minute (300s) cryptographic card rotation timer**.

---

## ✨ Features

- **🔒 100% Offline Standalone Android APK**: All HTML, JavaScript, CSS, Material UI components, and cryptographic routines are bundled directly inside the APK (`android_asset/`). It runs completely offline without network access, tunnels, or external servers.
- **⏱️ Auto-Rotating 5-Minute Cryptographic Matrix**: The card automatically deals a fresh 64-bit cryptographic seed every 5 minutes (300 seconds), complete with circular/linear progress bars, pause/resume controls, and a rotation history log to restore any past card.
- **📐 Authentic PasswordCard.org Deterministic Algorithm**: 
  - Faithful TypeScript port of `java.util.Random` 64-bit Linear Congruential Generator.
  - Generates the standard 29-column × 9-row matrix (29 shuffled symbol columns + 8 color-coded rows).
  - Uses the official 56-character unambiguous alphabet (excludes `0`, `O`, `o`, `1`, `l`, `I`, `i`).
  - Supports toggles for special symbol insertion on even columns and digits-only PIN zones on rows 5–8.
- **🧭 Interactive Coordinate Password Extractor**: Tap any cell, row color (`1·White` through `8·Teal`), or symbol (`■▲●★☂☀☁☹☺♠♣♥♦♫€¥£$!?¡¿⊙◐◩❖`) to extract passwords in 6 reading directions (`→`, `←`, `↓`, `↑`, `↘`, `↗`) from 4 to 29 characters.
- **📌 Pinned Coordinate Recipes**: Save favorite coordinate paths (e.g. *Row 3 Red + ♥ Heart, 12 chars*). Pinned recipes automatically track their symbol across 5-minute card rotations.
- **🎨 Pure OLED Black & Teal Material UI Theme**: Custom Material UI v7 theme optimized for battery saving on AMOLED displays and daylight legibility.

---

## 📱 Offline Android APK Installation

The pre-compiled standalone APK is available directly in this repository:

- **File**: `PasswordCard-Android-Offline.apk` *(4.1 MB)*
- **Offline Guarantee**: Works in Airplane Mode with zero internet connection.

### How to Install:
1. Transfer `PasswordCard-Android-Offline.apk` to your Android phone (via USB, Google Drive, email, or messaging).
2. Tap the file in your phone's file manager to install. *(If prompted, allow installation from unknown sources)*.
3. Open **PasswordCard**—it opens instantly in standalone fullscreen mode!

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/)
- **UI Components**: [Google Material UI (`@mui/material`)](https://mui.com/), [Material Icons](https://mui.com/material-ui/material-icons/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Mobile Packaging**: [Capacitor 7](https://capacitorjs.com/)
- **Android Toolchain**: OpenJDK 21, Android SDK Platform 34/36, Gradle 8.14

---

## 🚀 Development Quick Start

### Prerequisites
- Node.js 18+ (Node 22 recommended)
- Java 21 & Android SDK (only needed if building native Android APK from source)

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install --legacy-peer-deps
```

### 2. Run Local Web Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build Production Web Bundle
```bash
npm run build
```

### 4. Build Native Offline Android APK Locally
```bash
# Sync web assets into Android project
npx cap sync android

# Compile debug APK with Gradle
cd android
./gradlew assembleDebug
```
The output APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🤖 Automated GitHub Actions CI/CD

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/build-apk.yml`). 

Whenever you push to the `main` branch or manually trigger the workflow from the **Actions** tab on GitHub, GitHub's cloud runners will automatically build the standalone offline APK and upload it under **Run Artifacts** for one-click downloading!

---

## 📄 License

Apache License 2.0. Based on the concept and algorithm by [PasswordCard.org](https://www.passwordcard.org/en).
