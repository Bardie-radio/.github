# Bardie

> A modular, self-hosted stack for synchronized audio streams.

Bardie makes listening to music with your friends easy — without proprietary subscription services like Spotify, manual synchronization rituals, or Discord screen sharing compressing your music to hell and back.

🚧 **Heavily Work in Progress** — MVP quartet images publish to GHCR; self-host via the [reference Compose](deploy/).

---

## ✨ Features

- Extendable through modules — clients, sources, and auth
- One shared audio stream per Struna (stream)
- Self-hosted — you run the stack on your infrastructure

---

## 🏗️ Architecture

**[Architecture documentation](docs/architecture/README.md)** — ecosystem overview and whole-stack design. ADRs live in [kithara](https://github.com/Bardie-radio/kithara/tree/main/docs/architecture/adrs).

Bardie is built around a modular architecture. **Kithara** is the core; everything else plugs in as a module chosen for how your community listens and communicates.

### 🎼 Kithara — Core

The main instrument of Bardie.

Kithara provides the core functionality through a REST API:
- managing audio streams
- controlling playback
- orchestrating connected client, source, and auth modules
- owning the user database and verifying user JWTs (no built-in login provider; modules issue/forward tokens)

### 🖥️ Client Modules

The user-facing surface is **modular** — not tied to a single web app. Each client module talks to Kithara's REST API and presents Bardie in a channel your community already uses.

```text
├── Plume   → Web UI; user-aware (MVP)
├── Cauda   → Telegram; user-aware (future)
└── Beak    → Discord; static, guild-managed users (future)
```

More client modules may appear as convenient channels are found. **Legacy players** (VLC, VRChat) are listen-only — they use `/stream/{slug}` but are not full client modules.

### 🔐 Auth Adapter Modules

Pluggable login providers. Auth modules **issue or forward JWTs** (and own refresh); Kithara orchestrates discovery, stores users, and **verifies** JWTs. Clients render login UI from discovery. Adapters do **not** host public login pages.

```text
├── Bes     → Login + password (MVP)
├── Argus   → OIDC — Zitadel, Google, … (v0.2)
└── Hecate  → Passkeys (future)
```

### ▶️ Source Modules

Modular providers responsible for supplying audio to Bardie streams.

```text
├── Magpie    → YouTube / ytdl search and play (MVP)
├── Starling  → Re-broadcast direct audio input from your PC (future)
└── Catbird   → Play local / uploaded audio files (future)
```

---

## 🚀 Self-hosting

1. Copy [`deploy/`](deploy/) (or clone this repo) → `cp deploy/.env.example deploy/.env` → edit secrets.
2. `docker compose -f deploy/compose.yml up -d` — nginx on `:80`, apps from `ghcr.io/bardie-radio/<codename>`.
3. Details, external-edge mode, and config table: [Deployment](docs/architecture/05-deployment.md).

Per-container env/ops live in each service repo (start with [Kithara configuration](https://github.com/Bardie-radio/kithara/blob/main/docs/architecture/operations/configuration.md)).
