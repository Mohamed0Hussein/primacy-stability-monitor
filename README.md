# Primacy Stability Monitor

A Windows desktop application for managing pharmaceutical stability testing programs. Lab staff register a drug product batch — dosage form, strength, pack type, and ICH storage conditions (accelerated / long-term at 5°C, 25°C, 30°C, 40°C) — and the app automatically generates the schedule of future withdrawal/test dates. Technicians later record test results against defined specifications, with automatic pass/out-of-limits validation.

Built with React, TypeScript, and Electron, backed by a companion [Express/MongoDB API](https://github.com/Mohamed0Hussein/primacy-backend).

## Features

- **Product registration** — a guided, multi-step form (Basic Info → Batch → Dates → Tests/Specifications) that supports registering 1–4 batches of the same product in one pass, each with its own manufacturing/stability/expiry dates.
- **Automatic test scheduling** — selecting accelerated and/or long-term storage conditions generates the full withdrawal schedule (1/3/6 months accelerated; 3/6/9/12/18/24/36 months long-term).
- **Specifications** — numerical (with min/max limits and a unit, including a custom "Other" unit) or qualitative (with a specification reference such as USP/EP/Eur.ph/in-house) tests can be attached to a product, and more can be added later from the Products page without re-entering the whole record.
- **Dashboard** — every registered batch sorted by soonest upcoming test, color-coded by urgency (overdue / due soon / on track).
- **Products page** — browse all inserted products by name and unique database ID; a detail modal shows the full record and lets you append additional specifications in place.
- **Test result entry** — enter results against a product's specifications; numerical results are validated against their range in real time, non-numerical results are chosen from a fixed set of outcomes (Confirm / Complies / Positive / Not Confirm / Not Complies / Not Positive / Other, with free text for "Other").
- **Authentication** — email/password sign-in and sign-up, backed by Firebase Auth for identity and the backend's own JWT for API authorization. Registration self-heals accounts left in an inconsistent state by a prior failed signup (Firebase account created but no matching backend record) instead of blocking the user permanently.
- **Auto-update** — on launch, the packaged app checks GitHub Releases for a newer version, prompts before downloading, and prompts again before restarting to install.
- **Light/dark theme**, toast notifications, and a component library shared across all views.

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript, Tailwind CSS 4, React Router 7 (`HashRouter`, required for Electron's `file://` loading) |
| Data | TanStack Query 5, Axios |
| Desktop shell | Electron 33, electron-builder (NSIS installer), electron-updater |
| Auth | Firebase Authentication (identity) + backend-issued JWT (API authorization) |
| Backend | Node.js, Express, MongoDB/Mongoose ([separate repo](https://github.com/Mohamed0Hussein/primacy-backend)) |

## Getting started

### Prerequisites

- Node.js 18+
- A Firebase project with Email/Password authentication enabled
- Access to the [backend API](https://github.com/Mohamed0Hussein/primacy-backend) (the app talks to a deployed instance by default — see `src/utils/axios.ts`)

### Setup

```bash
npm install
```

Create a `.env` file in the project root with your Firebase web app config:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Running in development

```bash
npm run dev        # Vite dev server at http://localhost:5173
npm run electron   # in a second terminal, launches the Electron shell pointed at the dev server
```

### Building

```bash
npm run build   # type-check + production web build (dist/)
npm run dist    # build + package a Windows installer (release/), no publish
npm run release # build + package + publish a new GitHub release
```

`npm run release` requires a `GH_TOKEN` environment variable with write access to this repository (used by electron-builder to create the release and upload the installer, blockmap, and `latest.yml` — the last of which is what lets installed copies of the app detect the update).

## Project structure

```
src/
  views/            Route-level screens (Dashboard, Login, InsertNewProduct, Products, TestDetails)
  components/
    common/          Shared UI primitives (Button, Input, Card, Modal, Pick, Toast, ...)
    specifications/  Shared specification add-form/list, used by both InsertNewProduct and Products
    auth/            Route protection
  contexts/          Theme, auth, and toast providers
  hooks/             useTheme, useAuth, useToast
  utils/             Axios instance, auth helpers, API calls
  constants/         Route paths, query keys, stability conditions, specification options
  electron-start.js  Electron main process (window creation, auto-update wiring)
  preload.js         contextBridge API exposed to the renderer
```

## Releasing a new version

1. Bump `version` in `package.json`.
2. Commit, tag (`git tag vX.Y.Z`), and push both (`git push origin main --tags`) — the tag must exist on GitHub *before* publishing, or release creation fails.
3. Run `npm run release` with `GH_TOKEN` set.

Every installed copy checks for updates on launch and prompts the user before downloading or installing — no separate distribution step is needed beyond publishing the release.
