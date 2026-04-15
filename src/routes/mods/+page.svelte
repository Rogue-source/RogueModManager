<script lang="ts">
  import { open } from '@tauri-apps/plugin-shell';
  import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
  import { invoke } from '@tauri-apps/api/core';
  import { marked } from 'marked';
  import { onMount } from 'svelte';
  
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

  let modSearch = "";

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

    if ($activeModTab === 'installed') return matchesSearch && m.isInstalled;
    return matchesSearch;
  });

  $: totalPages = Math.ceil(filteredMods.length / modsPerPage) || 1;
  $: paginatedMods = filteredMods.slice(
    (currentPage - 1) * modsPerPage,
    currentPage * modsPerPage
  );

  $: if (modSearch || $activeModTab) currentPage = 1;

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

  $: if ($selectedProfile || $activeModTab === 'installed') {
	syncLoader();
    fetchInstalledMods();
  }

  async function fetchInstalledMods() {
    if (!$selectedGame) return;
    try {
      installedMods = await invoke('get_installed_mods', {
        projectName: "RogueModManager",
        gameName: $selectedGame.id,
        profileName: $selectedProfile
      });
    } catch (e) {
      console.error("Failed to fetch installed mods:", e);
    }
  }

async function syncLoader() {
    try {
      await invoke('sync_profile_loader', {
        projectName: "RogueModManager",
        gameName: $selectedGame.id,
        profileName: $selectedProfile,
        executablePath: $selectedGame.executablePath
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
          rawDeps: data.dependencies || []
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

const res = await tauriFetch(
  `https://thunderstore.io/api/experimental/package/${mod.authorName}/${pkgName}/`
);
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
        rawDeps: versionData.dependencies || []
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
          deps: mod.rawDeps
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
        <input 
          type="text" 
          placeholder="Search Thunderstore..." 
          class="search-bar" 
          bind:value={modSearch} 
        />
   
        <button class="tool-btn">Sort</button>
        <button class="tool-btn">Filter</button>
      </header>

      <div class="mod-scroll-area">
        {#if paginatedMods.length > 0}
          {#each paginatedMods as mod}
            <div 
              class="mod-row {$focusedMod?.full_name === mod.full_name ? 'focused' : ''}" 
              on:click={() => selectMod(mod)}
            >
              <img src={mod.versions[0]?.icon} alt="" class="mod-icon-small" />
              <div class="mod-text">
                <span class="mod-title-small">{mod.name}</span>
                <span class="mod-author-small">by {mod.owner}</span>
              </div>
            </div>
          {/each}
        {:else}
          <div class="empty-state-msg">
{#if $activeModTab === 'installed'}
  <div class="mod-list">
    {#each installedMods as mod}
      <div class="mod-card" on:click={() => focusedMod.set(mod)}>
        <div class="mod-info">
          <div class="mod-header-row">
            <h3 class="mod-title">{mod.name}</h3>
            
            <label class="switch" on:click|stopPropagation>
              <input 
                type="checkbox" 
                checked={mod.enabled} 
                on:change={() => handleToggle(mod.name, mod.enabled)}
              >
              <span class="slider round"></span>
            </label>
          </div>
          
          <p class="mod-author">by {mod.authorName || 'Unknown'}</p>
          
          <div class="mod-meta">
            <span class="version-tag">v{mod.versionNumber.major}.{mod.versionNumber.minor}.{mod.versionNumber.patch}</span>
            {#if mod.enabled}
              <span class="status-tag enabled">Active</span>
            {:else}
              <span class="status-tag disabled">Disabled</span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
	{#if installedMods.length === 0}
      <button class="browse-btn" on:click={() => activeModTab.set('online')}>Browse Online</button>
    {/if}
  </div>
{/if}		
          </div>
        {/if}
      </div>

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
  <div class="modal-backdrop" on:click={toggleDownloadModal}>
    <div class="download-modal" on:click|stopPropagation>
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

<style>

.mod-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #393E46;
    transition: .3s;
    border: 1px solid #4e555f;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 4px;
    bottom: 3px;
    background-color: #eeeeee;
    transition: .3s;
  }

  input:checked + .slider {
    background-color: #00adb5;
    border-color: #00fffb;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
    background-color: white;
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }

  .installed-card {
    border-left: 4px solid #393E46;
    transition: border-color 0.3s;
  }

  /* Glow effect if enabled */
  .installed-card:has(input:checked) {
    border-left-color: #00adb5;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #888;
    font-style: italic;
  }
  
  /* 1. MAIN LAYOUT & THEME */
  .manager-layout { 
    display: flex;
    height: 100%; 
    background-color: #393E46;
  }

  .list-column {
    flex: 1;
    min-width: 400px;
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-right: 1px solid #222831;
  }

  .detail-column {
    width: 30%; 
    min-width: 450px;
    display: flex;
    flex-direction: column;
    background: #222831;
    border-left: 1px solid #1a1f26;
  }

  /* 2. MOD LIST & TOOLBAR */
  .mod-toolbar { display: flex; gap: 10px; margin-bottom: 20px; }
  
  .search-bar { 
    flex: 1; 
    background: #222831; 
    border: 1px solid #4e555f; 
    padding: 10px 15px;
    border-radius: 4px; 
    color: white; 
    outline: none;
  }
  .search-bar:focus { border-color: #00adb5; }

  .tool-btn {
    background: #222831;
    color: #eee;
    border: 1px solid #4e555f;
    padding: 0 15px;
    border-radius: 4px;
    cursor: pointer;
  }

  .mod-scroll-area { flex: 1; overflow-y: auto; padding-right: 5px; }

  .mod-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 6px;
    background: #2a323c;
    border: 1px solid transparent;
  }
  .mod-row:hover { background: #323a45; }
  .mod-row.focused { border-color: #00adb5; background: #323a45; }
  
  .mod-text { display: flex; flex-direction: column; align-items: flex-start; flex: 1; }
  .mod-icon-small { width: 40px; height: 40px; border-radius: 4px; }
  .mod-title-small { font-weight: bold; color: #eee; text-align: left; }
  .mod-author-small { font-size: 0.8rem; color: #00adb5; text-align: left; }

  /* 3. PAGINATION */
  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding-top: 15px;
    border-top: 1px solid #222831;
    margin-top: 10px;
  }
  .page-btn {
    background: #222831;
    color: white;
    border: 1px solid #4e555f;
    padding: 5px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .page-btn:hover:not(:disabled) { border-color: #00adb5; }
  .page-btn.active { border-color: #00adb5; color: #00adb5; }
  .page-info { color: #888; font-size: 0.9rem; }

  /* 4. DETAIL HEADER & ACTIONS */
  .detail-header { padding: 30px; border-bottom: 1px solid #393E46; }
  .detail-top { display: flex; justify-content: space-between; align-items: center; }
  .detail-title { font-size: 1.8rem; margin: 0; color: #eee; font-weight: 800; }
  .close-btn { background: none; border: none; color: #888; font-size: 2rem; cursor: pointer; line-height: 1; }
  .detail-subtitle { color: #00adb5; margin-top: 5px; }
  .header-description { font-size: 0.95rem; color: #ccc; margin: 15px 0; line-height: 1.4; font-style: italic; }

  .package-info { margin: 20px 0; font-size: 0.85rem; color: #aaa; }
  .info-item span { color: #888; font-weight: bold; margin-right: 8px; }

  .action-row { display: flex; gap: 10px; margin-bottom: 25px; }
  .primary-btn { background: #00adb5; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
  .secondary-btn { background: #393E46; color: #eee; border: 1px solid #4e555f; padding: 10px 20px; border-radius: 4px; cursor: pointer; }

  .detail-tabs { display: flex; gap: 20px; }
  .detail-tabs button { background: none; border: none; padding: 10px 0; color: #888; cursor: pointer; font-size: 0.8rem; border-bottom: 3px solid transparent; }
  .detail-tabs button.active { color: #00adb5; border-color: #00adb5; }
  .detail-tabs button.disabled { opacity: 0.2; cursor: not-allowed; }

  /* 5. MARKDOWN CONTENT AREA (The @html stuff) */
  .detail-content-area { 
    flex: 1; 
    overflow-y: auto; 
    padding: 30px; 
    color: #ccc; 
  }
  
  .readme-body, .changelog-body { 
    white-space: pre-wrap; 
    line-height: 1.5; 
    font-family: sans-serif; 
  }

  /* Tables Fix */
  .readme-body :global(table), .changelog-body :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    border: 1px solid #4e555f;
    background: #2a323c;
  }
  .readme-body :global(th), .readme-body :global(td),
  .changelog-body :global(th), .changelog-body :global(td) {
    border: 1px solid #4e555f;
    padding: 10px;
    text-align: left;
  }
  .readme-body :global(th), .changelog-body :global(th) {
    background: #393E46;
    color: #00adb5;
  }
  
	/* DOWNLOAD MODAL */
  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .download-modal { background: #2a323c; width: 500px; padding: 30px; border-radius: 8px; border: 1px solid #393E46; }
  .modal-title { color: #eee; font-size: 1.4rem; margin-bottom: 20px; }
  .modal-divider { height: 1px; background: #393E46; margin-bottom: 25px; }
  .version-dropdown { background: #222831; color: #eee; border: 1px solid #4e555f; padding: 8px 12px; border-radius: 4px; }
  .latest-tag { background: #2e7d32; color: #a5d6a7; padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; }
  .download-with-deps { background: #3a86ff; color: white; border: none; padding: 12px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
  
  /* Tight Headers with underline */
  .readme-body :global(h1), .readme-body :global(h2), .readme-body :global(h3),
  .changelog-body :global(h1), .changelog-body :global(h2), .changelog-body :global(h3) {
    color: #eee;
    border-bottom: 2px solid #393E46;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 0px !important; /* Forces the gap to close per your request */
  }
  .readme-body :global(h1), .changelog-body :global(h1) { font-size: 1.8rem; }
  .readme-body :global(h2), .changelog-body :global(h2) { font-size: 1.4rem; }

  /* Discord-style Blockquotes */
  .readme-body :global(blockquote), .changelog-body :global(blockquote) {
    margin: 12px 0;
    padding: 2px 0 2px 15px;
    border-left: 4px solid #4e555f;
    color: #b9bbbe;
    background: rgba(255, 255, 255, 0.02);
  }

  .readme-body :global(p), .changelog-body :global(p) { margin: 12px 0; line-height: 1.6; }
  .readme-body :global(img) { max-width: 100%; height: auto; border-radius: 4px; }
  .readme-body :global(ul) { padding-left: 20px; margin: 12px 0; }
  .readme-body :global(code) { background: #393E46; padding: 2px 5px; border-radius: 3px; font-family: monospace; }

  /* 6. UTILITIES */
  .empty-state-msg { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #888; }
  .browse-btn { background: #00adb5; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 15px; font-weight: bold; }

  .loading-overlay { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .loader { width: 40px; height: 40px; border: 4px solid #222831; border-top-color: #00adb5; border-radius: 50%; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .modal-footer {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .download-with-deps:disabled {
    background: #4e555f;
    cursor: not-allowed;
    opacity: 0.7;
  }
  .status-msg {
    font-size: 0.9rem;
    font-weight: bold;
  }
  .status-msg.success { color: #a5d6a7; }
  .status-msg.error { color: #ff5252; }
  
  .update-banner {
  background: #00adb5;
  color: #eeeeee;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 0 8px 8px;
  margin-bottom: 20px;
  animation: slideDown 0.4s ease-out;
}
.update-info { display: flex; align-items: center; gap: 10px; }
.update-all-btn {
  background: #222831;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
@keyframes slideDown {
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
}
</style>