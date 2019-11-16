export const clamp = (min, max, val) => Math.max(min, Math.min(max, val));

export const lerp = (v0, v1, t) => (1 - t) * v0 + t * v1;