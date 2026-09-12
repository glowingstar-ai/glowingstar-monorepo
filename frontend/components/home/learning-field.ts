export const LEARNING_FIELD_CONTOURS = 34;
export const LEARNING_FIELD_DURATION = 16;

/** Periodic geometry keeps the original ribbon intact at every loop boundary. */
export function learningFieldPath(index: number, phase = 0): string {
  const spread = index * 5.3;
  const depth = index / (LEARNING_FIELD_CONTOURS - 1);
  const breath = Math.sin(phase) * 24;
  const twist = (1 - Math.cos(phase)) * 16;
  const wave = Math.sin(phase + depth * Math.PI) - Math.sin(depth * Math.PI);
  const weave = wave * 12;
  const startX = 295 - spread * 0.23 + twist * 0.4;
  const startY = 558 + spread * 0.08 - breath * 0.25;

  return `M ${startX} ${startY}
    C ${85 - spread * 0.23 - breath} ${444 - spread * 0.13 + weave},
      ${159 - spread * 0.37 + twist} ${223 - spread * 0.37 - breath},
      ${304 + spread * 0.41 + weave} ${145 - spread * 0.2 - breath * 0.4}
    C ${456 + spread * 0.7 - twist} ${65 + spread * 0.32 + weave},
      ${559 + spread * 0.2 + breath * 0.6} ${280 + spread * 0.79 - twist},
      ${415 - spread * 0.22 - weave} ${391 + spread * 0.48 + breath}
    C ${348 - spread * 0.14 + twist} ${446 + spread * 0.4 - weave},
      ${249 + spread * 0.12 - twist} ${457 + spread * 0.4 + breath},
      ${startX} ${startY}`;
}
