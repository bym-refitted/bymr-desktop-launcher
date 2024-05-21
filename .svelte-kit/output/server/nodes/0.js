import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.moBkMRZe.js","_app/immutable/chunks/scheduler.BvZPyRWq.js","_app/immutable/chunks/index.rAyYiyK0.js"];
export const stylesheets = ["_app/immutable/assets/0.jpDOw31R.css"];
export const fonts = ["_app/immutable/assets/GROBOLDpro.onb39TcN.ttf","_app/immutable/assets/Graveblade-W00-Regular.CjHl3Lk2.ttf","_app/immutable/assets/Inter-Medium.CKLJZXR2.ttf"];
