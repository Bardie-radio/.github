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
  participant YT as YouTube Module

  DJ->>Plume: /player/friday-jazz
  Plume->>Kithara: POST /api/streams/id/play
  Kithara->>YT: start playback
  YT-->>Kithara: audio ready
  Kithara-->>Plume: now playing
```

## Login (MVP)

<!-- mermaid-source: profile/docs/architecture/diagrams/journey-login.mmd -->
```mermaid
sequenceDiagram
  participant User
  participant Client
  participant Kithara
  participant Provider as Auth_provider

  User->>Client: Open UI or API client
  Client->>Kithara: GET /api/auth/discovery
  Kithara-->>Client: providers form_schema or redirect
  Client->>User: Render form or redirect to IdP
  User->>Client: Submit credentials or return from IdP
  Client->>Kithara: POST /api/auth/authenticate or OIDC callback
  Kithara->>Provider: Authenticate or ExchangeOidcCode
  Provider-->>Kithara: subject + claims
  Kithara-->>Client: JWT + refresh
```

Identity proof may use the built-in local provider or (v0.2+) an OIDC adapter. **Kithara always issues the JWT.** Deep dive: [kithara auth](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/auth.md).

Source diagrams: [diagrams/](diagrams/)

**Kithara journeys:** [domains/clients.md](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/clients.md) · [source sessions](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/source-instances.md) · [grpc-source-module](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/grpc-source-module.md)

**Related:** [uri-routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md) · [03-component-landscape](03-component-landscape.md)

**Read next:** [05-deployment.md](05-deployment.md)
