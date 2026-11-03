"""
Unit Tests for HealthGraph SMART-on-FHIR Engine.
"""

import unittest
from healthgraph.core.smart import SmartFhirEngine


class TestSmartFhirEngine(unittest.TestCase):

    def test_pkce_generation(self):
        verifier, challenge = SmartFhirEngine.generate_pkce_pair()
        self.assertIsInstance(verifier, str)
        self.assertIsInstance(challenge, str)
        self.assertGreaterEqual(len(verifier), 43)
        self.assertLessEqual(len(verifier), 128)
        self.assertGreater(len(challenge), 20)

    def test_presets_catalog(self):
        presets = SmartFhirEngine.SANDBOX_PRESETS
        self.assertIsInstance(presets, list)
        self.assertGreaterEqual(len(presets), 2)
        ids = [p["id"] for p in presets]
        self.assertIn("smart-health-it-r4", ids)
        self.assertIn("hapi-fhir-r4", ids)

    def test_build_authorize_url(self):
        auth_url = SmartFhirEngine.build_authorize_url(
            auth_endpoint="https://auth.sandbox.smarthealthit.org/authorize",
            client_id="healthgraph_client",
            redirect_uri="https://localhost:8000/smart/callback",
            aud="https://launch.smarthealthit.org/v/r4/fhir",
            state="test_state_123",
            code_challenge="test_challenge_abc",
            launch_id="launch_token_xyz",
        )
        self.assertIn("https://auth.sandbox.smarthealthit.org/authorize", auth_url)
        self.assertIn("client_id=healthgraph_client", auth_url)
        self.assertIn("launch=launch_token_xyz", auth_url)
        self.assertIn("code_challenge=test_challenge_abc", auth_url)
        self.assertIn("code_challenge_method=S256", auth_url)
        self.assertIn("scope=launch%2Fpatient", auth_url)
