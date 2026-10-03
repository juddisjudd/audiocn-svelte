import { prefersReducedMotion } from "svelte/motion";

/** True in `.current` when the user asked the system to reduce motion. */
export const useReducedMotion = (): { readonly current: boolean } => prefersReducedMotion;
