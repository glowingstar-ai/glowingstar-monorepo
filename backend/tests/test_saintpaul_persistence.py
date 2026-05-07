from __future__ import annotations

from typing import Any

from app.services.saintpaul_persistence import SaintPaulPersistenceService


class _PaginatedScanTable:
    def __init__(self, pages: list[dict[str, Any]]) -> None:
        self._pages = pages
        self._page_index = 0

    def scan(self, **_: Any) -> dict[str, Any]:
        page = self._pages[self._page_index]
        self._page_index += 1
        return page

    def query(self, **_: Any) -> dict[str, Any]:
        return {"Items": []}


class _EmptyQueryTable:
    def query(self, **_: Any) -> dict[str, Any]:
        return {"Items": []}


class _StaticScanTable:
    def __init__(self, items: list[dict[str, Any]]) -> None:
        self._items = items
        self.scan_count = 0

    def scan(self, **_: Any) -> dict[str, Any]:
        self.scan_count += 1
        return {"Items": self._items}

    def query(self, **_: Any) -> dict[str, Any]:
        return {"Items": []}


def _make_research_service(sessions_table: Any) -> SaintPaulPersistenceService:
    service = SaintPaulPersistenceService.__new__(SaintPaulPersistenceService)
    service._enabled = True
    service._sessions_table = sessions_table
    service._events_table = _EmptyQueryTable()
    service._errors_table = _EmptyQueryTable()
    return service


def test_research_overview_applies_limit_after_sorting_recent_sessions() -> None:
    service = _make_research_service(
        _PaginatedScanTable(
            [
                {
                    "Items": [
                        {
                            "session_id": "old-session",
                            "item_key": "SESSION#META",
                            "student_id": "1111111",
                            "last_seen_at": "2026-05-01T12:00:00+00:00",
                        }
                    ],
                    "LastEvaluatedKey": {
                        "session_id": "old-session",
                        "item_key": "SESSION#META",
                    },
                },
                {
                    "Items": [
                        {
                            "session_id": "new-session",
                            "item_key": "SESSION#META",
                            "student_id": "2222222",
                            "last_seen_at": "2026-05-07T12:00:00+00:00",
                        }
                    ],
                },
            ]
        )
    )

    overview = service.get_research_overview(limit=1)

    assert overview["session_count"] == 1
    assert overview["students"][0]["student_id"] == "2222222"
    assert overview["students"][0]["sessions"][0]["session_id"] == "new-session"


def test_research_overview_uses_cache_until_forced_refresh() -> None:
    sessions_table = _StaticScanTable(
        [
            {
                "session_id": "cached-session",
                "item_key": "SESSION#META",
                "student_id": "3333333",
                "last_seen_at": "2026-05-07T12:00:00+00:00",
            }
        ]
    )
    service = _make_research_service(sessions_table)

    first_overview = service.get_research_overview()
    second_overview = service.get_research_overview()
    refreshed_overview = service.get_research_overview(force_refresh=True)

    assert first_overview == second_overview
    assert refreshed_overview["students"][0]["student_id"] == "3333333"
    assert sessions_table.scan_count == 2
