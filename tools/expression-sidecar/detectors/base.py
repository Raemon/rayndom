from typing import Protocol
import numpy as np


class Detector(Protocol):
    """Abstraction so we can swap Py-Feat for OpenFace / something else later
    without touching the server or the browser."""

    name: str

    def process_frame(self, bgr: np.ndarray) -> dict:
        """Take a BGR image (H, W, 3 uint8) and return:
            { "faceDetected": bool, "aus": { "AU01": float in [0,1], ... } }
        AU values are normalized to [0,1] regardless of underlying scale so the
        browser doesn't need to know which detector produced them."""
        ...
