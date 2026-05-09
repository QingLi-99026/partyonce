# PartyOnce Production API Config Blocker

Date: 2026-05-08  
Scope: production frontend API configuration  
Status: blocker until owner confirms stable production API endpoint

## Issue

The production frontend API configuration must not depend on a temporary local tunnel endpoint.

For Vite production builds, the production API value is baked into the generated frontend bundle. If that value points to a temporary tunnel, deployed clients can lose API access when the tunnel changes or stops.

## Boundary

- I did not read or print the current `.env.production` contents.
- I did not print any secret or full URL.
- I did not guess or replace the production API endpoint.
- I did not move any environment file.

## Required Owner Decision

Before a production deployment, the owner must confirm the stable production API base URL.

After confirmation:

- Keep the stable production API in production configuration.
- Move temporary tunnel testing to local or staging-only configuration, such as `.env.local` or a staging env file.
- Rebuild production only after the stable endpoint is confirmed.

## Current Recommendation

Treat production deployment as blocked until the stable API address is confirmed and production config is corrected by an authorized owner/operator.
