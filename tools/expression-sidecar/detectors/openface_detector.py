"""Stub for swapping in OpenFace 2.x later.

To implement: spawn the OpenFace `FeatureExtraction` binary in webcam mode,
parse its streaming CSV output, and translate the AU**_r intensity columns
(0-5 scale) to the [0,1] range our protocol expects (divide by 5.0).

Install path on macOS: build OpenFace 2.x from source
(https://github.com/TadasBaltrusaitis/OpenFace/wiki/Installation), or use
the algebr/openface Docker image with webcam pass-through."""

import numpy as np


class OpenFaceDetector:
    name = "openface"

    def __init__(self):
        raise NotImplementedError(
            "OpenFace detector not implemented yet. Use PyFeatDetector for now, "
            "or see this file's docstring for the implementation outline."
        )

    def process_frame(self, bgr: np.ndarray) -> dict:
        raise NotImplementedError
