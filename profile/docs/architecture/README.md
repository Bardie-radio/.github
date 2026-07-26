# Bardie Architecture (Org Overview)

<!-- mermaid-source: profile/docs/architecture/diagrams/overview.mmd -->
```mermaid
flowchart TB
  subgraph bardie [Bardie Ecosystem]
    Kithara[Kithara]
    Plume[Plume UI]
    SrcMod[Source Modules]
    AuthMod[Auth adapters]
  end
  subgraph external [External]
    Players[Network capable player]
    IdP["OIDC IdP v0.2"]
    OTel[otel_collector]
  end
  Plume --> Kithara
  SrcMod -->|gRPC| Kithara
  AuthMod -->|gRPC| Kithara
  Players -->|/stream/slug| Kithara
  AuthMod -.->|Argus OIDC| IdP
  bardie -.->|OTLP| OTel
```

5–10 minute orientation for the Bardie ecosystem. Every page opens with a diagram.

**Deep dive:** [kithara/docs/architecture](https://github.com/Bardie-radio/kithara/tree/main/docs/architecture)

## Pages

| # | Page | Time |
|---|------|------|
| 1 | [Vision and goals](01-vision-and-goals.md) | 2 min |
| 2 | [Ecosystem context](02-ecosystem-context.md) | 2 min |
| 3 | [Component landscape](03-component-landscape.md) | 3 min |
| 4 | [User journeys](04-user-journeys.md) | 3 min |
| 5 | [Deployment](05-deployment.md) | 3 min — whole-stack process; per-container detail in each repo |
| 6 | [Client modules](06-client-modules.md) | 2 min — catalog only; contracts in kithara |


## Repositories

| Repo | Role |
|------|------|
| [kithara](https://github.com/Bardie-radio/kithara) | Core backend |
| [plume](https://github.com/Bardie-radio/plume) | Web UI (Plume) |
| [bes](https://github.com/Bardie-radio/bes) | Login+password auth (Bes, MVP) — WIP |
| [magpie](https://github.com/Bardie-radio/magpie) | YouTube / ytdl source (Magpie, MVP) — WIP |
| [beak](https://github.com/Bardie-radio/beak) | Discord bot (Beak) — planned |
| [cauda](https://github.com/Bardie-radio/cauda) | Telegram bot (Cauda) — planned |
| [starling](https://github.com/Bardie-radio/starling) | External stream source (Starling) — planned |
| [catbird](https://github.com/Bardie-radio/catbird) | File source (Catbird) — planned |
| [argus](https://github.com/Bardie-radio/argus) | OIDC auth (Argus, v0.2) — planned |
| [hecate](https://github.com/Bardie-radio/hecate) | Passkeys auth (Hecate) — planned |

**Read next:** [01-vision-and-goals.md](01-vision-and-goals.md)
