# expression-sidecar

Local Python service that owns the webcam, runs Py-Feat per frame, and streams
FACS Action Unit values over WebSocket to the `/expressions` page in the Next.js
app.

## Run

From the repo root:

```bash
npm run expressions:sidecar
```

That's it. The script auto-creates a venv, installs deps if needed, then starts
the server. First run downloads Py-Feat model weights (~few hundred MB) and may
take a minute.

Then open <http://localhost:3000/expressions> in the Next.js app -- the page
detects when the sidecar is up and auto-starts the stream.

## Manual run (if the npm script doesn't fit your setup)

```bash
cd tools/expression-sidecar
bash run.sh
```

Or fully manual:

```bash
cd tools/expression-sidecar
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

The sidecar listens on `ws://localhost:7681/ws/au-stream`. The browser connects
directly; nothing flows through the Next.js server.

## What the page expects

Per-frame JSON messages of shape:

```json
{
  "ts": "2026-04-21T18:32:11.143Z",
  "detector": "py-feat",
  "inferenceMs": 412.3,
  "faceDetected": true,
  "aus": { "AU01": 0.12, "AU04": 0.78, "AU07": 0.41, "...": "..." }
}
```

AU values are probabilities in [0,1] (Py-Feat XGB output). The detector
abstraction in `detectors/base.py` requires any future detector to normalize
to the same [0,1] range so the browser doesn't care which backend produced them.

## Swapping in OpenFace later

`detectors/openface_detector.py` is stubbed. See its docstring. OpenFace 2.x
gives FACS-standard 0-5 intensity which we'd divide by 5.0 to fit the protocol.

## Caveats

- Py-Feat runs ~1-3 fps on CPU. The server caps at 2 fps to match.
- macOS will prompt for camera permission the first time you run.
- Single-client only: each WebSocket connection grabs the webcam, releases on disconnect.
