# 🍅 Pomofocus — Pomodoro Timer

A simple, modern **Pomodoro timer** built as an installable Progressive Web App (PWA). Focus, take breaks, and get more done — with a clean, 3D-inspired interface that works offline and installs to your home screen like a native app.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## ✨ Features

- ⏱️ **Three modes** — Focus (25 min), Short Break (5 min), and Long Break (15 min)
- 🔄 **Auto-cycling** — automatically flows into a break after focusing, and into a long break every 4th session
- 🎨 **Modern 3D UI** — glassmorphism card, glowing circular progress ring, pressable 3D buttons, and an ambient animated background that retints per mode
- 🔔 **Gentle chime** — a soft Web Audio tone signals when a session ends (no audio files needed)
- 📊 **Session counter** — tracks how many focus sessions you've completed
- 🪟 **Live tab title** — see the countdown right in your browser tab
- 📱 **Installable PWA** — add it to your home screen or desktop and use it offline
- 🎯 **No accounts, no tracking, no clutter** — it just works

## 🛠️ Tech Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| **Language** | [TypeScript](https://www.typescriptlang.org) |
| **Font** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via `next/font` |
| **PWA** | Web App Manifest + a minimal offline-first service worker |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18.18 or newer
- npm (comes with Node)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "Pomodoro Timer"

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build   # create an optimized production build
npm start       # serve the production build
```

## 📲 Installing as an App

Because this is a PWA, you can install it on any device:

- **Desktop (Chrome / Edge):** click the install icon in the address bar.
- **Android:** tap the menu → **Add to Home screen**.
- **iOS (Safari):** tap the **Share** button → **Add to Home Screen**.

> **Note:** Installation requires the app to be served over **HTTPS** (or `localhost`). When you deploy to a host like [Vercel](https://vercel.com), HTTPS is handled for you automatically.

## 📁 Project Structure

```
.
├── public/
│   ├── sw.js                 # Service worker (offline support)
│   ├── icon.svg              # App logo (source)
│   ├── icon-192.png          # PWA icon
│   ├── icon-512.png          # PWA icon
│   └── icon-maskable.png     # Maskable PWA icon
└── src/
    └── app/
        ├── layout.tsx        # Root layout, fonts & PWA metadata
        ├── page.tsx          # The Pomodoro timer (UI + logic)
        ├── manifest.ts       # Web App Manifest
        ├── service-worker.tsx# Registers the service worker
        └── globals.css       # Theme tokens & 3D styling
```

## 🍅 How the Pomodoro Technique Works

1. Pick a task and **focus for 25 minutes**.
2. Take a **5-minute short break**.
3. Repeat. After **4 focus sessions**, take a longer **15-minute break**.

This app handles the cycling for you — just press **Start**.

## 📦 Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/new) (the creators of Next.js):

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Deploy — no configuration needed.

You'll get HTTPS out of the box, which means the PWA install prompt works immediately.

## 📄 License

Released under the [MIT License](LICENSE). Feel free to use, modify, and share.

---

<p align="center">Made with 🍅 and focus.</p>
