# 🍅 Tomo — Your Focus Friend

**Tomo** is a simple, modern **Pomodoro focus timer** built as an installable Progressive Web App (PWA). Focus, take breaks, and get more done — with calming focus sounds, a clean 3D-inspired interface, a built-in blog, and full offline support.

> _Tomo (友) means "friend" in Japanese — and it's the first syllables of_ **toma**_to, the origin of the Pomodoro Technique._

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)

---

## ✨ Features

- ⏱️ **Three modes** — Focus, Short Break, and Long Break, with auto-cycling between them
- ⚙️ **Fully customizable** — set your own focus/break lengths, long-break interval, auto-start, and more (saved to your device)
- 🎵 **Focus sounds** — synthesized **Rain, Ocean, Brown & White noise** plus royalty-free **lofi & ambient music**, with optional "auto-play during focus, pause on breaks"
- 🔔 **Smart audio cues** — distinct chimes for focus-end vs. break-end, plus an optional ticking clock
- 🎨 **Modern 3D UI** — glassmorphism, a glowing progress ring, pressable buttons, and an ambient background that retints per mode
- 📊 **Daily session counter** — tracks how many focus sessions you've completed today
- 📝 **Built-in blog** — 7 articles on the Pomodoro Technique, productivity, focus, and discipline
- 📱 **Installable PWA** — add it to your home screen or desktop and use it completely offline
- 🎯 **No accounts, no tracking** — everything stays on your device

## 🛠️ Tech Stack

| | |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| **Language** | [TypeScript](https://www.typescriptlang.org) |
| **Font** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via `next/font` |
| **Audio** | Web Audio API (synthesized soundscapes) + bundled MP3s |
| **PWA** | Web App Manifest + an offline-first service worker |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18.18 or newer
- npm (comes with Node)

### Installation

```bash
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

Because Tomo is a PWA, you can install it on any device:

- **Desktop (Chrome / Edge):** click the install icon in the address bar (Tomo also shows an "Install" banner on first visit).
- **Android:** tap the menu → **Add to Home screen**.
- **iOS (Safari):** tap the **Share** button → **Add to Home Screen**.

> **Note:** Installation requires the app to be served over **HTTPS** (or `localhost`). When you deploy to a host like [Vercel](https://vercel.com), HTTPS is handled for you automatically.

## 📁 Project Structure

```
.
├── public/
│   ├── sw.js                  # Service worker (offline support)
│   ├── icon.svg / *.png       # App + PWA icons
│   └── sounds/                # Royalty-free focus music (MP3)
└── src/
    ├── app/
    │   ├── layout.tsx         # Root layout, fonts & PWA metadata
    │   ├── page.tsx           # The Pomodoro timer
    │   ├── manifest.ts        # Web App Manifest
    │   ├── service-worker.tsx # Registers the service worker
    │   ├── globals.css        # Theme tokens & 3D styling
    │   ├── components/        # SettingsModal, SoundPanel, InstallPrompt, SiteHeader
    │   └── blog/              # Blog index, post pages & content
    └── lib/
        ├── audio.ts           # Web Audio alarms, ticks & soundscapes
        ├── settings.ts        # Settings type & defaults
        └── useLocalStorage.ts # Persistence hook
```

## 🍅 How the Pomodoro Technique Works

1. Pick a task and **focus for 25 minutes**.
2. Take a **5-minute short break**.
3. Repeat. After **4 focus sessions**, take a longer **15-minute break**.

Tomo handles the cycling for you — just press **Start**. Read more in the in-app [blog](/blog).

## 📦 Deployment

The easiest way to deploy is with [Vercel](https://vercel.com/new) (the creators of Next.js):

1. Push this repository to GitHub.
2. Import it into Vercel.
3. Deploy — no configuration needed.

You'll get HTTPS out of the box, so the PWA install prompt works immediately.

## 🎵 Audio Credits

The bundled music is royalty-free / public-domain and free for commercial use:

- **Lofi Study** — [Pixabay Music](https://pixabay.com/music/) (Pixabay Content License, no attribution required)
- **Meditation**, **Wholesome Calm**, **Reawakening**, **Pamgaea**, **Spring Thaw** & **Magic Forest** — by **Kevin MacLeod** ([incompetech.com](https://incompetech.com)), licensed under [Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

Rain, Ocean, Brown noise and White noise are generated in-browser with the Web Audio API (no files).

> **Note on `muse.mp3`:** this track was added locally by the project owner. Ensure you have the
> rights to distribute any audio you bundle in `public/sounds/` before deploying publicly.

## 📄 License

Released under the [MIT License](LICENSE). Music tracks retain their respective licenses (see Audio Credits).

---

<p align="center">Made with 🍅 and focus — <strong>Tomo, your focus friend.</strong></p>
