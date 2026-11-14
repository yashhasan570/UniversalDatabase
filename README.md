# Universal Database

Self-hosted Airtable alternative: turn any database into a smart spreadsheet with APIs, forms, and automations.

## Features

- Connect Postgres, MySQL, SQLite, and more, or use the built-in SQLite
- Spreadsheet-style grid, forms, kanban, gallery, and calendar views
- REST APIs and webhooks for every table, auto-generated
- Automations, roles-based access control, and sharing
- Self-hosted, Docker or Node

## Install

- Docker: `docker compose -f docker-compose/2_Dockerfile/all-dbs.yml up`
- From source: `pnpm install && pnpm build && pnpm start` (monorepo with pnpm workspaces)
- Configuration is environment-based (see `.env.example` in `packages/universaldatabase`)

## Contact

Telegram: [@johnconstantine570](https://t.me/johnconstantine570)
