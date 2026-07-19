# Vision and Goals

<!-- mermaid-source: profile/docs/architecture/diagrams/vision-and-goals.mmd -->
```mermaid
mindmap
  root((Bardie))
    Modular
      Source modules
      Auth adapters
      Client module
    Broadcast
      Everyone can control queue
      Everyone hears same feed
    Self-hosted
      Docker Compose
      Your music your rules
    Observable
      Full OTel coverage
```

## Vision

Bardie lets friends listen to music together **without** proprietary streaming services, manual sync rituals, or Discord screen-share compression.

## Goals

1. **Modular** — swap audio sources and auth providers via containers
2. **Broadcast** — radio-style shared experience per Struna (stream)
3. **Self-hosted** — you own the stack on your infrastructure
4. **Player-friendly** — ICY HTTP URLs for VLC, VRChat, browsers
5. **Observable** — every module emits OTLP; end-to-end traces
6. **Reusable modules** *(planned)* — same auth/source **orchestrator libraries** Kithara uses; outside: embed auth orch, or HTTP source orch / solo module ([07-modules-beyond-bardie](07-modules-beyond-bardie.md))

## Non-goals (MVP)

- Spotify-style per-user seek position
- Bundled Icecast
- Public anonymous DJ (no public control plane)

**Deep dive:** [kithara architecture docs](https://github.com/Bardie-radio/kithara/tree/main/docs/architecture)

**Related:** [05-deployment](05-deployment.md) · [07-modules-beyond-bardie](07-modules-beyond-bardie.md) · [glossary (kithara)](https://github.com/Bardie-radio/kithara/blob/main/docs/architecture/glossary.md)

**Read next:** [02-ecosystem-context.md](02-ecosystem-context.md)
