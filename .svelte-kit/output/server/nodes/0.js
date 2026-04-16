

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C3sJyram.js","_app/immutable/chunks/Dp0aRcRE.js","_app/immutable/chunks/BrTxarDZ.js","_app/immutable/chunks/DFWoiYcw.js","_app/immutable/chunks/pw6cbixr.js","_app/immutable/chunks/DI9i2E4A.js","_app/immutable/chunks/Ch6qEFPY.js","_app/immutable/chunks/CxzN0UHE.js"];
export const stylesheets = ["_app/immutable/assets/0.CxPkc66p.css"];
export const fonts = [];
