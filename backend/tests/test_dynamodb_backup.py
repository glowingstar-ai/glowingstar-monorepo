from __future__ import annotations

import base64
from datetime import UTC, datetime
from decimal import Decimal

from boto3.dynamodb.types import Binary

from app.services.dynamodb_backup import _json_default, configured_table_names
from app.core.config import Settings


def test_configured_table_names_dedupes_and_ignores_empty_values() -> None:
    settings = Settings(
        AWS_SAINTPAUL_SESSIONS_TABLE="sessions",
        AWS_SAINTPAUL_EVENTS_TABLE="events",
        AWS_SAINTPAUL_ERRORS_TABLE="events",
    )

    assert configured_table_names(settings) == ["sessions", "events"]


def test_json_default_serializes_backup_values() -> None:
    now = datetime(2026, 5, 7, tzinfo=UTC)

    assert _json_default(now) == "2026-05-07T00:00:00+00:00"
    assert _json_default(Decimal("12.34")) == "12.34"
    assert _json_default(Binary(b"abc")) == {
        "__binary__": base64.b64encode(b"abc").decode("ascii")
    }
