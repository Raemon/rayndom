import cv2
import numpy as np
from feat import Detector as FeatDetector


PY_FEAT_AU_COLUMNS = [
    "AU01", "AU02", "AU04", "AU05", "AU06", "AU07", "AU09", "AU10",
    "AU11", "AU12", "AU14", "AU15", "AU17", "AU20", "AU23", "AU24",
    "AU25", "AU26", "AU28", "AU43",
]


class PyFeatDetector:
    name = "py-feat"

    def __init__(self):
        # Defaults are reasonable: retinaface for face, mobilefacenet landmarks,
        # xgb AU classifier (probability output 0-1), resmasknet emotion (unused
        # here but cheap to keep loaded so we have it for follow-ups).
        self._detector = FeatDetector(
            face_model="retinaface",
            landmark_model="mobilefacenet",
            au_model="xgb",
            emotion_model="resmasknet",
            device="cpu",
        )

    def process_frame(self, bgr: np.ndarray) -> dict:
        # Py-Feat expects RGB. Easiest cross-version path is to write a temp
        # in-memory RGB array and call detect_image on it via a numpy input.
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        try:
            fex = self._detector.detect_image(
                inputFname=None, frame=rgb, output_size=None
            )
        except TypeError:
            # Older Py-Feat versions only accept file paths. Fall back to a
            # tempfile so we still work without pinning a specific version.
            import tempfile, os
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                cv2.imwrite(tmp.name, bgr)
                tmp_path = tmp.name
            try:
                fex = self._detector.detect_image(inputFname=tmp_path)
            finally:
                try: os.unlink(tmp_path)
                except OSError: pass

        if fex is None or len(fex) == 0:
            return { "faceDetected": False, "aus": {} }

        # Take the first detected face only (single-user self-monitoring tool).
        row = fex.iloc[0]
        aus = {}
        for col in PY_FEAT_AU_COLUMNS:
            if col in row.index:
                val = row[col]
                if val is not None and not (isinstance(val, float) and np.isnan(val)):
                    # Py-Feat XGB outputs probability already in [0,1]. Clamp defensively.
                    aus[col] = float(max(0.0, min(1.0, val)))
        return { "faceDetected": True, "aus": aus }
