from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import Settings
from app.services.dynamodb_backup import configured_table_names, default_backup_dir, export_tables


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export configured DynamoDB tables to local JSONL backup files."
    )
    parser.add_argument(
        "--table",
        action="append",
        dest="tables",
        help="Specific DynamoDB table name to export. Repeat to export multiple tables.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Directory to write the backup into. Defaults to backend/backups/dynamodb/<timestamp>/.",
    )
    parser.add_argument(
        "--consistent-read",
        action="store_true",
        help="Use strongly consistent reads during scan.",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=None,
        help="Optional scan Limit per request.",
    )
    return parser.parse_args()


def main() -> int:
    load_dotenv(BACKEND_DIR / ".env")
    args = parse_args()
    settings = Settings()

    table_names = args.tables or configured_table_names(settings)
    if not table_names:
        print(
            "No tables were provided and no AWS_SAINTPAUL_*_TABLE variables are configured.",
            file=sys.stderr,
        )
        return 1

    output_dir = args.output_dir or default_backup_dir(BACKEND_DIR)
    manifest_path = export_tables(
        settings=settings,
        output_dir=output_dir,
        table_names=table_names,
        consistent_read=args.consistent_read,
        page_size=args.page_size,
    )

    print(f"Backup completed: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
