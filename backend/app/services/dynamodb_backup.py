from __future__ import annotations

import base64
import hashlib
import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

import boto3
from boto3.dynamodb.types import Binary

from app.core.config import Settings


@dataclass
class TableBackupResult:
    table_name: str
    item_count: int
    scanned_count: int
    items_file: str
    schema_file: str
    items_sha256: str
    schema_sha256: str


def configured_table_names(settings: Settings) -> list[str]:
    table_names = [
        settings.aws_saintpaul_sessions_table,
        settings.aws_saintpaul_events_table,
        settings.aws_saintpaul_errors_table,
    ]

    deduped: list[str] = []
    for table_name in table_names:
        if table_name and table_name not in deduped:
            deduped.append(table_name)
    return deduped


def build_session(settings: Settings) -> boto3.session.Session:
    session_kwargs: dict[str, str] = {}
    if settings.aws_region_name:
        session_kwargs["region_name"] = settings.aws_region_name
    if settings.aws_profile:
        session_kwargs["profile_name"] = settings.aws_profile
    elif settings.aws_access_key_id and settings.aws_secret_access_key:
        session_kwargs["aws_access_key_id"] = settings.aws_access_key_id
        session_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key

    return boto3.session.Session(**session_kwargs)


def export_tables(
    *,
    settings: Settings,
    output_dir: Path,
    table_names: list[str],
    consistent_read: bool = False,
    page_size: int | None = None,
) -> Path:
    if not table_names:
        raise ValueError("No DynamoDB tables configured for backup.")

    output_dir.mkdir(parents=True, exist_ok=True)

    session = build_session(settings)
    client = session.client("dynamodb")

    manifest: dict[str, Any] = {
        "exported_at": datetime.now(UTC).isoformat(),
        "aws_profile": settings.aws_profile,
        "aws_region": session.region_name or settings.aws_region_name,
        "tables": [],
    }

    for table_name in table_names:
        result = export_table(
            client=client,
            output_dir=output_dir,
            table_name=table_name,
            consistent_read=consistent_read,
            page_size=page_size,
        )
        manifest["tables"].append(asdict(result))

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, sort_keys=True, default=_json_default) + "\n",
        encoding="utf-8",
    )
    return manifest_path


def export_table(
    *,
    client: Any,
    output_dir: Path,
    table_name: str,
    consistent_read: bool = False,
    page_size: int | None = None,
) -> TableBackupResult:
    safe_table_name = table_name.replace("/", "_")
    items_path = output_dir / f"{safe_table_name}.items.jsonl"
    schema_path = output_dir / f"{safe_table_name}.schema.json"

    table_description = client.describe_table(TableName=table_name)["Table"]
    schema_path.write_text(
        json.dumps(table_description, indent=2, sort_keys=True, default=_json_default) + "\n",
        encoding="utf-8",
    )

    scan_kwargs: dict[str, Any] = {"TableName": table_name}
    if consistent_read:
        scan_kwargs["ConsistentRead"] = True
    if page_size:
        scan_kwargs["Limit"] = page_size

    last_evaluated_key: dict[str, Any] | None = None
    item_count = 0
    scanned_count = 0

    with items_path.open("w", encoding="utf-8") as handle:
        while True:
            if last_evaluated_key:
                scan_kwargs["ExclusiveStartKey"] = last_evaluated_key
            elif "ExclusiveStartKey" in scan_kwargs:
                del scan_kwargs["ExclusiveStartKey"]

            response = client.scan(**scan_kwargs)
            scanned_count += response.get("ScannedCount", 0)

            for item in response.get("Items", []):
                handle.write(json.dumps(item, sort_keys=True, default=_json_default))
                handle.write("\n")
                item_count += 1

            last_evaluated_key = response.get("LastEvaluatedKey")
            if not last_evaluated_key:
                break

    return TableBackupResult(
        table_name=table_name,
        item_count=item_count,
        scanned_count=scanned_count,
        items_file=items_path.name,
        schema_file=schema_path.name,
        items_sha256=_sha256(items_path),
        schema_sha256=_sha256(schema_path),
    )


def default_backup_dir(base_dir: Path) -> Path:
    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    return base_dir / "backups" / "dynamodb" / timestamp


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _json_default(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, Binary):
        return {"__binary__": base64.b64encode(bytes(value.value)).decode("ascii")}
    if isinstance(value, (bytes, bytearray)):
        return {"__binary__": base64.b64encode(bytes(value)).decode("ascii")}
    if isinstance(value, set):
        return sorted(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")
