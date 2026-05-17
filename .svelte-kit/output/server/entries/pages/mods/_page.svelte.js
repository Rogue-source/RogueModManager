import { s as store_get, e as escape_html, a as attr, f as ensure_array_like, b as attr_class, c as stringify, u as unsubscribe_stores } from "../../../chunks/renderer.js";
import "@tauri-apps/plugin-shell";
import "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";
import { marked } from "marked";
import "dompurify";
import { b as activeModTab, f as focusedMod, s as selectedGame, a as selectedProfile, g as globalMods, m as modsRequiringUpdate, i as isModsLoading, d as detailTab } from "../../../chunks/store.js";
function html(value) {
  var html2 = String(value);
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filteredMods, totalPages, paginatedMods, filteredInstalledMods, modDownloads, modUpdated;
    let modSearch = "";
    let installedSearch = "";
    let readmeContent = "Loading...";
    let changelogContent = "Loading...";
    let isDownloading = false;
    let currentPage = 1;
    let modsPerPage = 20;
    marked.setOptions({ breaks: false, gfm: true });
    activeModTab.subscribe(() => focusedMod.set(null));
    let installedMods = [];
    async function fetchInstalledMods() {
      if (!store_get($$store_subs ??= {}, "$selectedGame", selectedGame) || !store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile)) return;
      try {
        installedMods = await invoke("get_installed_mods", {
          projectName: "RogueModManager",
          gameName: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).id,
          profileName: store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile)
        });
      } catch (e) {
        console.error("Failed to fetch installed mods:", e);
        installedMods = [];
      }
    }
    async function syncLoader() {
      if (!store_get($$store_subs ??= {}, "$selectedGame", selectedGame) || !store_get($$store_subs ??= {}, "$selectedGame", selectedGame).executablePath) {
        return;
      }
      try {
        await invoke("sync_profile_loader", {
          projectName: "RogueModManager",
          gameName: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).id,
          profileName: store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile),
          executablePath: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).executablePath
          // now guaranteed to be string
        });
      } catch (e) {
        console.error("Failed to sync loader:", e);
      }
    }
    filteredMods = store_get($$store_subs ??= {}, "$globalMods", globalMods).filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(modSearch.toLowerCase());
      const ownerMatch = m.owner.toLowerCase().includes(modSearch.toLowerCase());
      const matchesSearch = nameMatch || ownerMatch;
      return matchesSearch;
    });
    totalPages = Math.ceil(filteredMods.length / modsPerPage) || 1;
    if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") currentPage = 1;
    paginatedMods = filteredMods.slice((currentPage - 1) * modsPerPage, currentPage * modsPerPage);
    filteredInstalledMods = installedMods.filter((m) => {
      const nameMatch = (m.name || "").toLowerCase().includes(installedSearch.toLowerCase());
      const ownerMatch = (m.authorName || m.author || "").toLowerCase().includes(installedSearch.toLowerCase());
      return nameMatch || ownerMatch;
    });
    modDownloads = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.downloads ?? store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.total_downloads ?? 0;
    modUpdated = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.date_updated ? new Date(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).date_updated).toLocaleDateString() : "Unknown";
    if (store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile) && store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
      syncLoader();
      fetchInstalledMods();
    }
    if (
      // now guaranteed to be string
      store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).length > 0
    ) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="update-banner"><div class="update-info"><span class="update-icon">⁉</span> <p><b>${escape_html(store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).length)}</b> mod updates available: 
         ${escape_html(store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).map((m) => m.displayName || m.name).join(", "))}</p></div> <button class="update-all-btn"${attr("disabled", isDownloading, true)}>${escape_html("Update Now")}</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$isModsLoading", isModsLoading)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading-overlay"><div class="loader"></div> <h2>Fetching Mods</h2></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="manager-layout"><div class="list-column"><header class="mod-toolbar">`);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<input type="text" placeholder="Search Thunderstore..." class="search-bar"${attr("value", modSearch)}/>`);
      } else if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<input type="text" placeholder="Search installed mods..." class="search-bar"${attr("value", installedSearch)}/>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button class="tool-btn">Sort</button> <button class="tool-btn">Filter</button></header> <div class="mod-scroll-area">`);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") {
        $$renderer2.push("<!--[0-->");
        if (paginatedMods.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<!--[-->`);
          const each_array = ensure_array_like(paginatedMods);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let mod = each_array[$$index];
            $$renderer2.push(`<div role="presentation"${attr_class(`mod-row ${stringify(store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.full_name === mod.full_name ? "focused" : "")}`)}><img${attr("src", mod.versions[0]?.icon)} alt="" class="mod-icon-small"/> <div class="mod-text"><span class="mod-title-small">${escape_html(mod.name)}</span> <span class="mod-author-small">by ${escape_html(mod.owner)}</span></div></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="empty-state-msg">No online mods found.</div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
        $$renderer2.push("<!--[1-->");
        if (filteredInstalledMods.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(filteredInstalledMods);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let mod = each_array_1[$$index_1];
            $$renderer2.push(`<div role="presentation"${attr_class(`mod-row ${stringify(store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.name === mod.name ? "focused" : "")}`)}><img${attr("src", mod.icon)} alt="" class="mod-icon-small"/> <div class="mod-text"><span class="mod-title-small">${escape_html(mod.name)}</span> <span class="mod-author-small">by ${escape_html(mod.authorName || "Unknown")}</span></div> <label class="switch"><input type="checkbox"${attr("checked", mod.enabled, true)}/> <span class="slider round"></span></label></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="empty-state-msg">`);
          if (installedMods.length === 0) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`No mods installed yet.`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`No installed mods match your search.`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--> `);
        if (installedMods.length === 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button class="browse-btn">Browse Online</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<footer class="pagination-bar"><button class="page-btn"${attr("disabled", currentPage === 1, true)}>Prev</button> <div class="page-numbers"><button class="page-btn active">${escape_html(currentPage)}</button> <span class="page-info">of ${escape_html(totalPages)}</span></div> <button class="page-btn"${attr("disabled", currentPage === totalPages, true)}>Next</button></footer>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online" && store_get($$store_subs ??= {}, "$focusedMod", focusedMod)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="detail-column"><div class="detail-header"><div class="detail-top"><h1 class="detail-title">${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).name)}</h1> <button class="close-btn">×</button></div> <p class="detail-subtitle">By ${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).owner)}</p> <p class="header-description">${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.description || "No description provided.")}</p> <div class="package-info"><div class="info-item"><span>Downloads:</span> ${escape_html(modDownloads)}</div> <div class="info-item"><span>Last updated:</span> ${escape_html(modUpdated)}</div></div> <div class="action-row"><button class="primary-btn">Download</button> <button class="secondary-btn">View online</button></div> <nav class="detail-tabs"><button${attr_class("", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "README"
        })}>README</button> <button${attr_class("", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "CHANGELOG",
          "disabled": true
        })}>CHANGELOG</button> <button${attr_class("", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "DEPS"
        })}>Dependencies (${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.dependencies?.length || 0)})</button></nav></div> <div class="detail-content-area">`);
        if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "README") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="markdown-view"><div class="readme-body">${html(readmeContent)}</div></div>`);
        } else if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "CHANGELOG") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<div class="changelog-view"><div class="changelog-body">${html(changelogContent)}</div></div>`);
        } else if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "DEPS") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<ul class="deps-list"><!--[-->`);
          const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.dependencies || []);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let dep = each_array_2[$$index_2];
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
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
