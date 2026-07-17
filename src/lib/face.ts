import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// WASM runtime is pinned to the installed @mediapipe/tasks-vision version to
// avoid a runtime/JS API mismatch. The model is Google's hosted face landmarker.
const WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

// Load (once, cached) the MediaPipe FaceLandmarker in IMAGE mode.
export function loadFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
  }
  return landmarkerPromise;
}

const round = (n: number) => Math.round(n * 100000) / 100000;

// Detect a single face in the given frame and return a flat
// [x0,y0,z0, x1,y1,z1, ...] vector of its 468 landmarks (length 1404), or null
// if no face is found.
export function extractFaceVector(
  landmarker: FaceLandmarker,
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): number[] | null {
  const result = landmarker.detect(source);
  const face = result.faceLandmarks?.[0];
  if (!face) return null;
  const vec: number[] = [];
  for (const p of face) {
    vec.push(round(p.x), round(p.y), round(p.z));
  }
  return vec;
}
