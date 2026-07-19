# User Journeys

How listeners, DJs, and login flow across clients, Kithara, and modules. Protocol detail lives in kithara docs. **Plume is optional** — any client module can drive the same Kithara APIs.

## Listen (public stream)

<!-- mermaid-source: profile/docs/architecture/diagrams/journey-listen.mmd -->
```mermaid
sequenceDiagram
  participant Listener
  participant Player as VLC
  participant Kithara as Kithara Stream Server

  Listener->>Player: Paste bardie.example/stream/lofi
  Player->>Kithara: GET /stream/lofi
  loop ICY stream
    Kithara-->>Player: audio + StreamTitle metadata
  end
```

## DJ: search and play

<!-- mermaid-source: profile/docs/architecture/diagrams/journey-dj-play.mmd -->
```mermaid
sequenceDiagram
  participant DJ
  participant Plume
  participant Kithara
  participant Magpie

  DJ->>Plume: /player/friday-jazz
  Plume->>Kithara: POST /api/streams/id/play
  Kithara->>Magpie: start playback
  Magpie-->>Kithara: audio ready
  Kithara-->>Plume: now playing
```

## Login (MVP)

<!-- mermaid-source: profile/docs/architecture/diagrams/journey-login.mmd -->
```mermaid
sequenceDiagram
  participant User
  participant Client
  participant Kithara
  participant Adapter as Auth_adapter

  User->>Client: Open UI or API client
  Client->>Kithara: GET /api/auth/discovery
  Kithara-->>Client: providers form_schema or redirect
  Client->>User: Render form or redirect to IdP
  User->>Client: Submit credentials or return from IdP
  Client->>Kithara: POST /api/auth/authenticate or /callback
  Kithara->>Adapter: Authenticate opaque payload
  Adapter-->>Kithara: allowed + roles + access JWT + refresh
  Kithara-->>Client: access JWT + refresh from module
```

Identity proof uses auth modules (**Bes**, later **Argus** / **Hecate**) behind Kithara. Modules **issue or forward JWTs** (and own refresh); **Kithara verifies** them via JWKS. Deep dive: [kithara auth](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/auth.md).

Source diagrams: [diagrams/](diagrams/)

**Kithara journeys:** [domains/clients.md](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/clients.md) · [source sessions](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/source-instances.md) · [grpc-source-module](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/grpc-source-module.md)

**Related:** [uri-routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md) · [03-component-landscape](03-component-landscape.md)

**Read next:** [05-deployment.md](05-deployment.md)
