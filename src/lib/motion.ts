import { cubicOut } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";
import { fade, slide } from "svelte/transition";

export const DURATION_MS = 180;

const STAGGER_MS = 25;
const STAGGER_LIMIT = 10;

/**
 * How far something should move as it animates. With reduced motion asked for, nothing moves and it only fades.
 *
 * @param {number} px - The distance with motion allowed.
 * @returns {number} The distance to use, in pixels.
 */
export const lift = (px: number) => (prefersReducedMotion.current ? 0 : px);

/**
 * Fly-in settings for a list row, delayed by its position so the first rows arrive one after another.
 * Rows past the first ten arrive together, so long lists don't keep animating.
 *
 * @param {number} index - The row's position in its list.
 * @returns {import("svelte/transition").FlyParams} The settings for `in:fly`.
 */
export const rowIn = (index: number) => ({
  y: lift(4),
  duration: DURATION_MS,
  delay: Math.min(index, STAGGER_LIMIT) * STAGGER_MS,
  easing: cubicOut,
});

/**
 * Closes an element up as it leaves, or just fades it with reduced motion asked for.
 *
 * @param {Element} node - The element leaving.
 * @returns {import("svelte/transition").TransitionConfig} The transition to run.
 */
export const collapse = (node: Element) =>
  prefersReducedMotion.current ? fade(node, { duration: DURATION_MS }) : slide(node, { duration: DURATION_MS });

/**
 * Settings for items sliding to their new place when a list reorders, or jumping straight there with reduced motion asked for.
 *
 * @returns {import("svelte/animate").FlipParams} The settings for `animate:flip`.
 */
export const reflow = () => ({ duration: prefersReducedMotion.current ? 0 : DURATION_MS, easing: cubicOut });
