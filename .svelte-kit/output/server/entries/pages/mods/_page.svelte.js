import { s as store_get, e as escape_html, a as attr, f as ensure_array_like, b as attr_class, c as stringify, u as unsubscribe_stores } from "../../../chunks/renderer.js";
import { fetch } from "@tauri-apps/plugin-http";
import { invoke } from "@tauri-apps/api/core";
import { marked } from "marked";
import "@tauri-apps/plugin-shell";
import "dompurify";
import { b as activeModTab, f as focusedMod, g as globalMods, s as selectedGame, a as selectedProfile, m as modsRequiringUpdate, c as currentUser, i as isModsLoading, d as detailTab } from "../../../chunks/supabase.js";
function html(value) {
  var html2 = String(value);
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let filteredMods, totalPages, paginatedMods, modUpdated, filteredInstalledMods;
    let selectedTypes = ["Mods"];
    let selectedCategories = [];
    let installedDescription = "Loading description...";
    let modSearch = "";
    let installedSearch = "";
    let readmeContent = "Loading...";
    let changelogContent = "Loading...";
    let currentPage = 1;
    let modsPerPage = 20;
    let modComments = [];
    let newCommentText = "";
    let isSubmittingComment = false;
    marked.setOptions({ breaks: false, gfm: true });
    activeModTab.subscribe(() => focusedMod.set(null));
    let modDownloads = 0;
    async function fetchLiveDownloads(author, modName) {
      modDownloads = "...";
      try {
        const url = `https://thunderstore.io/api/v1/package-metrics/${author}/${modName}/`;
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          modDownloads = data.downloads;
        } else {
          modDownloads = 0;
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
        modDownloads = 0;
      }
    }
    let installedMods = [];
    async function fetchInstalledDescription(mod) {
      installedDescription = "Loading description...";
      try {
        const author = mod.owner ?? mod.authorName ?? mod.author;
        let pkgName = mod.name || "";
        if (!mod.owner && pkgName.includes("-")) {
          const parts = pkgName.split("-");
          parts.shift();
          pkgName = parts.join("-");
        }
        if (!author || !pkgName) {
          installedDescription = "No description available for this mod.";
          return;
        }
        const url = `https://thunderstore.io/api/experimental/package/${author}/${pkgName}/`;
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          installedDescription = data.latest?.description || data.description || "No description available for this mod.";
        } else {
          const globalMeta = store_get($$store_subs ??= {}, "$globalMods", globalMods).find((g) => g.full_name?.toLowerCase() === mod.name?.toLowerCase() || g.name?.toLowerCase() === pkgName.toLowerCase());
          installedDescription = globalMeta?.versions?.[0]?.description || globalMeta?.description || "No description available for this mod.";
        }
      } catch (error) {
        console.error("Error fetching installed description:", error);
        installedDescription = "No description available for this mod.";
      }
    }
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
        });
      } catch (e) {
        console.error("Failed to sync loader:", e);
      }
    }
    async function checkForUpdates() {
      try {
        const installed = await invoke("get_installed_mods", {
          projectName: "RogueModManager",
          gameName: store_get($$store_subs ??= {}, "$selectedGame", selectedGame).id,
          profileName: store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile)
        });
        let outdated = [];
        for (const localMod of installed) {
          const remoteMod = store_get($$store_subs ??= {}, "$globalMods", globalMods).find((m) => m.full_name?.toLowerCase() === localMod.name?.toLowerCase() || m.name?.toLowerCase() === localMod.name?.toLowerCase() && m.owner?.toLowerCase() === localMod.authorName?.toLowerCase());
          const latestVerData = remoteMod?.versions?.[0] || remoteMod?.latest;
          if (remoteMod && latestVerData && latestVerData.version_number) {
            const [rMajor, rMinor, rPatch] = latestVerData.version_number.split(".").map(Number);
            const { major, minor, patch } = localMod.versionNumber;
            const isNewer = rMajor > major || rMajor === major && rMinor > minor || rMajor === major && rMinor === minor && rPatch > patch;
            if (isNewer) {
              outdated.push({
                ...localMod,
                latest_version: latestVerData.version_number,
                download_url: latestVerData.download_url,
                dependencies: latestVerData.dependencies || []
              });
            }
          }
        }
        modsRequiringUpdate.set(outdated);
      } catch (err) {
        console.error("Failed to parse mod updates:", err);
      }
    }
    filteredMods = store_get($$store_subs ??= {}, "$globalMods", globalMods).filter((m) => {
      const nameMatch = m.name.toLowerCase().includes(modSearch.toLowerCase());
      const ownerMatch = m.owner.toLowerCase().includes(modSearch.toLowerCase());
      if (!nameMatch && !ownerMatch) return false;
      if (m.is_deprecated) return false;
      const isModpack = m.categories?.includes("Modpacks");
      const modType = isModpack ? "Modpacks" : "Mods";
      if (selectedTypes.length > 0 && !selectedTypes.includes(modType)) return false;
      if (selectedCategories.length > 0) {
        const hasMatch = selectedCategories.some((cat) => m.categories?.includes(cat));
        if (!hasMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      {
        return new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime();
      }
    });
    totalPages = Math.ceil(filteredMods.length / modsPerPage) || 1;
    if (store_get($$store_subs ??= {}, "$focusedMod", focusedMod) && store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
      fetchInstalledDescription(store_get($$store_subs ??= {}, "$focusedMod", focusedMod));
    }
    if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") currentPage = 1;
    {
      currentPage = 1;
    }
    paginatedMods = filteredMods.slice((currentPage - 1) * modsPerPage, currentPage * modsPerPage);
    if (store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile) && store_get($$store_subs ??= {}, "$globalMods", globalMods).length > 0) {
      checkForUpdates();
    }
    if (store_get($$store_subs ??= {}, "$focusedMod", focusedMod) && store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") {
      fetchLiveDownloads(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).owner, store_get($$store_subs ??= {}, "$focusedMod", focusedMod).name);
    }
    if (store_get($$store_subs ??= {}, "$currentUser", currentUser)) {
      store_get($$store_subs ??= {}, "$currentUser", currentUser).username;
    }
    modUpdated = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.date_updated ? new Date(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).date_updated).toLocaleDateString() : "Unknown";
    if (store_get($$store_subs ??= {}, "$selectedProfile", selectedProfile) && store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "installed") {
      syncLoader();
      fetchInstalledMods();
    }
    if (store_get($$store_subs ??= {}, "$globalMods", globalMods) && store_get($$store_subs ??= {}, "$globalMods", globalMods).length > 0) {
      const catSet = /* @__PURE__ */ new Set();
      store_get($$store_subs ??= {}, "$globalMods", globalMods).forEach((m) => {
        if (m.categories) m.categories.forEach((c) => catSet.add(c));
      });
      catSet.delete("Modpacks");
      Array.from(catSet).sort();
    }
    filteredInstalledMods = installedMods.filter((m) => {
      const nameMatch = (m.name || "").toLowerCase().includes(installedSearch.toLowerCase());
      const ownerMatch = (m.authorName || m.author || "").toLowerCase().includes(installedSearch.toLowerCase());
      if (!nameMatch && !ownerMatch) return false;
      const globalMeta = store_get($$store_subs ??= {}, "$globalMods", globalMods).find((g) => g.full_name?.toLowerCase() === m.name?.toLowerCase() || g.name?.toLowerCase() === m.name?.split("-").slice(1).join("-").toLowerCase() && g.owner?.toLowerCase() === (m.authorName || m.author)?.toLowerCase());
      const isDeprecated = globalMeta ? globalMeta.is_deprecated : false;
      if (isDeprecated) return false;
      const categories = globalMeta?.categories || [];
      const isModpack = categories.includes("Modpacks");
      const modType = isModpack ? "Modpacks" : "Mods";
      if (selectedTypes.length > 0 && !selectedTypes.includes(modType)) return false;
      if (selectedCategories.length > 0) {
        const hasMatch = selectedCategories.some((cat) => categories.includes(cat));
        if (!hasMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      const globalA = store_get($$store_subs ??= {}, "$globalMods", globalMods).find((g) => g.full_name?.toLowerCase() === a.name?.toLowerCase());
      const globalB = store_get($$store_subs ??= {}, "$globalMods", globalMods).find((g) => g.full_name?.toLowerCase() === b.name?.toLowerCase());
      {
        const dateA = globalA?.date_updated ? new Date(globalA.date_updated).getTime() : 0;
        const dateB = globalB?.date_updated ? new Date(globalB.date_updated).getTime() : 0;
        return dateB - dateA;
      }
    });
    if (store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate) && store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="update-banner"><div class="update-banner-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="update-icon"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg> <span>Updates are available for <strong>${escape_html(store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).length)}</strong> ${escape_html(store_get($$store_subs ??= {}, "$modsRequiringUpdate", modsRequiringUpdate).length === 1 ? "mod" : "mods")}.</span></div> <button class="update-banner-btn">Update All</button></div>`);
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
      $$renderer2.push(`<!--]--> <button class="tool-btn">Filter &amp; Sort</button></header> <div class="mod-scroll-area">`);
      if (store_get($$store_subs ??= {}, "$activeModTab", activeModTab) === "online") {
        $$renderer2.push("<!--[0-->");
        if (paginatedMods.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<!--[-->`);
          const each_array = ensure_array_like(paginatedMods);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let mod = each_array[$$index];
            $$renderer2.push(`<div role="presentation"${attr_class(`mod-row ${stringify(store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.full_name === mod.full_name ? "focused" : "")}`)}><img${attr("src", mod.versions[0]?.icon)} alt="" class="mod-icon-small"/> <div class="mod-info-stacked"><span class="mod-title-small">${escape_html(mod.name)}</span> <span class="mod-author-small">by ${escape_html(mod.owner)}</span></div> <div class="mod-meta-section">`);
            {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<div class="mod-tags-group">`);
              if (mod.is_deprecated) {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<span class="ui-tag tag-red">Deprecated</span>`);
              } else {
                $$renderer2.push("<!--[-1-->");
              }
              $$renderer2.push(`<!--]--> `);
              if (mod.categories?.includes("Modpacks")) {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<span class="ui-tag tag-yellow">Modpack</span>`);
              } else {
                $$renderer2.push("<!--[-1-->");
                $$renderer2.push(`<span class="ui-tag tag-green">Mod</span>`);
              }
              $$renderer2.push(`<!--]--> <span class="ui-tag tag-grey">v${escape_html(mod.versions[0]?.version_number)}</span></div>`);
            }
            $$renderer2.push(`<!--]--></div></div>`);
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
            store_get($$store_subs ??= {}, "$globalMods", globalMods).find((g) => g.full_name?.toLowerCase() === mod.name?.toLowerCase() || g.name?.toLowerCase() === mod.name?.toLowerCase() || g.name?.toLowerCase() === mod.name?.split("-").slice(1).join("-").toLowerCase() && g.owner?.toLowerCase() === (mod.authorName || mod.author)?.toLowerCase());
            const isExpanded = store_get($$store_subs ??= {}, "$focusedMod", focusedMod)?.name === mod.name;
            $$renderer2.push(`<div class="mod-item-container"><div role="presentation"${attr_class(`mod-row ${stringify(isExpanded ? "focused" : "")}`)}><img${attr("src", mod.icon)} alt="" class="mod-icon-small"/> <div class="mod-info-stacked"><span class="mod-title-small">${escape_html(mod.name)}</span> <span class="mod-author-small">by ${escape_html(mod.authorName || "Unknown")}</span></div> <div class="mod-meta-section"><span class="ui-tag tag-grey">v${escape_html(mod.versionNumber.major)}.${escape_html(mod.versionNumber.minor)}.${escape_html(mod.versionNumber.patch)}</span></div> <div class="mod-action-section"><label class="switch"><input type="checkbox"${attr("checked", mod.enabled, true)}/> <span class="slider round"></span></label></div></div> `);
            if (isExpanded) {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<div class="mod-expanded-area"><p class="mod-description">${escape_html(installedDescription)}</p> <div class="mod-expanded-actions"><button class="action-btn btn-danger">Uninstall</button> <button class="action-btn btn-secondary">Website</button></div></div>`);
            } else {
              $$renderer2.push("<!--[-1-->");
            }
            $$renderer2.push(`<!--]--></div>`);
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
        })}>Dependencies (${escape_html(store_get($$store_subs ??= {}, "$focusedMod", focusedMod).versions[0]?.dependencies?.length || 0)})</button> <button${attr_class("", void 0, {
          "active": store_get($$store_subs ??= {}, "$detailTab", detailTab) === "COMMENTS"
        })}>Comments (${escape_html(modComments.length)})</button></nav></div> <div class="detail-content-area">`);
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
        } else if (store_get($$store_subs ??= {}, "$detailTab", detailTab) === "COMMENTS") {
          $$renderer2.push("<!--[3-->");
          $$renderer2.push(`<div class="comments-section-container">`);
          if (!store_get($$store_subs ??= {}, "$currentUser", currentUser)) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="anonymous-login-prompt"><p class="prompt-text">Login to comment</p></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<div class="auth-comment-form"><div class="user-posting-as">Posting securely as: <span class="highlight-user">${escape_html(store_get($$store_subs ??= {}, "$currentUser", currentUser).username)}</span></div> <textarea placeholder="Share your thoughts about this mod..." class="comment-textarea" rows="4">`);
            const $$body = escape_html(newCommentText);
            if ($$body) {
              $$renderer2.push(`${$$body}`);
            }
            $$renderer2.push(`</textarea> <div class="form-actions"><button${attr("disabled", !newCommentText.trim() || isSubmittingComment, true)} class="submit-comment-btn">${escape_html("Post Comment")}</button></div></div>`);
          }
          $$renderer2.push(`<!--]--> <hr class="section-divider"/> <div class="comments-list">`);
          if (modComments.length === 0) {
            $$renderer2.push("<!--[1-->");
            $$renderer2.push(`<p style="color: #888; text-align: center; font-style: italic;">No comments yet. Be the first!</p>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<!--[-->`);
            const each_array_3 = ensure_array_like(modComments);
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let comment = each_array_3[$$index_3];
              $$renderer2.push(`<div class="comment-card"><div class="comment-header"><div><strong>${escape_html(comment.username)}</strong> <span class="comment-date">${escape_html(new Date(comment.created_at).toLocaleDateString())}</span></div> `);
              if (store_get($$store_subs ??= {}, "$currentUser", currentUser) && store_get($$store_subs ??= {}, "$currentUser", currentUser).discord_id === "591735141735464960") {
                $$renderer2.push("<!--[0-->");
                $$renderer2.push(`<button class="comment-delete-btn" title="Delete Comment">🗑️ Delete</button>`);
              } else {
                $$renderer2.push("<!--[-1-->");
              }
              $$renderer2.push(`<!--]--></div> <div class="comment-body">${escape_html(comment.text)}</div></div>`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
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
