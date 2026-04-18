from __future__ import annotations

from dataclasses import asdict
from typing import Callable, Iterable, List, Optional

from .models import WindowHints, WindowInfo


class WindowResolver:
    """Generic window resolver with cache + fallback support.

    Provider contracts:
    - active_provider() -> Optional[dict]
    - visible_provider() -> Iterable[dict]
    """

    def __init__(
        self,
        active_provider: Optional[Callable[[], Optional[dict]]] = None,
        visible_provider: Optional[Callable[[], Iterable[dict]]] = None,
    ) -> None:
        self.active_provider = active_provider or (lambda: None)
        self.visible_provider = visible_provider or (lambda: [])
        self._last_window: Optional[WindowInfo] = None

    def get_active_window(self) -> Optional[WindowInfo]:
        payload = self.active_provider()
        if not payload:
            return self.fallback_find_window()
        info = self._to_window_info(payload, source="active")
        self._last_window = info
        return info

    def find_window_by_hints(self, hints: WindowHints) -> Optional[WindowInfo]:
        candidates = [self._to_window_info(raw, source="visible") for raw in self.visible_provider()]
        for item in candidates:
            if self._match(item, hints):
                self._last_window = item
                return item
        return self.fallback_find_window(hints)

    def reuse_last_window(self) -> Optional[WindowInfo]:
        return self._last_window

    def fallback_find_window(self, hints: Optional[WindowHints] = None) -> Optional[WindowInfo]:
        # phase-1 fallback strategy: scan visible windows and return first match.
        # Designed to host future desktopCapturer/screen-source collectors.
        candidates: List[WindowInfo] = [
            self._to_window_info(raw, source="fallback") for raw in self.visible_provider()
        ]
        if hints:
            for item in candidates:
                if self._match(item, hints):
                    self._last_window = item
                    return item
        if candidates:
            self._last_window = candidates[0]
            return candidates[0]
        return self._last_window

    @staticmethod
    def _to_window_info(payload: dict, source: str) -> WindowInfo:
        return WindowInfo(
            id=str(payload.get("id")) if payload.get("id") is not None else None,
            app_name=payload.get("app_name") or payload.get("appName"),
            owner_name=payload.get("owner_name") or payload.get("ownerName"),
            title=payload.get("title") or "",
            bounds=payload.get("bounds") or {},
            source=source,
        )

    @staticmethod
    def _contains(target: Optional[str], needle: Optional[str], fuzzy: bool) -> bool:
        if not needle:
            return True
        if not target:
            return False
        if fuzzy:
            return needle.lower() in target.lower()
        return needle.lower() == target.lower()

    def _match(self, item: WindowInfo, hints: WindowHints) -> bool:
        return (
            self._contains(item.app_name, hints.app_name, hints.fuzzy)
            and self._contains(item.owner_name, hints.owner_name, hints.fuzzy)
            and self._contains(item.title, hints.title, hints.fuzzy)
        )

    def debug_state(self) -> dict:
        return {
            "last_window": asdict(self._last_window) if self._last_window else None,
        }
