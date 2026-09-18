"""
Tests for UI Shell and Static Assets Delivery.
"""

import unittest
import asyncio
import os
from starlette.requests import Request
from healthgraph.app import serve_index, DIST_DIR


class TestUIShell(unittest.TestCase):

    def test_serve_index(self):
        """Verify GET / serves React SPA shell index.html."""
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
        if os.path.exists(os.path.join(DIST_DIR, "index.html")):
            self.assertIn('<div id="root">', content)
            self.assertIn("/assets/", content)

    def test_frontend_dist_assets(self):
        """Verify frontend dist directory and entry index exist."""
        index_file = os.path.join(DIST_DIR, "index.html")
        self.assertTrue(os.path.exists(index_file), f"SPA index missing: {index_file}")
        self.assertGreater(os.path.getsize(index_file), 100, "SPA index is unexpectedly empty")


if __name__ == "__main__":
    unittest.main()

