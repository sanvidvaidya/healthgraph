"""
Tests for UI Shell and Static Assets Delivery.
"""

import unittest
import asyncio
import os
from starlette.requests import Request
from healthgraph.app import serve_index, STATIC_DIR


class TestUIShell(unittest.TestCase):

    def test_serve_index(self):
        """Verify GET / serves index.html with valid HTML5 and accessibility links."""
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
            "query_string": b"",
        }
        async def receive():
            return {"type": "http.request", "body": b""}

        req = Request(scope, receive)
        res = asyncio.run(serve_index(req))
        self.assertEqual(res.status_code, 200)
        content = res.body.decode("utf-8")
        self.assertIn("HealthGraph", content)
        self.assertIn("Skip to main clinical content", content)

        # Distinguishes React SPA bundle vs legacy fallback
        if '<div id="root">' in content:
            self.assertIn("/assets/", content)
        else:
            self.assertIn("tokens.css", content)
            self.assertIn("layout.css", content)
            self.assertIn("components.css", content)
            self.assertIn("graph.js", content)
            self.assertIn("app.js", content)

    def test_serve_classic_index(self):
        """Verify GET /?view=classic serves the fallback classic HTML shell."""
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": [],
            "query_string": b"view=classic",
        }
        async def receive():
            return {"type": "http.request", "body": b""}

        req = Request(scope, receive)
        res = asyncio.run(serve_index(req))
        self.assertEqual(res.status_code, 200)
        content = res.body.decode("utf-8")
        self.assertIn("HealthGraph", content)
        self.assertIn("tokens.css", content)
        self.assertIn("layout.css", content)
        self.assertIn("components.css", content)
        self.assertIn("graph.js", content)
        self.assertIn("app.js", content)

    def test_static_assets_exist(self):
        """Verify all linked CSS and JS files exist on disk."""
        expected_files = [
            os.path.join(STATIC_DIR, "css", "tokens.css"),
            os.path.join(STATIC_DIR, "css", "layout.css"),
            os.path.join(STATIC_DIR, "css", "components.css"),
            os.path.join(STATIC_DIR, "js", "graph.js"),
            os.path.join(STATIC_DIR, "js", "app.js"),
        ]
        for fpath in expected_files:
            self.assertTrue(os.path.exists(fpath), f"Asset missing: {fpath}")
            self.assertGreater(os.path.getsize(fpath), 100, f"Asset empty: {fpath}")


if __name__ == "__main__":
    unittest.main()
