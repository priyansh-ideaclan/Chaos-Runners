# Chaos Runners: Extreme Physics Party Platformer

Welcome to **Chaos Runners**, an original 3D physics-driven multiplayer party game built from scratch using React, TypeScript, React Three Fiber, Rapier Physics, and Colyseus.

This project is a monorepo containing the frontend client and backend server.

---

## 📂 Project Architecture

```
Chaos Runners/
├── package.json               # Root monorepo workspace configurations
├── shared/                    # Shared TypeScript types & interfaces
├── server/                    # Express + Node.js + Colyseus server
└── client/                    # Vite + React + Three.js + R3F + Rapier client
```

* **Client**: React 18 frontend leveraging React Three Fiber (R3F) for WebGL rendering, `@react-three/drei` for helpers, `@react-three/rapier` for rigid body calculations, and `zustand` for high-performance reactive state management.
* **Server**: Node.js server powered by Colyseus for fast, state-syncing authoritative multiplayer lobbies and client prediction.
* **Shared**: TypeScript contracts and schemas shared by both clients and servers to guarantee typesafety.

---

## 🚦 Development Setup

### Prerequisites
* **Node.js**: v18.0.0+ (Tested on v22.16.0)
* **npm**: v9.0.0+ (Tested on v10.9.2)

### Installation
From the root directory, run:
```bash
npm install
```

### Run Client
To start the React client in developer live-reload mode:
```bash
npm run client:dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Server
To start the developer server:
```bash
npm run server:dev
```

### Run Tests
To run unit and integration tests:
```bash
npm run client:test
```

---

## 🎯 Development Roadmap & Milestones

* **Milestone 1 — Core Prototype** (Completed)
  * Third-person character, movement, jump, dive, grab.
  * Third-person camera controls relative to direction.
  * Rapier Physics setup & customized capsule collider parameters.
  * Obstacle Course level (revolving sweepers, moving decks, jump pads, checkpoint sectors, slippery ramps).
  * Checkpoint respawn, timer, win condition triggers.
  * Customizations panel & responsive glassmorphism HUD overlays.
* **Milestone 2 — Multiplayer** (Next)
  * Colyseus room creation, lobby matchmaking, client-prediction synchronization.
* **Milestone 3 — Gameplay Loop**
  * Countdown transitions, player qualification, eliminate, spectator mode.
* **Milestone 4 — Map Expansion**
  * Race, Survival, and Final original levels.
* **Milestone 5 — Polish**
  * Audio tracks, particles, lighting effects, performance checks.
* **Milestone 6 — Progression**
  * Persistence, Coins, Crowns, stats profiles, cosmetics.
