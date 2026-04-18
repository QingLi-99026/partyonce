from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class WindowHints:
    app_name: Optional[str] = None
    owner_name: Optional[str] = None
    title: Optional[str] = None
    fuzzy: bool = True


@dataclass
class WindowInfo:
    id: Optional[str]
    app_name: Optional[str]
    owner_name: Optional[str]
    title: str
    bounds: Dict[str, int] = field(default_factory=dict)
    source: str = "unknown"


@dataclass
class ActionRequest:
    action: str
    text: Optional[str] = None
    hotkey: Optional[List[str]] = None
    x: Optional[int] = None
    y: Optional[int] = None
    delta_x: Optional[int] = None
    delta_y: Optional[int] = None
    clicks: Optional[int] = None
    interval_ms: Optional[int] = None


@dataclass
class ActionResult:
    action: str
    success: bool
    started_at: str
    finished_at: str
    error: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StepResult:
    step_index: int
    action: str
    success: bool
    window: Optional[WindowInfo]
    action_result: Optional[ActionResult]
    error: Optional[str]
    screenshot: Optional[str]


@dataclass
class TaskExecutionResult:
    task_type: str
    target_app: Optional[str]
    success: bool
    started_at: str
    finished_at: str
    current_window: Optional[WindowInfo]
    steps: List[StepResult]
    error: Optional[str] = None


@dataclass
class DesktopTask:
    task_type: str
    target_app: Optional[str]
    steps: List[Dict[str, Any]]


SUPPORTED_ACTIONS = {
    "click",
    "doubleClick",
    "typeText",
    "hotkey",
    "scroll",
    "pasteText",
    "moveMouse",
}
