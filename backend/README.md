# Backend service

This directory houses the FastAPI application for the GPT5 Hackathon monorepo. It is structured to scale with feature teams and encourages modular, testable code.

# how to run

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
poetry install
uvicorn app.main:app --reload
```

## Project layout

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── dependencies.py
│   │   └── routes.py
│   ├── core/
│   │   └── config.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── health.py
│   ├── services/
│   │   └── __init__.py
│   └── main.py
├── tests/
│   └── test_health.py
├── pyproject.toml
└── README.md
```

Each layer has a clear responsibility:

- **core** — application-wide configuration.
- **api** — routers, dependencies, and view logic.
- **schemas** — Pydantic models for request/response validation.
- **services** — business logic that can be shared across routers.
- **tests** — pytest-based integration/unit tests.

## DynamoDB backup

Before running a migration, you can export the configured DynamoDB tables to local files:

```bash
cd backend
AWS_PROFILE=glowingstar poetry run python scripts/export_dynamodb_backup.py
```

By default this reads `backend/.env`, exports the configured `AWS_SAINTPAUL_*_TABLE` tables, and writes a timestamped backup under `backend/backups/dynamodb/`.
