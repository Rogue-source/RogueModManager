import { g as getContext, s as store_get, e as escape_html, a as attr, b as attr_class, c as stringify, d as slot, u as unsubscribe_stores } from "../../chunks/renderer.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import { s as selectedGame, p as profileList, a as selectedProfile, b as activeModTab, c as currentUser } from "../../chunks/supabase.js";
import { invoke } from "@tauri-apps/api/core";
import "@tauri-apps/plugin-shell";
import "@tauri-apps/plugin-dialog";
import "@tauri-apps/plugin-http";
import "@tauri-apps/plugin-clipboard-manager";
import "@tauri-apps/plugin-fs";
import "@tauri-apps/plugin-deep-link";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isLaunching = false;
    let isImportingMods = false;
    let importButtonText = "Import All Mods";
    let pollInterval;
    async function refreshProfiles() {
      if (!store_get($$store_subs ??= {}, "$selectedGame", selectedGame)) return;
      try {
        let list = await invoke("list_profiles", {
          projectName: "RogueModManager",
          gameName: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).id
        });
        if (!list.includes("Default")) {
          list = ["Default", ...list];
        }
        profileList.set(list);
        if (!store_get($$store_subs ??= {}, "$profileList", profileList).includes(store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile))) {
          selectedProfile.set("Default");
        }
      } catch (e) {
        console.error("Failed to list profiles:", e);
        profileList.set(["Default"]);
        selectedProfile.set("Default");
      }
    }
    {
      clearInterval(pollInterval);
    }
    if (store_get($$store_subs ??= {}, "$selectedGame", selectedGame)) {
      refreshProfiles();
    }
    $$renderer2.push(`<div class="app-shell"><aside class="sidebar"><div class="brand">ROGUE</div> `);
    if (store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/mods")) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="sidebar-section"><button class="btn-game-home"><span class="back-arrow">←</span> ${escape_html(store_get($$store_subs ??= {}, "$selectedGame", selectedGame)?.name || "Loading...")}</button> <button class="launch-btn"${attr("disabled", isLaunching, true)}><span class="launch-icon">${escape_html("▶")}</span> ${escape_html("Launch Modded")}</button></div> <nav class="nav-menu"><div class="nav-label">MODS</div> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed" && store_get($$store_subs ??= {}, "$page", page).url.pathname === "/" ? "active" : "")}`)}>Installed</button> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online" && store_get($$store_subs ??= {}, "$page", page).url.pathname === "/" ? "active" : "")}`)}>Online</button> <div class="sidebar-section"><div class="nav-label">PROFILES</div> <div class="custom-select-container"><button class="select-trigger">${escape_html(store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile) || "Default")} <span class="chevron">${escape_html("▼")}</span></button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="nav-label mt-20">OTHER</div> <button class="nav-item">Config editor</button> <button class="nav-item">Settings</button> <button class="nav-item">Help</button> <div class="auth-wrapper">`);
      if (!store_get($$store_subs ??= {}, "$currentUser", currentUser)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button class="auth-login-btn">Sign In</button> `);
        {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="user-profile-badge"><img${attr("src", store_get($$store_subs ??= {}, "$currentUser", currentUser).avatar)} alt="Avatar" class="user-avatar"/> <span class="user-name">${escape_html(store_get($$store_subs ??= {}, "$currentUser", currentUser).username)}</span> `);
        if (store_get($$store_subs ??= {}, "$currentUser", currentUser).is_staff || store_get($$store_subs ??= {}, "$currentUser", currentUser).discord_id === "591735141735464960") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="staff-tag">Admin</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <button class="logout-icon-btn" title="Sign Out">✕</button></div>`);
      }
      $$renderer2.push(`<!--]--></div></nav>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<nav class="nav-menu"><a href="/" class="nav-item active">Games</a> <button class="nav-item">Settings</button></nav>`);
    }
    $$renderer2.push(`<!--]--></aside> <main class="main-content"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></main></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div style="display: flex; gap: 12px; margin-top: 25px;"><button class="modal-btn primary"${attr("disabled", isImportingMods, true)}>${escape_html(importButtonText)}</button> <button class="modal-btn cancel"${attr("disabled", isImportingMods, true)}>Cancel</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
