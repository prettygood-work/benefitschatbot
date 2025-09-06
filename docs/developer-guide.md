# Developer Guide

This guide helps engineers set up, develop, test, and operate the Benefits Assistant Chatbot locally and in CI.

Contents
- Overview
- Prerequisites
- Repository setup
- Environment configuration
- Running locally
- Database and data seeding
- Testing (unit, integration, e2e)
- Linting, formatting, and type checks
- Useful scripts
- Common tasks
- Troubleshooting

---

## Overview

The application is a multi-tenant Next.js app using:
- Firebase Auth, Firestore, and Storage
- Cloud Functions (Node.js 20) for server-side and background work
- Vertex AI (and optional fallbacks) for LLM orchestration
- A company-scoped knowledge base for retrieval-augmented answers
- Admin and Super Admin portals for content and analytics

See README.md → Project Snapshot and System Architecture for high-level context.

---

## Prerequisites

- Node.js 20.x
- pnpm 9.x (preferred) or npm
- Firebase CLI (login with your Google account):
  - npm i -g firebase-tools
  - firebase login
- Git and a GitHub account for PRs
- Optional:
  - Java 11+ (for emulators if required)
  - Docker (for isolated local envs)

---

## Repository setup

```bash
git clone https://github.com/prettygood-work/benefitschatbot.git
cd benefitschatbot
pnpm install
```

If you use npm:
```bash
npm install
```

---

## Environment configuration

Create a .env.local in the project root with Firebase client config and optional monitoring:

Required (client)
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Optional (server/ops)
- SENTRY_DSN
- POSTHOG_API_KEY
- CRON_SECRET

Example:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=example.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=example
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=example.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

SENTRY_DSN=
POSTHOG_API_KEY=
CRON_SECRET=local-dev-cron-secret
```

Note
- Client config keys are not secrets but still treat files with care.
- For production, use CI secrets and do not commit env files.

---

## Running locally

Start the Next.js dev server:
```bash
pnpm dev
```

Run Firebase emulators (if applicable to your workflow):
```bash
firebase emulators:start
```

The app typically runs at http://localhost:3000. Emulators at:
- Auth: 9099
- Firestore: 8080
- Storage: 9199

See firebase.json for emulator ports and hosting rewrites.

---

## Database and data seeding

Seed demo data to accelerate local testing:
```bash
pnpm ts-node scripts/seed-benefits-data.ts
```

This script creates:
- A demo company and employees
- Sample benefits documents (metadata)
- FAQs (with categories)
- Basic analytics document

Related services:
- lib/firebase.ts and lib/firebase-dev.ts for client SDK
- functions/src/firebase-admin.ts and lib/firebase/admin-sdk.ts for Admin SDK

---

## Testing

Unit and integration (Vitest):
```bash
pnpm test
pnpm test:watch
```

End-to-end (Playwright):
```bash
pnpm e2e
```

Recommendations:
- Add test fixtures for common Firestore collections (companies, users, documents).
- Prefer dependency-injected services for easier mocking:
  - lib/firebase/firestore-service.ts
  - lib/firebase/services/document.service.ts

---

## Linting, formatting, and type checks

```bash
pnpm lint
pnpm format
pnpm typecheck
```

The project uses TypeScript, and formatting/linting tooling may be Biome or ESLint/Prettier depending on configuration.

---

## Useful scripts

- scripts/setup-production.sh
  - Guided steps for environment, build checks, cron example, and security checklist
- scripts/deploy-production.sh
  - Builds Functions and deploys functions, hosting, rules, and indexes
- scripts/seed-benefits-data.ts
  - Seeds demo data (companies, docs, FAQs, analytics)

---

## Common tasks

Add a new API route:
- Place under app/api/<scope>/.../route.ts
- Secure with withAuth or requireSuperAdmin (see docs/auth-overview.md)
- Apply rate limiting where appropriate (lib/rate-limit/firestore-limiter.ts)

Add a new admin page:
- Place under app/admin/<feature>/page.tsx
- Use server components for data that should not leak to client
- Use SWR on the client for live updates where needed

Upload and process documents:
- UI: components/admin/document-upload*.tsx
- Service: lib/firebase/services/document.service.ts
- Ensure /api/cron/process-documents is implemented and protected with CRON_SECRET

---

## Troubleshooting

Auth not working locally:
- Confirm emulator ports
- Check that the client points to emulator or real project as intended

Firestore permission errors:
- Review Firestore rules (firestore.rules) and role headers added by middleware/docs
- Verify you are authenticated and have the right role

Build/type errors:
- Run pnpm typecheck and pnpm lint for specifics
- Ensure env vars exist for client and server code paths

Deployment errors:
- Run scripts/setup-production.sh locally (build, type, and output checks)
- Ensure Firebase project is selected (firebase use)
- Confirm credentials/permissions for your Google account