# Bardie

> A modular, self-hosted stack for synchronized audio streams.

Bardie makes listening to music with your friends easy — without proprietary subscription services like Spotify, manual synchronization rituals, or Discord screen sharing compressing your music to hell and back.

🚧 **Heavily Work in Progress.** No working builds yet

---

## ✨ Features

- Extendable through modules — clients, sources, and auth
- One shared audio stream per Struna (stream)
- Self-hosted — you run the stack on your infrastructure

---

## 🏗️ Architecture

**[Architecture documentation](docs/architecture/README.md)** — ecosystem overview and whole-stack design. ADRs live in [bardie-kithara](https://github.com/Bardie-radio/bardie-kithara/tree/main/docs/architecture/adrs).

Bardie is built around a modular architecture. **Kithara** is the core; everything else plugs in as a module chosen for how your community listens and communicates.

### 🎼 Kithara — Core

The main instrument of Bardie.

Kithara provides the core functionality through a REST API:
- managing audio streams
- controlling playback
- orchestrating connected client, source, and auth modules

### 🖥️ Client Modules *(names TBD)*

The user-facing surface is **modular** — not tied to a single web app. Each client module talks to Kithara's REST API and presents Bardie in a channel your community already uses.

```text
├── Plume            → Web UI; list streams, control playback, optional in-browser listen
├── Discord bot    → Play Bardie streams in voice channels; select and control sources
└── Telegram bot   → Control streams remotely using Telegram bot
```

More client modules may appear as convenient channels are found. **Legacy players** (VLC, VRChat) are listen-only — they use `/stream/{slug}` but are not full client modules.

### 🔐 Auth Adapter Modules *(names TBD)*

Pluggable login and permission providers. Kithara orchestrates discovery and token validation; each adapter owns its login UI.

```text
├── Login + password   → MVP local accounts (module and repo name undecided)
└── OIDC               → Zitadel, Google, … (v0.2; name undecided)
```

### ▶️ Source Modules *(names TBD)*

Modular providers responsible for supplying audio to Bardie streams.

```text
├── YouTube / ytdl source  → Search and play music from online sources using ytdl
├── Local stream source    → Re-broadcast direct audio input from your PC
└── File source            → Play uploaded audio files
```

---

## 🚀 Self-hosting

Whole-stack process: [Deployment](docs/architecture/05-deployment.md). Per-container detail lives in each repo.
