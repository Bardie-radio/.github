# Component Landscape

```mermaid
flowchart TB
  subgraph client [Client layer]
    Plume[Plume]
    Players[Legacy Players]
  end
  subgraph core [Kithara]
    API[REST API]
    Neck[Neck]
    StreamSrv[Stream Server]
    AuthOrch[Auth Orchestrator]
  end
  subgraph modules [Modules]
    YT[YouTube]
    AuthLocal[auth-local]
  end
  subgraph observe [Observability]
    OTel[OTel]
  end
  Plume --> API
  Plume --> StreamSrv
  Players --> StreamSrv
  API --> Neck
  API --> AuthOrch
  Neck --> YT
  AuthOrch --> AuthLocal
  core --> OTel
  modules --> OTel
  Plume --> OTel
```

## Components

| Component | Type | MVP |
|-----------|------|-----|
| Kithara | Core monolith | Yes |
| Plume | Web UI | Yes |
| YouTube module | Source adapter | Yes |
| auth-local | Auth adapter | Yes |
| auth-oidc | Auth adapter | v0.2 |
| Discord bot | Client | Future |
| Icecast | Output relay | Community demand only |

No Icecast in MVP — Kithara serves ICY directly.

**Kithara detail:** [Container diagram](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/overview/02-container-diagram.md)

**Read next:** [04-user-journeys.md](04-user-journeys.md)
