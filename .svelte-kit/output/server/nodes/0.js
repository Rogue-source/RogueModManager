

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DimunhiU.js","_app/immutable/chunks/D1Ydh055.js","_app/immutable/chunks/D_in7knP.js","_app/immutable/chunks/BrHqc_yI.js","_app/immutable/chunks/3NnCGJUs.js","_app/immutable/chunks/B711qwEH.js","_app/immutable/chunks/pXKLwxUf.js"];
export const stylesheets = ["_app/immutable/assets/0.BVghjhU-.css"];
export const fonts = [];
