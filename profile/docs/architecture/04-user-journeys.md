# User Journeys

## Listen (public stream)

<!-- mermaid-source: diagrams/journey-listen.mmd -->
```mermaid
sequenceDiagram
  participant Listener
  participant Player as VLC
  participant Kithara

  Listener->>Player: Open URL stream/lofi
  Player->>Kithara: GET /stream/lofi
  Kithara-->>Player: ICY audio + StreamTitle
```

## DJ: search and play

```mermaid
sequenceDiagram
  participant DJ
  participant Plume
  participant Kithara
  participant YT as YouTube Module

  DJ->>Plume: /player/friday-jazz
  Plume->>Kithara: POST /api/streams/id/play
  Kithara->>YT: CreateInstance
  YT-->>Kithara: socketPath
  Kithara-->>Plume: now playing
```

## Login (MVP)

```mermaid
sequenceDiagram
  participant User
  participant Plume
  participant Kithara
  participant Auth as auth-local

  User->>Plume: Open /
  Plume->>Kithara: GET /api/auth/discovery
  Kithara->>Plume: auth_providers.json
  Plume->>User: Auth selection and forms
  User->>Plume: Submit auth form
  Plume->>Auth: Authenticate
  Auth-->>Plume: token
```

Source diagrams: [diagrams/](diagrams/)

**Kithara journeys:** [domains/clients.md](https://github.com/Bardie-radio/bardie-kithara/blob/main/docs/architecture/domains/clients.md)

**Read next:** [README.md](README.md)
