import { w as writable } from "./index.js";
import { createClient } from "@supabase/supabase-js";
const currentUser = writable(null);
const activeModTab = writable("installed");
const selectedGame = writable(null);
const globalMods = writable([]);
const isModsLoading = writable(false);
const focusedMod = writable(null);
const detailTab = writable("README");
const modsRequiringUpdate = writable([]);
const profileList = writable(["Default"]);
const selectedProfile = writable("Default");
const supabaseUrl = "https://fddyeiledgxchbdcrtee.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZHllaWxlZGd4Y2hiZGNydGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDMxMjIsImV4cCI6MjA5NTk3OTEyMn0.VxQEdSQ7nganI0LWj5kX_T4834E13Jwi-n4xyHy0C4E";
createClient(supabaseUrl, supabaseKey);
export {
  selectedProfile as a,
  activeModTab as b,
  currentUser as c,
  detailTab as d,
  focusedMod as f,
  globalMods as g,
  isModsLoading as i,
  modsRequiringUpdate as m,
  profileList as p,
  selectedGame as s
};
