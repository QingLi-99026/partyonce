from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, Protocol

from .models import ActionRequest, ActionResult


class DesktopDriver(Protocol):
    def click(self, x: Optional[int], y: Optional[int], clicks: int = 1) -> None: ...
    def type_text(self, text: str) -> None: ...
    def hotkey(self, keys: list[str]) -> None: ...
    def scroll(self, dx: int, dy: int) -> None: ...
    def move_mouse(self, x: int, y: int) -> None: ...
    def paste_text(self, text: str) -> None: ...


class NoopDriver:
    def click(self, x: Optional[int], y: Optional[int], clicks: int = 1) -> None:
        return

    def type_text(self, text: str) -> None:
        return

    def hotkey(self, keys: list[str]) -> None:
        return

    def scroll(self, dx: int, dy: int) -> None:
        return

    def move_mouse(self, x: int, y: int) -> None:
        return

    def paste_text(self, text: str) -> None:
        return


class ActionExecutor:
    def __init__(self, driver: Optional[DesktopDriver] = None):
        self.driver = driver or NoopDriver()

    def execute_action(self, action: ActionRequest) -> ActionResult:
        started_at = datetime.now(timezone.utc).isoformat()
        try:
            if action.action == "click":
                self.driver.click(action.x, action.y, clicks=1)
            elif action.action == "doubleClick":
                self.driver.click(action.x, action.y, clicks=2)
            elif action.action == "typeText":
                self.driver.type_text(action.text or "")
            elif action.action == "hotkey":
                self.driver.hotkey(action.hotkey or [])
            elif action.action == "scroll":
                self.driver.scroll(action.delta_x or 0, action.delta_y or 0)
            elif action.action == "pasteText":
                self.driver.paste_text(action.text or "")
            elif action.action == "moveMouse":
                self.driver.move_mouse(action.x or 0, action.y or 0)
            else:
                raise ValueError(f"Unsupported action: {action.action}")

            return ActionResult(
                action=action.action,
                success=True,
                started_at=started_at,
                finished_at=datetime.now(timezone.utc).isoformat(),
                details={
                    "x": action.x,
                    "y": action.y,
                },
            )
        except Exception as exc:  # noqa: BLE001 - normalize failure reason for caller
            return ActionResult(
                action=action.action,
                success=False,
                started_at=started_at,
                finished_at=datetime.now(timezone.utc).isoformat(),
                error=str(exc),
            )
