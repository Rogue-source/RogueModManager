<script lang="ts">
  import { open } from '@tauri-apps/plugin-shell';
  import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
  import { invoke } from '@tauri-apps/api/core';
  import { marked } from 'marked';
  import { onMount } from 'svelte';
  import "$lib/PageStyles/ModPage.css";
  
  import DOMPurify from 'dompurify';
import { 
    selectedGame,
    activeModTab, 
	selectedProfile,
    globalMods, 
    isModsLoading, 
    focusedMod, 
    detailTab,
    modsRequiringUpdate
} from '$lib/store';
  
  onMount(() => {
  checkForUpdates();
});

// --- Filter State Variables ---
  let showFilterPanel = false;
  
  // Use arrays for multi-select
  let selectedTypes: string[] = ["Mods"]; // Default: show only Mods
  let selectedCategories: string[] = [];  // Empty means "Show All"
  
  let filterSort = "Last Updated"; 
  let showDeprecated = false;
  let showTags = true;
  let availableCategories: string[] = [];
  
  let modSearch = "";
  let installedSearch = "";
  let readmeContent = "Loading...";
  let changelogContent = "Loading...";
  let hasChangelog = false; 
  let showDownloadModal = false; 
  let selectedVersion = "";
  let isDownloading = false;
  let downloadStatus = "";
  let currentPage = 1;
  let modsPerPage = 20;

  marked.setOptions({
    breaks: false,
    gfm: true
  });

$: filteredMods = $globalMods.filter(m => {
  const nameMatch = m.name.toLowerCase().includes(modSearch.toLowerCase());
  const ownerMatch = m.owner.toLowerCase().includes(modSearch.toLowerCase());
  const matchesSearch = nameMatch || ownerMatch;
  return matchesSearch;
});

  $: totalPages = Math.ceil(filteredMods.length / modsPerPage) || 1;
  $: paginatedMods = filteredMods.slice(
    (currentPage - 1) * modsPerPage,
    currentPage * modsPerPage
  );
  $: filteredInstalledMods = installedMods.filter(m => {
  const nameMatch = (m.name || '').toLowerCase().includes(installedSearch.toLowerCase());
  const ownerMatch = (m.authorName || m.author || '').toLowerCase().includes(installedSearch.toLowerCase());
  return nameMatch || ownerMatch;
});

  $: if (modSearch || $activeModTab === 'online') currentPage = 1;
  $: paginatedMods = filteredMods.slice(
    (currentPage - 1) * modsPerPage,
    currentPage * modsPerPage
  );
  $: filteredInstalledMods = installedMods.filter(m => {
  const nameMatch = (m.name || '').toLowerCase().includes(installedSearch.toLowerCase());
  const ownerMatch = (m.authorName || m.author || '').toLowerCase().includes(installedSearch.toLowerCase());
  return nameMatch || ownerMatch;
});

  $: if (modSearch || $activeModTab === 'online') currentPage = 1;

  activeModTab.subscribe(() => focusedMod.set(null));

  $: modDownloads = $focusedMod?.downloads ?? $focusedMod?.total_downloads ?? 0;
  $: modUpdated = $focusedMod?.date_updated 
    ? new Date($focusedMod.date_updated).toLocaleDateString() 
    : 'Unknown';

  async function openThunderstore() {
    const url = $focusedMod?.package_url;
    if (url) await open(url);
  }
  
  let installedMods = [];

  $: if ($selectedProfile && $activeModTab === 'installed') {
	syncLoader();
    fetchInstalledMods();
  }

  // Dynamically extract unique categories from Thunderstore data
$: if ($globalMods && $globalMods.length > 0) {
    const catSet = new Set<string>();
    $globalMods.forEach(m => {
      if (m.categories) m.categories.forEach(c => catSet.add(c));
    });
    catSet.delete("Modpacks"); // Handled by selectedTypes
    availableCategories = Array.from(catSet).sort();
  }

  // Reset to page 1 whenever any filter or search changes
$: if (modSearch || installedSearch || selectedTypes.length || filterSort || selectedCategories.length || showDeprecated !== null || $activeModTab) {
    currentPage = 1;
  }
  
  function toggleType(type: string) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter(t => t !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
  }
  
  function toggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      selectedCategories = selectedCategories.filter(c => c !== cat);
    } else {
      selectedCategories = [...selectedCategories, cat];
    }
  }

  // --- Online Mods Filtering & Sorting ---
$: filteredMods = $globalMods.filter(m => {
    // 1. Search
    const nameMatch = m.name.toLowerCase().includes(modSearch.toLowerCase());
    const ownerMatch = m.owner.toLowerCase().includes(modSearch.toLowerCase());
    if (!nameMatch && !ownerMatch) return false;

    // 2. Deprecated Check
    if (!showDeprecated && m.is_deprecated) return false;

    // 3. Type Check (Multi-select)
    const isModpack = m.categories?.includes("Modpacks");
    const modType = isModpack ? "Modpacks" : "Mods";
    if (selectedTypes.length > 0 && !selectedTypes.includes(modType)) return false;

    // 4. Category Check (Multi-select: Mod must have at least ONE of the selected categories)
    if (selectedCategories.length > 0) {
      const hasMatch = selectedCategories.some(cat => m.categories?.includes(cat));
      if (!hasMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filterSort === "Last Updated") {
      return new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime();
    } else if (filterSort === "Alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (filterSort === "Download count") {
      return (b.downloads || 0) - (a.downloads || 0);
    } else if (filterSort === "Rating") {
      return (b.rating_score || 0) - (a.rating_score || 0);
    }
    return 0;
  });

  $: filteredInstalledMods = installedMods.filter(m => {
    const nameMatch = (m.name || '').toLowerCase().includes(installedSearch.toLowerCase());
    const ownerMatch = (m.authorName || m.author || '').toLowerCase().includes(installedSearch.toLowerCase());
    if (!nameMatch && !ownerMatch) return false;

    const globalMeta = $globalMods.find(g => g.name === m.name && g.owner === (m.authorName || m.author));
    
    // Deprecated
    const isDeprecated = globalMeta ? globalMeta.is_deprecated : false;
    if (!showDeprecated && isDeprecated) return false;

    // Type Check
    const categories = globalMeta?.categories || [];
    const isModpack = categories.includes("Modpacks");
    const modType = isModpack ? "Modpacks" : "Mods";
    if (selectedTypes.length > 0 && !selectedTypes.includes(modType)) return false;
    
    // Category Check
    if (selectedCategories.length > 0) {
      const hasMatch = selectedCategories.some(cat => categories.includes(cat));
      if (!hasMatch) return false;
    }

    return true;
  }).sort((a, b) => {
    const globalA = $globalMods.find(g => g.name === a.name && g.owner === (a.authorName || a.author));
    const globalB = $globalMods.find(g => g.name === b.name && g.owner === (b.authorName || b.author));

    if (filterSort === "Last Updated") {
      const dateA = globalA?.date_updated ? new Date(globalA.date_updated).getTime() : 0;
      const dateB = globalB?.date_updated ? new Date(globalB.date_updated).getTime() : 0;
      return dateB - dateA;
    } else if (filterSort === "Alphabetical") {
      return (a.name || "").localeCompare(b.name || "");
    } else if (filterSort === "Download count") {
      return (globalB?.downloads || 0) - (globalA?.downloads || 0);
    } else if (filterSort === "Rating") {
      return (globalB?.rating_score || 0) - (globalA?.rating_score || 0);
    }
    return 0;
  });


async function fetchInstalledMods() {
  if (!$selectedGame || !$selectedProfile) return;

  try {
    installedMods = await invoke('get_installed_mods', {
      projectName: "RogueModManager",
      gameName: $selectedGame.id,
      profileName: $selectedProfile
    });
  } catch (e) {
    console.error("Failed to fetch installed mods:", e);
    installedMods = [];
  }
}

async function syncLoader() {
  if (!$selectedGame || !$selectedGame.executablePath) {
    return;
  }

  try {
    await invoke('sync_profile_loader', {
      projectName: "RogueModManager",
      gameName: $selectedGame.id,
      profileName: $selectedProfile,
      executablePath: $selectedGame.executablePath   // now guaranteed to be string
    });
  } catch (e) {
    console.error("Failed to sync loader:", e);
  }
}
  
  async function handleToggle(modId, currentState) {
    try {
      const newState = !currentState;
      await invoke('toggle_mod_status', {
        projectName: "RogueModManager",
        gameName: $selectedGame.id,
        profileName: $selectedProfile,
        modId: modId,
        enabled: newState
      });
      await fetchInstalledMods();
    } catch (e) {
      alert("Failed to toggle mod: " + e);
    }
  }

  let currentFetchId = 0;

  async function formatMarkdown(raw: string) {
  if (!raw) return "";

  let processed = raw
    .replace(/u003E/g, '>')
    .replace(/^(#+ .*)\n+/gm, '$1\n')
    .replace(/\n+(- .*)/g, '\n$1')
    .replace(/\n{3,}/g, '\n\n');

  const html = await marked.parse(processed);
  return DOMPurify.sanitize(html);
}

  function isUpdateAvailable(local: any, remoteStr: string) {
    const remote = remoteStr.split('.').map(Number);
    if (remote[0] > local.major) return true;
    if (remote[0] === local.major && remote[1] > local.minor) return true;
    if (remote[0] === local.major && remote[1] === local.minor && remote[2] > local.patch) return true;
    return false;
  }

  async function getDependencyTree(initialDeps: string[]) {
    let toProcess = [...initialDeps];
    let resolved = new Map();

    while (toProcess.length > 0) {
      const dep = toProcess.shift();
      const parts = dep.split('-');
	  const owner = parts[0];
	  const version = parts.pop();
	  const name = parts.slice(1).join('-');
      const modId = `${owner}-${name}`;

      if (resolved.has(modId)) continue;

      const res = await tauriFetch(`https://thunderstore.io/api/experimental/package/${owner}/${name}/${version}/`);
      if (res.ok) {
        const data = await res.json();
        resolved.set(modId, {
          owner, name, version,
          download_url: data.download_url,
          fullName: `${owner}-${name}-${version}`,
          modId,
          rawDeps: data.dependencies || [],
		  icon: data.icon || data.latest?.icon || null
        });
        if (data.dependencies) toProcess.push(...data.dependencies);
      }
    }
    return Array.from(resolved.values());
  }

  async function checkForUpdates() {
    const installed = await invoke('get_installed_mods', {
      projectName: "RogueManager",
      gameName: $selectedGame.id,
      profileName: $selectedProfile
    });

    let updatesFound = [];
    for (const mod of installed) {
      const parts = mod.name.split('-');
	  const pkgName = parts.slice(1).join('-');

		const res = await tauriFetch(`https://thunderstore.io/api/experimental/package/${mod.authorName}/${pkgName}/`);
      if (res.ok) {
        const data = await res.json();
        if (isUpdateAvailable(mod.versionNumber, data.latest.version_number)) {
          updatesFound.push({ ...mod, latestVersion: data.latest.version_number, download_url: data.latest.download_url });
        }
      }
    }
    modsRequiringUpdate.set(updatesFound);
  }
  
  async function selectMod(mod: any) {
    focusedMod.set(mod);
    detailTab.set('README');
    readmeContent = "Loading README...";
    changelogContent = "Loading Changelog...";
    hasChangelog = false;
	showDownloadModal = false;
	
	if (mod.versions && mod.versions.length > 0) {
      selectedVersion = mod.versions[0].version_number;
	}
	
    const fetchId = ++currentFetchId;
	
    try {
      const versions = mod.versions;
      const latestVer = versions && versions.length > 0 ? versions[0].version_number : null;
      
      if (!latestVer) {
        readmeContent = "Version data missing.";
        changelogContent = "Version data missing.";
        return;
      }

      const [readmeRes, changelogRes] = await Promise.all([
        tauriFetch(`https://thunderstore.io/api/experimental/package/${mod.owner}/${mod.name}/${latestVer}/readme/`),
        tauriFetch(`https://thunderstore.io/api/experimental/package/${mod.owner}/${mod.name}/${latestVer}/changelog/`)
      ]);
      
      if (fetchId !== currentFetchId) return;

      if (readmeRes.ok) {
        const data = await readmeRes.json();
        readmeContent = await formatMarkdown(data.markdown || "");
      } else {
        readmeContent = "No README available.";
      }

      if (changelogRes.ok) {
        const data = await changelogRes.json();
        const rawChangelog = data.markdown || "";
        if (rawChangelog.trim().length > 0) {
          changelogContent = await formatMarkdown(rawChangelog);
          hasChangelog = true; 
        } else {
          changelogContent = "No changelog data found.";
        }
      } else {
        changelogContent = "No changelog available.";
      }

    } catch (error) {
      if (fetchId !== currentFetchId) return;
      console.error("Fetch Error:", error);
      readmeContent = "Error loading content.";
      changelogContent = "Error loading content.";
    }
  }
  	function toggleDownloadModal() {
    showDownloadModal = !showDownloadModal;
    if (showDownloadModal) {
      isDownloading = false;
      downloadStatus = "";
    }
  }

async function downloadMod(targetMod = null) {
    if (targetMod instanceof Event) {
      targetMod = null;
    }
    
    const modToUse = targetMod || $focusedMod;
    if (!modToUse) {
      console.error("No mod selected.");
      return;
    }

    isDownloading = true;

    try {
      const projectName = "RogueModManager";
      const gameName = $selectedGame.id;
      const profileName = $selectedProfile;

      const author = modToUse.owner ?? modToUse.authorName ?? modToUse.author;
	  let pkgName = modToUse.name || "";

if (!modToUse.owner && pkgName.includes('-')) {
  const parts = pkgName.split('-');
  parts.shift();
  pkgName = parts.join('-');
}

      if (!author || !pkgName) {
        throw new Error(`Metadata Missing -> Author: ${author}, Name: ${pkgName}, mod: ${modToUse}`);
      }

      const versionToUse = targetMod ? targetMod.latestVersion : selectedVersion;

      downloadStatus = "Checking dependencies...";
      
      const res = await tauriFetch(`https://thunderstore.io/api/experimental/package/${author}/${pkgName}/${versionToUse}/`);
      if (!res.ok) throw new Error(`Thunderstore API error: ${res.status}`);
      
      const versionData = await res.json();
      
      const allToInstall = await getDependencyTree(versionData.dependencies || []);
      
      allToInstall.push({
        owner: author,
        name: pkgName,
        version: versionToUse,
        download_url: versionData.download_url,
        fullName: `${author}-${pkgName}-${versionToUse}`,
        modId: `${author}-${pkgName}`,
        rawDeps: versionData.dependencies || [],
		icon: versionData.icon || versionData.latest?.icon || null
      });

      for (const mod of allToInstall) {
        downloadStatus = `Installing: ${mod.name}`;
        
        await invoke('install_mod', {
          downloadUrl: mod.download_url,
          projectName, 
          gameName, 
          profileName,
          modName: mod.fullName
        });

        await invoke('register_mod_install', {
          projectName,
          gameName,
          profileName,
          modId: mod.modId,
          author: mod.owner || mod.authorName || author,
          version: mod.version,
          deps: mod.rawDeps,
		  icon: mod.icon || null
        });
      }

      downloadStatus = "Done!";
      checkForUpdates(); 
      setTimeout(() => { 
        isDownloading = false; 
        showDownloadModal = false; 
      }, 1500);

    } catch (e) {
      console.error("Download fail details:", e);
      downloadStatus = `Error: ${e}`;
      isDownloading = false;
    }
  }
  
</script>
{#if $modsRequiringUpdate.length > 0}
  <div class="update-banner">
    <div class="update-info">
      <span class="update-icon">⁉</span>
      <p><b>{$modsRequiringUpdate.length}</b> mod updates available: 
         {$modsRequiringUpdate.map(m => m.displayName || m.name).join(', ')}
      </p>
    </div>
    <button class="update-all-btn" on:click={() => downloadMod($modsRequiringUpdate[0])} disabled={isDownloading}>
      {isDownloading ? 'Updating...' : 'Update Now'}
    </button>
  </div>
{/if}
{#if $isModsLoading}
  <div class="loading-overlay">
    <div class="loader"></div>
    <h2>Fetching Mods</h2>
  </div>
{:else}
  <div class="manager-layout">
    
    <div class="list-column">
<header class="mod-toolbar">
  {#if $activeModTab === 'online'}
    <input type="text" placeholder="Search Thunderstore..." class="search-bar" bind:value={modSearch} />
  {:else if $activeModTab === 'installed'}
    <input type="text" placeholder="Search installed mods..." class="search-bar" bind:value={installedSearch} />
  {/if}

  <button class="tool-btn" on:click={() => showFilterPanel = true}>
    Filter & Sort
  </button>
</header>

<div class="mod-scroll-area">
  {#if $activeModTab === 'online'}
    {#if paginatedMods.length > 0}
      {#each paginatedMods as mod}
        <div 
          role="presentation" 
          class="mod-row {$focusedMod?.full_name === mod.full_name ? 'focused' : ''}" 
          on:click={() => selectMod(mod)}
        >
          <img src={mod.versions[0]?.icon} alt="" class="mod-icon-small" />
          
          <div class="mod-info-stacked">
            <span class="mod-title-small">{mod.name}</span>
            <span class="mod-author-small">by {mod.owner}</span>
          </div>

          <div class="mod-meta-section">
            {#if showTags}
              <div class="mod-tags-group">
                {#if mod.is_deprecated}
                  <span class="ui-tag tag-red">Deprecated</span>
                {/if}
                {#if mod.categories?.includes("Modpacks")}
                  <span class="ui-tag tag-yellow">Modpack</span>
                {:else}
                  <span class="ui-tag tag-green">Mod</span>
                {/if}
				<span class="ui-tag tag-grey">v{mod.versions[0]?.version_number}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {:else}
      <div class="empty-state-msg">No online mods found.</div>
    {/if}

  {:else if $activeModTab === 'installed'}
    {#if filteredInstalledMods.length > 0}
      {#each filteredInstalledMods as mod}
        {@const globalMeta = $globalMods.find(g => g.name === mod.name && g.owner === (mod.authorName || mod.author))}
        <div 
          role="presentation" 
          class="mod-row {$focusedMod?.name === mod.name ? 'focused' : ''}" 
          on:click={() => focusedMod.set(mod)}>
          <img src={mod.icon} alt="" class="mod-icon-small" />
          
          <div class="mod-info-stacked">
            <span class="mod-title-small">{mod.name}</span>
            <span class="mod-author-small">by {mod.authorName || 'Unknown'}</span>
          </div>

          <div class="mod-meta-section">
            {#if showTags && globalMeta}
              <div class="mod-tags-group">
                {#if globalMeta.is_deprecated}
                  <span class="ui-tag tag-red">Deprecated</span>
                {/if}
                {#if globalMeta.categories?.includes("Modpacks")}
                  <span class="ui-tag tag-yellow">Modpack</span>
                {:else}
                  <span class="ui-tag tag-green">Mod</span>
                {/if}
              </div>
            {/if}
          </div>

          <div class="mod-action-section">
            <label class="switch" on:click|stopPropagation>
              <input type="checkbox" checked={mod.enabled} on:change={() => handleToggle(mod.name, mod.enabled)}>
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      {/each}

    {:else}
      <div class="empty-state-msg">
        {#if installedMods.length === 0}
          No mods installed yet.
        {:else}
          No installed mods match your search.
        {/if}
      </div>
    {/if}

    {#if installedMods.length === 0}
      <button class="browse-btn" on:click={() => activeModTab.set('online')}>Browse Online</button>
    {/if}
  {/if}

</div>
	{#if $activeModTab === 'online'}
      <footer class="pagination-bar">
        <button 
          class="page-btn" 
          disabled={currentPage === 1} 
          on:click={() => currentPage--}>
          Prev
        </button>
        
        <div class="page-numbers">
          <button class="page-btn active">{currentPage}</button>
          <span class="page-info">of {totalPages}</span>
        </div>

        <button 
          class="page-btn" 
          disabled={currentPage === totalPages} 
          on:click={() => currentPage++}>
          Next
        </button>
      </footer>
	  {/if}
    </div>

    {#if $activeModTab === 'online' && $focusedMod}
      <div class="detail-column">
        <div class="detail-header">
          <div class="detail-top">
            <h1 class="detail-title">{$focusedMod.name}</h1>
            <button class="close-btn" on:click={() => focusedMod.set(null)}>×</button>
          </div>
          <p class="detail-subtitle">By {$focusedMod.owner}</p>
          
          <p class="header-description">{$focusedMod.versions[0]?.description || 'No description provided.'}</p>

          <div class="package-info">
            <div class="info-item"><span>Downloads:</span> {modDownloads}</div>
            <div class="info-item"><span>Last updated:</span> {modUpdated}</div>
          </div>

          <div class="action-row">
            <button class="primary-btn" on:click={toggleDownloadModal}>Download</button>
            <button class="secondary-btn" on:click={openThunderstore}>View online</button>
          </div>

          <nav class="detail-tabs">
            <button class:active={$detailTab === 'README'} on:click={() => detailTab.set('README')}>README</button>
            <button 
                class:active={$detailTab === 'CHANGELOG'} 
                class:disabled={!hasChangelog}
                on:click={() => hasChangelog && detailTab.set('CHANGELOG')}>
                CHANGELOG
            </button>
            <button class:active={$detailTab === 'DEPS'} on:click={() => detailTab.set('DEPS')}>
              Dependencies ({$focusedMod.versions[0]?.dependencies?.length || 0})
            </button>
          </nav>
        </div>

        <div class="detail-content-area">
          {#if $detailTab === 'README'}
            <div class="markdown-view">
              <div class="readme-body">
                {@html readmeContent}
              </div>
            </div>
          {:else if $detailTab === 'CHANGELOG'}
            <div class="changelog-view">
              <div class="changelog-body">
                {@html changelogContent}
              </div>
            </div>
          {:else if $detailTab === 'DEPS'}
            <ul class="deps-list">
              {#each ($focusedMod.versions[0]?.dependencies || []) as dep}
                <li>{dep}</li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

	{#if showDownloadModal && $focusedMod}
  <div role="presentation" class="modal-backdrop" on:click={toggleDownloadModal}>
    <div role="presentation" class="download-modal" on:click|stopPropagation>
      <h2 class="modal-title">Select a version of {$focusedMod.name} to download</h2>
      <div class="modal-divider"></div>
      
      <p class="modal-note">It's recommended to select the latest version of all mods. Using outdated versions may cause problems.</p>
      
      <div class="version-controls">
        <select class="version-dropdown" bind:value={selectedVersion}>
          {#each $focusedMod.versions as version}
            <option value={version.version_number}>{version.version_number}</option>
          {/each}
        </select>
        
        {#if selectedVersion === $focusedMod.versions[0]?.version_number}
          <span class="latest-tag">{selectedVersion} is the latest version</span>
        {/if}
      </div>

      <div class="modal-footer">
        <button 
          class="download-with-deps" 
          on:click={() => downloadMod()}
          disabled={isDownloading}
        >
          {isDownloading ? 'Installing...' : 'Download with dependencies'}
        </button>
        {#if downloadStatus}
          <span class="status-msg {downloadStatus.includes('Error') ? 'error' : 'success'}">
            {downloadStatus}
          </span>
        {/if}
      </div>
    </div>
  </div>
{/if}
{#if showFilterPanel}
  <div class="modal-backdrop" role="presentation" on:click={() => showFilterPanel = false}>
    <div class="filter-modal" on:click|stopPropagation>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #00adb5;">Filter & Sort</h3>
        <button class="close-btn" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;" on:click={() => showFilterPanel = false}>×</button>
      </div>

      <div class="filter-group">
        <label class="filter-label">Sort By</label>
        <select class="filter-select" bind:value={filterSort}>
          <option value="Last Updated">Last Updated</option>
          <option value="Alphabetical">Alphabetical</option>
          <option value="Download count">Download Count</option>
          <option value="Rating">Rating</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Type</label>
        <div class="checkbox-list">
          <label class="checkbox-label">
            <input type="checkbox" checked={selectedTypes.includes('Mods')} on:change={() => toggleType('Mods')} />
            Mods
          </label>
          <label class="checkbox-label">
            <input type="checkbox" checked={selectedTypes.includes('Modpacks')} on:change={() => toggleType('Modpacks')} />
            Modpacks
          </label>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Category</label>
        <div class="checkbox-list scrollable-list">
          {#each availableCategories as cat}
            <label class="checkbox-label">
              <input type="checkbox" checked={selectedCategories.includes(cat)} on:change={() => toggleCategory(cat)} />
              {cat}
            </label>
          {/each}
        </div>
      </div>

      <div class="filter-group checkbox-group" style="margin-top: 15px; border-top: 1px solid #4e555f; padding-top: 15px;">
        <label class="checkbox-label">
          <input type="checkbox" bind:checked={showDeprecated} />
          Show Deprecated Mods
        </label>
        <label class="checkbox-label" style="margin-top: 8px;">
          <input type="checkbox" bind:checked={showTags} />
          Show Mod Tags
        </label>
      </div>

      <div style="margin-top: 20px;">
        <button class="modal-btn primary" on:click={() => showFilterPanel = false}>Apply Filters</button>
      </div>
    </div>
  </div>
{/if}