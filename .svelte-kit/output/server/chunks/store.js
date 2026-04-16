import { w as writable } from "./index.js";
const activeModTab = writable("installed");
const selectedGame = writable(null);
const globalMods = writable([]);
const isModsLoading = writable(false);
const focusedMod = writable(null);
const detailTab = writable("README");
export {
  activeModTab as a,
  detailTab as d,
  focusedMod as f,
  globalMods as g,
  isModsLoading as i,
  selectedGame as s
};
