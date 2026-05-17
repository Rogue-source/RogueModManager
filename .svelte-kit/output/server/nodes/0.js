

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Bmuijn1p.js","_app/immutable/chunks/CL7GRrhQ.js","_app/immutable/chunks/DJfcuGKO.js","_app/immutable/chunks/DULPonwa.js","_app/immutable/chunks/BamQIRsD.js","_app/immutable/chunks/CvYW6WuQ.js","_app/immutable/chunks/_1bBimRo.js","_app/immutable/chunks/B9mh3BG-.js","_app/immutable/chunks/tv_y-ccn.js"];
export const stylesheets = ["_app/immutable/assets/0.CzBSJb4G.css"];
export const fonts = [];
