# Encompax-core Repo Scope

Audit date: 2026-03-20

## What Belongs In This Repo

- Encompax governance and control-plane functionality
- ERP and operational core services
- Supply-chain, warehouse, shipment intelligence, datasource, and admin workflows that serve the parent Encompax platform
- Integration connectors and orchestration that support Encompax-managed systems
- Deployment assets for `encompax.io`

## What Does Not Belong In This Repo

- Smiley-Zone-specific public arcade frontend logic
- social/gameplay mechanics that are unique to the subordinate SZA platform
- production configs for `smiley-zone-arcade.com` or `staging.smiley-zone-arcade.com`
- experimental public community features unless they are explicit Encompax governance/integration touchpoints

## Relationship To The Other Repo

- `Encompax-core` should act as the parent governance/control plane.
- `smiley-zone` should remain a separate subordinate platform.
- Integration between the two should happen through explicit APIs, auth contracts, shared governance rules, or deployment/documentation boundaries, not by mixing gameplay/social code into Encompax.

## Scope Findings From This Audit

- The current Encompax repo largely stays within ERP, shipment, inventory, and control-plane territory.
- No direct Smiley-Zone arcade/game/social subsystem was detected in the current checkout.
- One notable internal scope blend exists across branches: `shipment intelligence` and `control plane` concerns are both present here. That is acceptable if Encompax is intended to own operational intelligence, but it should be documented as an Encompax-managed module rather than an accidental sidecar.

## Intended Production Domain

- `encompax.io`

## Intended Staging Domain

- Not explicitly detected in the checked-out repo state

## Intended Primary Working Branch

- `stabilization-encompax-2026-03`

## Intended Release Branch Naming Convention

- Primary release branch: `release/encompax-prod`
- Optional pre-release branch: `release/encompax-staging`

## Scope Guardrails Going Forward

- Keep governance, control-plane, admin authority, integrations, and ERP modules in Encompax.
- Keep public arcade, player-facing experiments, and social mechanics in `smiley-zone`.
- Document any shared auth/governance contracts at integration boundaries instead of duplicating implementation between repos.
