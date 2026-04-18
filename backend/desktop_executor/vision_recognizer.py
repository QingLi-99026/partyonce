from __future__ import annotations

from typing import Dict, Any


class VisionRecognizer:
    """Phase-1 generic area recognizer.

    Keeps existing layout measurement capability while exposing a generic interface:
    - content_area
    - input_area
    - clickable_areas
    - header_area
    """

    def detect_regions(self, screenshot_meta: Dict[str, Any]) -> Dict[str, Any]:
        width = int(screenshot_meta.get("width", 0) or 0)
        height = int(screenshot_meta.get("height", 0) or 0)
        if width <= 0 or height <= 0:
            return {
                "content_area": None,
                "input_area": None,
                "clickable_areas": [],
                "header_area": None,
            }

        header_h = max(40, int(height * 0.08))
        input_h = max(56, int(height * 0.12))
        content_h = height - header_h - input_h

        header_area = {"x": 0, "y": 0, "width": width, "height": header_h}
        content_area = {"x": 0, "y": header_h, "width": width, "height": max(0, content_h)}
        input_area = {"x": 0, "y": height - input_h, "width": width, "height": input_h}

        clickable_areas = [
            {"name": "primary_content", **content_area},
            {"name": "input_candidate", **input_area},
            {"name": "title_nav", **header_area},
        ]

        return {
            "content_area": content_area,
            "input_area": input_area,
            "clickable_areas": clickable_areas,
            "header_area": header_area,
        }
