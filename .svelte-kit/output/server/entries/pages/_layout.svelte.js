import { g as getContext, s as store_get, e as escape_html, a as attr_class, b as stringify, c as slot, u as unsubscribe_stores } from "../../chunks/renderer.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import { s as selectedGame, a as activeModTab } from "../../chunks/store.js";
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
    $$renderer2.push(`<div class="app-shell svelte-12qhfyh"><aside class="sidebar svelte-12qhfyh"><div class="brand svelte-12qhfyh">ROGUE</div> `);
    if (store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/mods")) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="sidebar-section svelte-12qhfyh"><button class="btn-game-home svelte-12qhfyh"><span class="back-arrow">←</span> ${escape_html(store_get($$store_subs ??= {}, "$selectedGame", selectedGame)?.name || "Loading...")}</button></div> <nav class="nav-menu svelte-12qhfyh"><div class="nav-label svelte-12qhfyh">MODS</div> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed" ? "active" : "")}`, "svelte-12qhfyh")}>Installed</button> <button${attr_class(`nav-item ${stringify(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online" ? "active" : "")}`, "svelte-12qhfyh")}>Online</button> <div class="nav-label mt-20 svelte-12qhfyh">OTHER</div> <button class="nav-item svelte-12qhfyh">Config editor</button> <button class="nav-item svelte-12qhfyh">Settings</button> <button class="nav-item svelte-12qhfyh">Help</button></nav>`);
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
