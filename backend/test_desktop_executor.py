import unittest

from backend.desktop_executor.action_executor import ActionExecutor
from backend.desktop_executor.task_executor import DesktopTaskExecutor
from backend.desktop_executor.window_resolver import WindowResolver
from backend.desktop_executor.models import DesktopTask, WindowHints


class RecorderDriver:
    def __init__(self):
        self.calls = []

    def click(self, x, y, clicks=1):
        self.calls.append(("click", x, y, clicks))

    def type_text(self, text):
        self.calls.append(("type", text))

    def hotkey(self, keys):
        self.calls.append(("hotkey", tuple(keys)))

    def scroll(self, dx, dy):
        self.calls.append(("scroll", dx, dy))

    def move_mouse(self, x, y):
        self.calls.append(("move", x, y))

    def paste_text(self, text):
        self.calls.append(("paste", text))


class DesktopExecutorTest(unittest.TestCase):
    def test_window_resolver_match_and_cache(self):
        resolver = WindowResolver(
            active_provider=lambda: {"id": 1, "title": "Terminal", "appName": "iTerm"},
            visible_provider=lambda: [
                {"id": 2, "title": "Google Chrome - Search", "appName": "Google Chrome", "ownerName": "chrome"},
                {"id": 3, "title": "WeChat", "appName": "WeChat"},
            ],
        )

        active = resolver.get_active_window()
        self.assertEqual(active.title, "Terminal")

        found = resolver.find_window_by_hints(WindowHints(app_name="Chrome", title="Search"))
        self.assertEqual(found.app_name, "Google Chrome")
        self.assertEqual(resolver.reuse_last_window().id, found.id)

    def test_task_sequence_execute(self):
        driver = RecorderDriver()
        resolver = WindowResolver(
            active_provider=lambda: {"id": 10, "title": "Desktop", "appName": "System"},
            visible_provider=lambda: [{"id": 2, "title": "Google Chrome", "appName": "Google Chrome"}],
        )
        executor = DesktopTaskExecutor(resolver, ActionExecutor(driver=driver))
        task = DesktopTask(
            task_type="desktop_action_sequence",
            target_app="Chrome",
            steps=[
                {"action": "focus_window", "hints": ["Google Chrome"]},
                {"action": "click", "x": 100, "y": 200},
                {"action": "typeText", "text": "Sydney wine importer"},
            ],
        )
        result = executor.execute_task(task)
        self.assertTrue(result.success)
        self.assertEqual(len(result.steps), 3)
        self.assertEqual(driver.calls[0], ("click", 100, 200, 1))
        self.assertEqual(driver.calls[1], ("type", "Sydney wine importer"))


if __name__ == "__main__":
    unittest.main()
