# User Journeys

How listeners, DJs, and login flow across Plume, Kithara, and modules. Protocol detail and instance contracts live in kithara docs.

## Listen (public stream)

<!-- mermaid-source: diagrams/journey-listen.mmd -->
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

<!-- mermaid-source: diagrams/journey-dj-play.mmd -->
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

<!-- mermaid-source: diagrams/journey-login.mmd -->
```mermaid
sequenceDiagram
  participant User
  participant Plume
  participant Kithara
  participant Auth as Auth adapter MVP

  User->>Plume: Open /
  Plume->>Kithara: GET /api/auth/discovery
  Kithara->>Plume: auth_providers.json
  Plume->>User: Auth selection and forms
  User->>Plume: Submit auth form
  Plume->>Auth: Authenticate
  Auth-->>Plume: token
```

Source diagrams: [diagrams/](diagrams/)

**Kithara journeys:** [domains/clients.md](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/clients.md) · [source-instances](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/source-instances.md) · [grpc-source-module](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/grpc-source-module.md)

**Related:** [uri-routing](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/interfaces/uri-routing.md) · [03-component-landscape](03-component-landscape.md)

**Read next:** [05-deployment.md](05-deployment.md)
