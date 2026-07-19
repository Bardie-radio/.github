# Ecosystem Context

<!-- mermaid-source: profile/docs/architecture/diagrams/ecosystem-context.mmd -->
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
  Rel(bardie, idp, "Argus OIDC v0.2")
```

> Diagram uses C4-PlantUML-style notation in Mermaid for orientation. Source: [diagrams/ecosystem-context.mmd](diagrams/ecosystem-context.mmd)

Bardie sits between **DJs** (stream owners), **listeners** (tune in anywhere), and **pluggable modules** — client surfaces, audio sources, and auth.

## Repositories

| Component | Repository | Docs |
|-----------|------------|------|
| Core | [kithara](https://github.com/Bardie-radio/kithara) | [architecture](https://github.com/Bardie-radio/kithara/tree/main/docs/architecture) |
| Web UI (Plume, MVP) | [plume](https://github.com/Bardie-radio/plume) | [architecture](https://github.com/Bardie-radio/plume/tree/main/docs/architecture) *(WIP)* |
| Login+password (Bes, MVP) | [bes](https://github.com/Bardie-radio/bes) | [architecture](https://github.com/Bardie-radio/bes/tree/main/docs/architecture) *(WIP)* |
| YouTube / ytdl (Magpie, MVP) | [magpie](https://github.com/Bardie-radio/magpie) | [architecture](https://github.com/Bardie-radio/magpie/tree/main/docs/architecture) *(WIP)* |
| Discord (Beak) | [beak](https://github.com/Bardie-radio/beak) | [planned role](https://github.com/Bardie-radio/beak/blob/main/docs/architecture/01-planned-role.md) |
| Telegram (Cauda) | [cauda](https://github.com/Bardie-radio/cauda) | [planned role](https://github.com/Bardie-radio/cauda/blob/main/docs/architecture/01-planned-role.md) |
| External stream (Starling) | [starling](https://github.com/Bardie-radio/starling) | [planned role](https://github.com/Bardie-radio/starling/blob/main/docs/architecture/01-planned-role.md) |
| Files (Catbird) | [catbird](https://github.com/Bardie-radio/catbird) | [planned role](https://github.com/Bardie-radio/catbird/blob/main/docs/architecture/01-planned-role.md) |
| OIDC (Argus, v0.2) | [argus](https://github.com/Bardie-radio/argus) | [planned role](https://github.com/Bardie-radio/argus/blob/main/docs/architecture/01-planned-role.md) |
| Passkeys (Hecate) | [hecate](https://github.com/Bardie-radio/hecate) | [planned role](https://github.com/Bardie-radio/hecate/blob/main/docs/architecture/01-planned-role.md) |

**Related:** [org hub](README.md) · [kithara architecture](https://github.com/Bardie-radio/kithara/tree/main/docs/architecture)

**Read next:** [03-component-landscape.md](03-component-landscape.md)
