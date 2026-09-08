"""
HealthGraph Root Launcher.
Run with: python app.py
"""

import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from healthgraph.app import run

if __name__ == "__main__":
    run()
