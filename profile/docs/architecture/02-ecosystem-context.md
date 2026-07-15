# Ecosystem Context

<!-- mermaid-source: diagrams/ecosystem-context.mmd -->
```mermaid
C4Context
  title Bardie System Context
  Person(dj, "DJ", "Creates streams queues music")
  Person(listener, "Listener", "Tunes in via player")
  System(bardie, "Bardie", "Modular audio broadcast platform")
  System_Ext(players, "Media Players", "VLC VRChat")
  System_Ext(idp, "OIDC IdP", "Zitadel etc v0.2")
  Rel(dj, bardie, "Controls via client modules")
  Rel(listener, players, "Listens")
  Rel(players, bardie, "GET /stream/slug")
  Rel(bardie, idp, "OIDC v0.2")
```

> Diagram uses C4-PlantUML-style notation in Mermaid for orientation. Source: [diagrams/ecosystem-context.mmd](diagrams/ecosystem-context.mmd)

Bardie sits between **DJs** (stream owners), **listeners** (tune in anywhere), and **pluggable modules** — client surfaces, audio sources, and auth.

## Repositories

| Component | Repository |
|-----------|------------|
| Core | [bardie-kithara](https://github.com/Bardie-radio/bardie-kithara) |
| Web UI | [bardie-plume](https://github.com/Bardie-radio/bardie-plume) |
| Login+password auth (MVP) | Module and repo name undecided *(planned)* |
| YouTube Source (MVP) | Module and repo name undecided *(planned)* |

**Related:** [org hub](README.md) · [kithara architecture](https://github.com/Bardie-radio/bardie-kithara/tree/main/docs/architecture)

**Read next:** [03-component-landscape.md](03-component-landscape.md)
