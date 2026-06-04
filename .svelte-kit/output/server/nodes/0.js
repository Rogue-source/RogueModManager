

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DfU8r9Cr.js","_app/immutable/chunks/iRThUpRp.js","_app/immutable/chunks/Dg-Mm-b2.js","_app/immutable/chunks/C15cbx1z.js","_app/immutable/chunks/Cb5W0EvP.js","_app/immutable/chunks/BtSaTBE5.js","_app/immutable/chunks/DiG12t_A.js","_app/immutable/chunks/z6e5c5P7.js","_app/immutable/chunks/BDMcCnWo.js","_app/immutable/chunks/B7LSipKj.js"];
export const stylesheets = ["_app/immutable/assets/0.2In3uWjY.css"];
export const fonts = [];
