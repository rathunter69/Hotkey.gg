# Hotkey.gg

Keyboard-first Excel practice: a spreadsheet simulator, structured drills, competition,
and player progression. The website is static HTML/CSS/JavaScript; Supabase provides
authentication, persistence, database functions and Edge Functions. Both Cloudflare Pages and
GitHub Pages report deployments; the public domain's active serving path is under review.

## Start here

- [Current state and next work](docs/CURRENT.md): implemented behavior, unfinished branches, and the active sequence.
- [Start an area task](docs/TASK_GUIDE.md): copyable starter, first turns, agent workflow and handoffs.
- [Twelve ready-to-paste prompts](docs/TASK_STARTERS.md): one starter for each dedicated task.
- [Product direction](docs/PRODUCT.md): shared decisions about audience, onboarding, gameplay and launch.
- [Transition review](docs/TRANSITION_REVIEW.md): code map, stale guidance, Supabase evidence and remaining review work.
- [Platform audit](docs/audit/README.md): coordinated findings, coverage and prioritized repairs.
- [Architecture and source ownership](docs/ARCHITECTURE.md): where each system lives and what is generated.
- [Development and validation](docs/DEVELOPMENT.md): setup, commands, checks and release boundaries.
- [Branch inventory](docs/BRANCH_INVENTORY.md): recorded remote branches and their relation to main.

These entry points supersede the queue/handoff instructions in
[historical PROJECT_CONTEXT.md](docs/history/PROJECT_CONTEXT.md),
`dev/CONTINUITY.md`, `dev/PIPELINE.md`, and `dev/WORKFLOW.md`. Those files retain historical
decisions and design rationale; their dated "LIVE" headings are not current deployment evidence.
The former root path remains as a compatibility page for existing links.

## Local development

Install Node.js 22 or later, including npm, then run from this directory:

```sh
npm ci
npm start
```

Open http://127.0.0.1:8791. No build step or credentials are needed to preview the guest UI.
Production-backed features require separate configuration and are not validated by a local preview.

```sh
npm run check
npm run browser:install
npm run test:smoke
```

Stop `npm start` before running browser suites; the test runner owns its server and refuses an
occupied port, so it cannot silently test another checkout. Static checks also work without npm:
`node dev/run-checks.js static`.

The tracked package and lockfile are development tooling only. They do not introduce a frontend
framework or change the static production entry point. See [development](docs/DEVELOPMENT.md)
before changing deployment configuration.
