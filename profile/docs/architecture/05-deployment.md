# Deployment

<!-- mermaid-source: diagrams/deployment-compose.mmd -->
```mermaid
flowchart TB
  subgraph edge [Edge]
    P[Reverse Proxy]
  end
  subgraph apps [App stack MVP]
    Plume[bardie_plume]
    Kithara[bardie_kithara]
    YT[bardie_youtube]
    Auth["auth adapter (MVP)"]
  end
  subgraph observe [Observability]
    OTel[otel-collector]
  end
  Internet --> P
  P --> Plume
  P --> Kithara
  Kithara --> YT
  Kithara --> Auth
  Plume --> OTel
  Kithara --> OTel
  YT --> OTel
  Auth --> OTel
```

MVP targets a self-hosted app stack behind an **edge reverse proxy**. Listeners and DJs hit one hostname; streams are path-routed, not port-per-stream. Bardie does **not** require a specific proxy product — only TLS termination and the path rules in [URI routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md).

Image and Compose **service names** use the `bardie_*` prefix once chosen. Module and repo names for the MVP auth and YouTube containers are **undecided** — diagram labels are roles, not final names. Short DNS aliases may differ from image names — document both when they differ.

## Deployment modes

| Mode | When | Edge |
|------|------|------|
| **Bundled edge** | Quick start / demo Compose | Thin reverse proxy included in the Compose file; only `:443` (or `:80`) published |
| **External edge** | Homelab / existing infra | You already run a reverse proxy (or load balancer); Compose publishes app ports only on the internal network / localhost; you point your edge at them |

Both modes use the same path map. Example configuration snippets for popular reverse proxies will ship with the reference Compose bundle — pick what you already know.

## App services

| Service | Role | Published (bundled edge) |
|---------|------|--------------------------|
| edge proxy | TLS + path routing | `:443` |
| `bardie_plume` | Web UI / Plume (client module) | internal |
| `bardie_kithara` | Core API + ICY stream server | internal |
| YouTube source *(name TBD)* | Source module (MVP) | internal |
| Auth adapter *(name TBD)* | Login+password adapter (MVP) | internal |
| `otel_collector` | Telemetry (optional) | internal |

**4 app containers** + edge (bundled or external) + optional collector.

## Routing idea

- Control plane and UI: Plume / Kithara REST behind the edge
- Audio: `GET /stream/{slug}` → Kithara stream server (ICY)
- No Icecast in MVP — Kithara serves the feed directly

**Deep dive:** [kithara operations/deployment](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/operations/deployment.md) · [uri-routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md)

**Related:** [observability naming](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/operations/observability.md) · [04-user-journeys](04-user-journeys.md)

**Read next:** [README.md](README.md)
