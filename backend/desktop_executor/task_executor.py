from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from .action_executor import ActionExecutor
from .models import (
    ActionRequest,
    DesktopTask,
    StepResult,
    SUPPORTED_ACTIONS,
    TaskExecutionResult,
    WindowHints,
)
from .window_resolver import WindowResolver


class DesktopTaskExecutor:
    def __init__(self, window_resolver: WindowResolver, action_executor: ActionExecutor) -> None:
        self.window_resolver = window_resolver
        self.action_executor = action_executor

    def execute_task(self, task: DesktopTask) -> TaskExecutionResult:
        started_at = datetime.now(timezone.utc).isoformat()
        results: list[StepResult] = []
        current_window = self.window_resolver.get_active_window()

        task_error: Optional[str] = None
        for idx, step in enumerate(task.steps):
            step_action = step.get("action", "")
            screenshot = step.get("screenshot")
            if step_action == "focus_window":
                hints = WindowHints(
                    title=(step.get("hints") or [None])[0],
                    app_name=step.get("appName") or task.target_app,
                    owner_name=step.get("ownerName"),
                    fuzzy=True,
                )
                current_window = self.window_resolver.find_window_by_hints(hints)
                ok = current_window is not None
                err = None if ok else "window_not_found"
                results.append(
                    StepResult(
                        step_index=idx,
                        action=step_action,
                        success=ok,
                        window=current_window,
                        action_result=None,
                        error=err,
                        screenshot=screenshot,
                    )
                )
                if not ok:
                    task_error = err
                    break
                continue

            if step_action not in SUPPORTED_ACTIONS:
                task_error = f"unsupported_step_action:{step_action}"
                results.append(
                    StepResult(
                        step_index=idx,
                        action=step_action,
                        success=False,
                        window=current_window,
                        action_result=None,
                        error=task_error,
                        screenshot=screenshot,
                    )
                )
                break

            action_result = self.action_executor.execute_action(
                ActionRequest(
                    action=step_action,
                    text=step.get("text"),
                    hotkey=step.get("keys") or step.get("hotkey"),
                    x=step.get("x"),
                    y=step.get("y"),
                    delta_x=step.get("delta_x"),
                    delta_y=step.get("delta_y"),
                    clicks=step.get("clicks"),
                )
            )

            results.append(
                StepResult(
                    step_index=idx,
                    action=step_action,
                    success=action_result.success,
                    window=current_window,
                    action_result=action_result,
                    error=action_result.error,
                    screenshot=screenshot,
                )
            )

            if not action_result.success:
                task_error = action_result.error
                break

        success = task_error is None
        return TaskExecutionResult(
            task_type=task.task_type,
            target_app=task.target_app,
            success=success,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc).isoformat(),
            current_window=current_window,
            steps=results,
            error=task_error,
        )


def task_result_to_dict(result: TaskExecutionResult) -> Dict[str, Any]:
    payload = asdict(result)
    return payload
