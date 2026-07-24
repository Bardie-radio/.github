# Component Landscape

<!-- mermaid-source: profile/docs/architecture/diagrams/component-landscape.mmd -->
```mermaid
flowchart TB
  subgraph client [Client modules]
    Plume["Plume Web UI user-aware MVP"]
    Beak["Beak Discord static future"]
    Cauda["Cauda Telegram user-aware future"]
  end
  subgraph listen [Listen]
    Players[Legacy players]
  end
  subgraph backend [Kithara backend]
    KitharaBox[Kithara]
    src["Magpie Starling Catbird"]
    auth["Bes Argus Hecate"]
    KitharaBox --- src
    KitharaBox --- auth
  end
  subgraph observe [Observability]
    OTel[otel_collector external]
  end
  Plume --> KitharaBox
  Beak -.->|REST future| KitharaBox
  Cauda -.->|REST future| KitharaBox
  Players -->|ICY stream| KitharaBox
  backend --> OTel
  Plume --> OTel
  src --> OTel
  auth --> OTel
```

**Kithara** plus its source and auth modules form the backend. Client modules and players sit outside. Internals (Neck, Stream Server, Auth Harness) stay in the kithara deep dive. There is **no built-in auth** — Bes/Argus/Hecate are separate containers.

## Components

| Type | Components | MVP |
|------|------------|-----|
| Core | Kithara (users, JWT verify, streams) | Yes |
| Client module | Plume (user-aware), Cauda (user-aware), Beak (static) | Plume optional but primary UI; bots future |
| Source module | Magpie, Starling, Catbird | Yes (Magpie); Future (others) |
| Auth adapter | Bes, Argus, Hecate | Yes (Bes); Argus v0.2; Hecate future |
| Listener | Legacy players (ICY) | N/A |

**Client modules** share Kithara's REST API. **User-aware** clients carry end-user JWTs; **static** Beak uses a join secret for admin and per-guild managed-user credentials for day-to-day control — not ICY paste targets like VLC.

No Icecast in MVP — Kithara serves ICY directly. OTel collector is **external**.

**Kithara detail:** [Internal structure](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/overview/02-internal-structure.md) · [Client modules](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/clients.md)

**Related:** [uri-routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md) · [02-ecosystem-context](02-ecosystem-context.md)

**Read next:** [04-user-journeys.md](04-user-journeys.md)
