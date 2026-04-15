import { w as writable } from "./index.js";
const activeModTab = writable("installed");
const selectedGame = writable(null);
const globalMods = writable([]);
const isModsLoading = writable(false);
const focusedMod = writable(null);
const detailTab = writable("README");
const modsRequiringUpdate = writable([]);
const profileList = writable(["Default"]);
const selectedProfile = writable("Default");
export {
  activeModTab as a,
  selectedProfile as b,
  detailTab as d,
  focusedMod as f,
  globalMods as g,
  isModsLoading as i,
  modsRequiringUpdate as m,
  profileList as p,
  selectedGame as s
};
