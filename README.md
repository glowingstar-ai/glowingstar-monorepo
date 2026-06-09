# GlowingStar
<img width="1728" height="1077" alt="Screenshot 2025-09-29 at 1 45 45 AM" src="https://github.com/user-attachments/assets/7af01dba-a9b3-42df-a68e-89fdc9b549b6" />


A batteries-included monorepo that pairs a modern Next.js frontend with a FastAPI backend. The structure is optimized for teams collaborating on product features and services simultaneously.

## Repository layout

```
.
├── frontend/      # Next.js 14 + Tailwind CSS + shadcn/ui-inspired components
├── backend/       # FastAPI service with modular routers and typed schemas
├── .gitignore
└── README.md
```

## Getting started

### Frontend

```bash
cd frontend
pnpm install  # or npm install / yarn install
pnpm dev
```

Visit `http://localhost:3000` to view the application. The starter ships with Tailwind CSS, Radix Themes, and Framer Motion ready to use.

### Backend

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` for interactive OpenAPI documentation.

## Development conventions

- **Code quality** — ESLint, TypeScript, Prettier, Ruff, and Black keep contributions consistent.
- **Isolation** — Frontend and backend live in separate workspaces so teams can deploy independently.
- **Shared patterns** — Components, schemas, and services are organized to encourage reuse and clear boundaries.

## Next steps

- Connect the frontend to backend APIs using `@tanstack/react-query`.
- Add CI workflows for linting, testing, and type checking.
- Configure deployment infrastructure (e.g., Vercel for frontend, Fly.io/Render for backend).

## Research data exports

The Saint Paul AI-tutor study data (DynamoDB tables + S3 image assets) has been exported
locally for analysis. It is **not** committed to this repo — it is ≈800 MB and contains
sensitive student session content (chat, quiz responses, generated images).

- **Local export path:** `~/glowingstar-saintpaul-export/20260609T132143Z/` — DynamoDB JSONL
  backup (`dynamodb/`), S3 assets (`s3/`), answer key (`answer_key/all_quizzes.json`),
  analysis scripts (`analyze_*.py`), result tables (`out_*.csv`), and `FINDINGS.md`.
- **Re-export from AWS:** `backend/scripts/export_dynamodb_backup.py`
  (`AWS_PROFILE=glowingstar`, region `us-east-2`).
- **Findings & publication-venue analysis:**
  `agent-decisions/saintpaul-ai-tutor-research-findings.md`.
