"""FastAPI sidecar that owns the webcam, runs a face-expression detector, and
streams per-frame AU values to the /expressions Next.js page over WebSocket.

Run:    python server.py
Listens on ws://localhost:7681/ws/au-stream"""

import asyncio
import time
from datetime import datetime, timezone

import cv2
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from detectors.pyfeat_detector import PyFeatDetector


PORT = 7681
TARGET_FPS = 2.0  # Py-Feat is ~1-3 fps on CPU; confusion/frustration are multi-second states anyway.
WEBCAM_INDEX = 0

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


_detector = None
def get_detector():
    global _detector
    if _detector is None:
        print("[sidecar] loading Py-Feat detector (first call may take ~30s to download models)...")
        _detector = PyFeatDetector()
        print(f"[sidecar] detector ready: {_detector.name}")
    return _detector


@app.websocket("/ws/au-stream")
async def au_stream(websocket: WebSocket):
    await websocket.accept()
    print("[sidecar] client connected")
    cap = cv2.VideoCapture(WEBCAM_INDEX)
    if not cap.isOpened():
        await websocket.send_json({ "error": f"could not open webcam at index {WEBCAM_INDEX}" })
        await websocket.close()
        return

    detector = get_detector()
    frame_interval = 1.0 / TARGET_FPS
    last_emit = 0.0
    try:
        while True:
            ok, bgr = cap.read()
            if not ok:
                await asyncio.sleep(0.1)
                continue

            now = time.monotonic()
            if now - last_emit < frame_interval:
                # Drain webcam buffer without processing so we always have a fresh frame.
                await asyncio.sleep(0.01)
                continue

            t0 = time.monotonic()
            result = await asyncio.to_thread(detector.process_frame, bgr)
            t1 = time.monotonic()

            payload = {
                "ts": datetime.now(timezone.utc).isoformat(),
                "detector": detector.name,
                "inferenceMs": round((t1 - t0) * 1000, 1),
                "faceDetected": result["faceDetected"],
                "aus": result["aus"],
            }
            try:
                await websocket.send_json(payload)
            except WebSocketDisconnect:
                break
            last_emit = now
    except WebSocketDisconnect:
        pass
    finally:
        cap.release()
        print("[sidecar] client disconnected, webcam released")


@app.get("/health")
def health():
    return { "ok": True, "port": PORT, "targetFps": TARGET_FPS }


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")
