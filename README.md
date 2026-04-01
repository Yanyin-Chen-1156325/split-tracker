# Split Tracker

A modern expense splitting app for groups — track shared expenses and calculate who owes whom with minimal transactions.

## Features

- Create multiple groups with custom members
- Add expenses with a built-in calculator (supports +, -, *, /)
- Automatically split expenses between selected members
- Real-time settlement calculation (minimum transactions algorithm)
- Mark expenses as settled
- Dark/light mode
- Mobile responsive

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Container | Docker |
| CI/CD | GitHub Actions |

## Settlement Algorithm

Uses a greedy minimum-transactions algorithm:
1. Calculate each member's net balance (paid - owed)
2. Match creditors with debtors to minimise number of transfers
3. Result: minimum transactions to settle all debts

## DevOps

This project demonstrates a complete DevOps lifecycle:

- **Containerisation** — Docker multi-stage build
- **CI/CD** — GitHub Actions (coming soon)
- **Orchestration** — Kubernetes with k3s + Rancher (coming soon)
- **IaC** — OpenTofu for Azure infrastructure (coming soon)
- **Monitoring** — Prometheus + Grafana (coming soon)
- **Logging** — ELK Stack (coming soon)