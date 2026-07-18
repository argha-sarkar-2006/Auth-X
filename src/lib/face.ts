import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// The WASM runtime and model are served locally from public/mediapipe (the
// wasm is copied from the installed @mediapipe/tasks-vision package, so the
// runtime/JS API versions always match). No network/CDN access is needed.
const WASM_PATH = "/mediapipe/wasm";
const MODEL_URL = "/mediapipe/face_landmarker.task";

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

// Load (once, cached) the MediaPipe FaceLandmarker in IMAGE mode.
export function loadFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
    // Don't cache a failed load — let the next capture attempt retry.
    landmarkerPromise.catch(() => {
      landmarkerPromise = null;
    });
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
