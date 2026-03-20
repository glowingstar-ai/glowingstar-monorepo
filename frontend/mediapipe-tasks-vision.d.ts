declare module "@mediapipe/tasks-vision" {
  export type FaceLandmarkPoint = { x: number; y: number; z?: number };

  export type FaceLandmarkerResult = {
    faceLandmarks: Array<Array<FaceLandmarkPoint>>;
  };

  export type FaceLandmarkerInstance = {
    detectForVideo: (
      video: HTMLVideoElement,
      timestampMs: number
    ) => FaceLandmarkerResult | undefined;
    close: () => void;
  };

  export const FaceLandmarker: {
    createFromOptions: (
      filesetResolver: unknown,
      options: {
        baseOptions: { modelAssetPath: string };
        runningMode: "IMAGE" | "VIDEO";
        numFaces?: number;
      }
    ) => Promise<FaceLandmarkerInstance>;
  };

  export const FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>;
  };
}
