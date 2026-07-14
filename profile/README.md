# Bardie

> A modular web application for creating and managing synchronized audio streams.

Bardie makes listening to music with your friends easy — without proprietary subscription services like Spotify, manual synchronization rituals, or Discord screen sharing compressing your music to hell and back.

🚧 **Heavily Work in Progress.** No working builds yet

---

## ✨ Features

- 🧩 Extendable through modules
- 🎧 One audio stream for everyone
- 🏠 Self-hosted and fully under your control

---

## 🏗️ Architecture

Bardie is built around a modular architecture where different components handle specific parts of the listening experience.

### 🎼 Kithara — Core

The main instrument of Bardie.

Kithara provides the core functionality through a REST API:
- managing audio streams
- controlling playback
- handling connected clients and modules

### 🌐 Plume — Web Interface

The main user-facing interface for Bardie.

Plume communicates with Kithara to:
- control active streams
- listen to available streams
- provide features based on user access rights

### 🤖 Discord Bot *(name TBD)*

A Discord integration for bringing Bardie streams directly into voice channels.

Planned functionality:
- play Bardie streams directly in Discord voice channels
- select and control audio sources

### ▶️ Audio Source Modules *(names TBD)*

Modular providers responsible for supplying audio to Bardie streams.

Planned sources:
```text
├── YouTube / ytdl source  → Search and play music from online sources using ytdl
├── Local stream source    → Re-broadcast direct audio input from your PC
└── File source            → Play uploaded audio files
```

---

## 🚀 Self-hosting

Self-host Bardie, extend it with modules, and stay in control of your listening experience.
