# Bardie Architecture (Org Overview)

```mermaid
flowchart TB
  subgraph bardie [Bardie Ecosystem]
    Kithara[Kithara Core]
    Plume[Plume UI]
    SrcMod[Source Modules]
    AuthMod[Auth Adapters]
  end
  subgraph external [External]
    Players[VLC VRChat Players]
    IdP[OIDC IdP v0.2]
    Grafana[Grafana Stack]
  end
  Plume --> Kithara
  SrcMod -->|gRPC| Kithara
  AuthMod -->|gRPC| Kithara
  Players -->|/stream/slug| Kithara
  Plume -.-> IdP
  bardie --> Grafana
```

5–10 minute orientation for the Bardie ecosystem. Every page opens with a diagram.

**Deep dive:** [bardie-kithara/docs/architecture](https://github.com/Bardie-radio/bardie-kithara/tree/main/docs/architecture)

## Pages

| # | Page | Time |
|---|------|------|
| 1 | [Vision and goals](01-vision-and-goals.md) | 2 min |
| 2 | [Ecosystem context](02-ecosystem-context.md) | 2 min |
| 3 | [Component landscape](03-component-landscape.md) | 3 min |
| 4 | [User journeys](04-user-journeys.md) | 3 min |

## Diagrams

- [ecosystem-context.mmd](diagrams/ecosystem-context.mmd)
- [deployment-compose.mmd](diagrams/deployment-compose.mmd)
- [journey-listen.mmd](diagrams/journey-listen.mmd)

## Repositories

| Repo | Role |
|------|------|
| [bardie-kithara](https://github.com/Bardie-radio/bardie-kithara) | Core backend |
| [bardie-plume](https://github.com/Bardie-radio/bardie-plume) | Web UI |
| [bardie-auth-local](https://github.com/Bardie-radio) | Login+password adapter (MVP) |

**Read next:** [01-vision-and-goals.md](01-vision-and-goals.md)
