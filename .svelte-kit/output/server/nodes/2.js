

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.Bj3gEDKU.js","_app/immutable/chunks/scheduler.BvZPyRWq.js","_app/immutable/chunks/index.rAyYiyK0.js","_app/immutable/chunks/index.DjWMz06n.js"];
export const stylesheets = [];
export const fonts = [];
