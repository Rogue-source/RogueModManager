import { g as getContext, s as store_get, e as escape_html, a as attr, b as attr_class, c as stringify, d as slot, u as unsubscribe_stores } from "../../chunks/renderer.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import { s as selectedGame, p as profileList, a as activeModTab, b as selectedProfile } from "../../chunks/store.js";
import { invoke } from "@tauri-apps/api/core";
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
    async function refreshProfiles() {
      if (!store_get($$store_subs ??= {}, "$selectedGame", selectedGame)) return;
      try {
        const list = await invoke("list_profiles", {
          projectName: "RogueModManager",
          gameName: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).id
        });
        profileList.set(list);
      } catch (e) {
        console.error("Failed to list profiles:", e);
      }
    }
    if (store_get($$store_subs ??= {}, "$selectedGame", selectedGame)) {
      refreshProfiles();
    }
    $$renderer2.push(`<div class="app-shell svelte-12qhfyh"><aside class="sidebar svelte-12qhfyh"><div class="brand svelte-12qhfyh">ROGUE</div> `);
    if (store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/mods")) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="sidebar-section svelte-12qhfyh"><button class="btn-game-home svelte-12qhfyh"><span class="back-arrow">←</span> ${escape_html(store_get($$store_subs ??= {}, "$selectedGame", selectedGame)?.name || "Loading...")}</button> <button class="launch-btn svelte-12qhfyh"${attr("disabled", isLaunching, true)}><span class="launch-icon svelte-12qhfyh">${escape_html("▶")}</span> ${escape_html("Launch Modded")}</button></div> <nav class="nav-menu svelte-12qhfyh"><div class="nav-label svelte-12qhfyh">MODS</div> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed" ? "active" : "")}`, "svelte-12qhfyh")}>Installed</button> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online" ? "active" : "")}`, "svelte-12qhfyh")}>Online</button> <div class="sidebar-section svelte-12qhfyh"><div class="nav-label svelte-12qhfyh">PROFILES</div> <div class="custom-select-container svelte-12qhfyh"><button class="select-trigger svelte-12qhfyh">${escape_html(store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile))} <span class="chevron svelte-12qhfyh">${escape_html("▼")}</span></button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="nav-label mt-20 svelte-12qhfyh">OTHER</div> <button class="nav-item svelte-12qhfyh">Config editor</button> <button class="nav-item svelte-12qhfyh">Settings</button> <button class="nav-item svelte-12qhfyh">Help</button></nav>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<nav class="nav-menu svelte-12qhfyh"><a href="/" class="nav-item active svelte-12qhfyh">Games</a> <div class="nav-item svelte-12qhfyh">Settings</div></nav>`);
    }
    $$renderer2.push(`<!--]--></aside> <main class="main-content svelte-12qhfyh"><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
