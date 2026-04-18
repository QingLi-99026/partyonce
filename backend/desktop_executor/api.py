from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .action_executor import ActionExecutor
from .task_executor import DesktopTaskExecutor, task_result_to_dict
from .window_resolver import WindowResolver
from .models import DesktopTask

router = APIRouter(prefix="/api/desktop", tags=["desktop-executor"])


class DesktopTaskRequest(BaseModel):
    task_type: str = Field(default="desktop_action_sequence")
    target_app: Optional[str] = None
    steps: List[Dict[str, Any]]


@router.post("/tasks/execute")
def execute_desktop_task(payload: DesktopTaskRequest) -> Dict[str, Any]:
    # phase-1 uses in-process defaults. providers/drivers can be swapped later.
    executor = DesktopTaskExecutor(
        window_resolver=WindowResolver(),
        action_executor=ActionExecutor(),
    )
    result = executor.execute_task(
        DesktopTask(
            task_type=payload.task_type,
            target_app=payload.target_app,
            steps=payload.steps,
        )
    )
    return task_result_to_dict(result)


@router.get("/health")
def desktop_executor_health() -> Dict[str, str]:
    return {"status": "ok", "module": "desktop-executor", "phase": "phase-1"}
