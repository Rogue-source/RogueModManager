import { s as store_get, f as attr, d as ensure_array_like, a as attr_class, b as stringify, e as escape_html, u as unsubscribe_stores } from "../../../chunks/renderer.js";
import "@tauri-apps/plugin-shell";
import "@tauri-apps/plugin-http";
import { marked } from "marked";
import "dompurify";
import { a as activeModTab, f as focusedMod, g as globalMods, i as isModsLoading, d as detailTab } from "../../../chunks/store.js";
function html(value) {
  var html2 = String(value);
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filteredMods, totalPages, paginatedMods, modDownloads, modUpdated;
    let modSearch = "";
    let readmeContent = "Loading...";
    let changelogContent = "Loading...";
    let currentPage = 1;
    let modsPerPage = 20;
    marked.setOptions({ breaks: false, gfm: true });
    activeModTab.subscribe(() => focusedMod.set(null));
    filteredMods = store_get($$store_subs ??= {}, "$globalMods", globalMods).filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(modSearch.toLowerCase());
      const ownerMatch = m.owner.toLowerCase().includes(modSearch.toLowerCase());
      const matchesSearch = nameMatch || ownerMatch;
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") return matchesSearch && m.isInstalled;
      return matchesSearch;
    });
    totalPages = Math.ceil(filteredMods.length / modsPerPage) || 1;
    if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab)) currentPage = 1;
    paginatedMods = filteredMods.slice((currentPage - 1) * modsPerPage, currentPage * modsPerPage);
    modDownloads = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.downloads ?? store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.total_downloads ?? 0;
    modUpdated = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.date_updated ? new Date(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).date_updated).toLocaleDateString() : "Unknown";
    if (store_get($$store_subs ??= {}, "$isModsLoading", isModsLoading)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading-overlay svelte-1wn03p2"><div class="loader svelte-1wn03p2"></div> <h2>Fetching Mods</h2></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="manager-layout svelte-1wn03p2"><div class="list-column svelte-1wn03p2"><header class="mod-toolbar svelte-1wn03p2"><input type="text" placeholder="Search Thunderstore..." class="search-bar svelte-1wn03p2"${attr("value", modSearch)}/> <button class="tool-btn svelte-1wn03p2">Sort</button> <button class="tool-btn svelte-1wn03p2">Filter</button></header> <div class="mod-scroll-area svelte-1wn03p2">`);
      if (paginatedMods.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(paginatedMods);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let mod = each_array[$$index];
          $$renderer2.push(`<div${attr_class(`mod-row ${stringify(store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.full_name === mod.full_name ? "focused" : "")}`, "svelte-1wn03p2")}><img${attr("src", mod.versions[0]?.icon)} alt="" class="mod-icon-small svelte-1wn03p2"/> <div class="mod-text svelte-1wn03p2"><span class="mod-title-small svelte-1wn03p2">${escape_html(mod.name)}</span> <span class="mod-author-small svelte-1wn03p2">by ${escape_html(mod.owner)}</span></div></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="empty-state-msg svelte-1wn03p2"><p>${escape_html(store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed" ? "No mods currently installed." : "No mods found.")}</p> `);
        if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button class="browse-btn svelte-1wn03p2">Browse Online</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> <footer class="pagination-bar svelte-1wn03p2"><button class="page-btn svelte-1wn03p2"${attr("disabled", currentPage === 1, true)}>Prev</button> <div class="page-numbers"><button class="page-btn active svelte-1wn03p2">${escape_html(currentPage)}</button> <span class="page-info svelte-1wn03p2">of ${escape_html(totalPages)}</span></div> <button class="page-btn svelte-1wn03p2"${attr("disabled", currentPage === totalPages, true)}>Next</button></footer></div> `);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online" && store_get($$store_subs ??= {}, "$focusedMod", focusedMod)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="detail-column svelte-1wn03p2"><div class="detail-header svelte-1wn03p2"><div class="detail-top svelte-1wn03p2"><h1 class="detail-title svelte-1wn03p2">${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).name)}</h1> <button class="close-btn svelte-1wn03p2">×</button></div> <p class="detail-subtitle svelte-1wn03p2">By ${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).owner)}</p> <p class="header-description svelte-1wn03p2">${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.description || "No description provided.")}</p> <div class="package-info svelte-1wn03p2"><div class="info-item svelte-1wn03p2"><span class="svelte-1wn03p2">Downloads:</span> ${escape_html(modDownloads)}</div> <div class="info-item svelte-1wn03p2"><span class="svelte-1wn03p2">Last updated:</span> ${escape_html(modUpdated)}</div></div> <div class="action-row svelte-1wn03p2"><button class="primary-btn svelte-1wn03p2">Download</button> <button class="secondary-btn svelte-1wn03p2">View online</button></div> <nav class="detail-tabs svelte-1wn03p2"><button${attr_class("svelte-1wn03p2", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "README"
        })}>README</button> <button${attr_class("svelte-1wn03p2", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "CHANGELOG",
          "disabled": true
        })}>CHANGELOG</button> <button${attr_class("svelte-1wn03p2", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "DEPS"
        })}>Dependencies (${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.dependencies?.length || 0)})</button></nav></div> <div class="detail-content-area svelte-1wn03p2">`);
        if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "README") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="markdown-view"><div class="readme-body svelte-1wn03p2">${html(readmeContent)}</div></div>`);
        } else if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "CHANGELOG") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<div class="changelog-view"><div class="changelog-body svelte-1wn03p2">${html(changelogContent)}</div></div>`);
        } else if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "DEPS") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<ul class="deps-list"><!--[-->`);
          const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.dependencies || []);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let dep = each_array_1[$$index_1];
            $$renderer2.push(`<li>${escape_html(dep)}</li>`);
          }
          $$renderer2.push(`<!--]--></ul>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
