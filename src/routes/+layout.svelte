<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { activeModTab, selectedGame, globalMods, focusedMod, profileList, selectedProfile } from '$lib/store';
  import { invoke } from '@tauri-apps/api/core';
  import { open as openUrl } from '@tauri-apps/plugin-shell';   // for URLs (steam:// etc.)
  import { open as openDialog } from '@tauri-apps/plugin-dialog'; // for file/folder picker
  import { onMount } from 'svelte';
  import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
  import "$lib/PageStyles/LayoutPage.css";

  function returnToMenu() {
    globalMods.set([]);
    selectedGame.set(null);
    focusedMod.set(null);
    goto('/');
  }
  
  let isLaunching = false;
  let showSettings = false;
  let tempPath = "";
  let showDropdown = false;
  let showProfileModal = false;
  let newProfileName = "";
  let showImportCode = false;
  let importCode = "";
let showImportModal = false;
let importProfileData = null;
  let currentImportCode = "";

  // Poll for manual folder changes
  let pollInterval;
  $: if (showDropdown && $selectedGame) {
    clearInterval(pollInterval);
    pollInterval = setInterval(() => refreshProfiles(), 3000);
  } else {
    clearInterval(pollInterval);
  }

  $: if ($selectedGame) {
    refreshProfiles();
  }

async function handleImportCode() {
  if (!importCode.trim()) return;

  const code = importCode.trim();
  showProfileModal = false;
  
  try {
    const modsRaw = await invoke('resolve_legacy_profile', { code });

    const fullMods = await Promise.all(
      modsRaw.map(async (mod) => {
        try {
          const res = await tauriFetch(`https://thunderstore.io/api/experimental/package/${mod.owner}/${mod.name}/`);
          console.log("🔍 ", res)
		  
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          return {
            name: data.name,
            owner: data.owner,
            version: data.latest?.version_number || mod.version,
            icon: data.latest?.icon || null,
            community: data.community_listings?.[1]?.community || "unknown"
          };
        } catch (err) {
          console.warn(`Failed to fetch metadata for ${mod.name}:`, err);
          return {
            name: mod.name,
            owner: mod.owner,
            version: mod.version,
            icon: null,
            community: "unknown"
          };
        }
      })
    );

    const validMod = fullMods.find(m => m.community !== "unknown");
    const gameName = validMod ? validMod.community : "Unknown Game";

    importProfileData = {
      game: gameName,
      mods: fullMods,
      rawCode: code
    };
    
    showImportModal = true;

  } catch (e) {
    console.error(e);
    alert("Failed to load profile code.\n\n" + (e.message || e));
    showProfileModal = true;
  }
}

async function importProfileFromCode() {
  await handleImportCode();
}

  async function refreshProfiles() {
    if (!$selectedGame) return;
    try {
      let list = await invoke('list_profiles', { 
        projectName: "RogueModManager", 
        gameName: $selectedGame.id 
      });
      
      // Ensure Default always exists	  
      if (!list.includes("Default")) {
        list = ["Default", ...list];
      }
      profileList.set(list);
      
      // Fallback to Default if current profile disappeared
      if (!$profileList.includes($selectedProfile)) {
        selectedProfile.set("Default");
      }
    } catch (e) {
      console.error("Failed to list profiles:", e);
      profileList.set(["Default"]);
      selectedProfile.set("Default");
    }
  }

  // Reactive for settings
  $: if (showSettings) {
    if ($selectedGame) {
      tempPath = $selectedGame.executablePath || "Not located. Click browse...";
    } else {
      tempPath = "Select a game first";
    }
  }

  async function browseNewPath() {
    const selected = await openDialog({
      multiple: false,
      filters: [{ name: 'Executable', extensions: ['exe'] }]
    });
    if (selected) tempPath = selected;
  }

  async function saveSettings() {
    try {
      await invoke('save_game_location', { 
        slug: $selectedGame.slug, 
        exePath: tempPath 
      });
      selectedGame.update(g => ({ ...g, executablePath: tempPath }));
      showSettings = false;
    } catch (e) {
      alert("Save failed: " + e);
    }
  }

  async function addNewProfile() {
    const name = prompt("New Profile Name:");
    if (!name || name.trim() === "" || name.toLowerCase() === "default") return;
    
    try {
      await invoke('create_profile', { 
        projectName: "RogueModManager", 
        gameName: $selectedGame.id, 
        profileName: name.trim() 
      });
      await refreshProfiles();
      selectedProfile.set(name.trim());
    } catch (e) {
      console.error("Error creating profile:", e);
      alert(e);
    }
  }

  async function deleteProfile(name) {
    if (name === "Default") return;
    if (!confirm(`Are you sure you want to delete profile "${name}"?`)) return;

    try {
      await invoke('delete_profile', {
        projectName: "RogueModManager",
        gameName: $selectedGame.id,
        profileName: name
      });
      
      if ($selectedProfile === name) {
        selectedProfile.set("Default");
      }
      await refreshProfiles();
    } catch (e) {
      alert("Delete failed: " + e);
    }
  }

  // === New Modal Functions ===
  async function createProfileFromModal() {
    const name = newProfileName.trim();
    if (!name || name.toLowerCase() === "default") return;

    try {
      await invoke('create_profile', { 
        projectName: "RogueModManager", 
        gameName: $selectedGame.id, 
        profileName: name 
      });
      await refreshProfiles();
      selectedProfile.set(name);
      closeProfileModal();
    } catch (e) {
      alert("Failed to create profile: " + e);
    }
  }

  function closeProfileModal() {
    showProfileModal = false;
    showImportCode = false;
    newProfileName = "";
    importCode = "";
  }

  // Launch with safety guard for null executablePath
  async function launchModdedGame() {
    if (!$selectedGame) return;

    let currentPath = $selectedGame.executablePath;

    if (!currentPath) {
      try {
        currentPath = await invoke('discover_game_path', { slug: $selectedGame.slug });
        if (currentPath) {
          await invoke('save_game_location', { slug: $selectedGame.slug, exePath: currentPath });
          selectedGame.update(g => ({ ...g, executablePath: currentPath }));
        }
      } catch (e) {
        console.log("Auto-discovery failed.");
      }
    }

    if (!currentPath) {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        title: `Locate ${$selectedGame.name} Executable`
      });

      if (selected) {
        currentPath = selected;
        await invoke('save_game_location', { slug: $selectedGame.slug, exePath: currentPath });
        selectedGame.update(g => ({ ...g, executablePath: currentPath }));
      } else {
        return;
      }
    }
async function performProfileImport() {
  if (!importProfileData) return;

  const profileName = "Imported_" + Date.now().toString().slice(-6);

  try {
    // 1. Create the new profile
    await invoke('create_profile', { 
      projectName: "RogueModManager", 
      gameName: $selectedGame.id, 
      profileName 
    });

    await refreshProfiles();
    selectedProfile.set(profileName);

    // 2. Import each mod one by one (using your existing download system)
    for (const mod of importProfileData.mods) {
      // Simulate selecting the mod and triggering download
      // We use the latest version for simplicity
      const modToDownload = {
        owner: mod.owner,
        name: mod.name,
        versions: [{ version_number: mod.version }]
      };

      // Call your existing download logic (adjust if your function signature differs)
      await downloadMod(modToDownload);   // This will use your dependency tree + install
    }

    showImportModal = false;
    importProfileData = null;

    alert(`Profile "${profileName}" imported successfully!\n\nAll mods have been queued for download.`);

  } catch (e) {
    console.error("Profile import failed:", e);
    alert("Import failed: " + e);
  }
}
    isLaunching = true;
    try {
      await invoke('launch_game', {
        projectName: "RogueModManager", 
        gameName: $selectedGame.id,
        profileName: $selectedProfile || "default",
        executablePath: currentPath
      });
    } catch (e) {
      console.error("Launch failed:", e);
      alert("Launch failed: " + e);
    } finally {
      isLaunching = false;
    }
  }
</script>
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">ROGUE</div>

    {#if $page.url.pathname.startsWith('/mods')}
      <div class="sidebar-section">
        <button class="btn-game-home" on:click={returnToMenu}>
          <span class="back-arrow">←</span> {$selectedGame?.name || 'Loading...'}
        </button>
		<button 
        class="launch-btn" 
        on:click={launchModdedGame} 
        disabled={isLaunching}
      >
        <span class="launch-icon">{isLaunching ? '⌛' : '▶'}</span>
        {isLaunching ? 'Launching...' : 'Launch Modded'}
      </button>
      </div>
      
      <nav class="nav-menu">
        <div class="nav-label">MODS</div>
        <button 
          class="nav-item {$activeModTab === 'installed' ? 'active' : ''}" 
          on:click={() => activeModTab.set('installed')}>
          Installed
        </button>
        <button 
          class="nav-item {$activeModTab === 'online' ? 'active' : ''}" 
          on:click={() => activeModTab.set('online')}>
          Online
        </button>
		


<div class="sidebar-section">
  <div class="nav-label">PROFILES</div>
  
  <div class="custom-select-container">
    <button class="select-trigger" on:click={() => showDropdown = !showDropdown}>
      {$selectedProfile || 'Default'}
      <span class="chevron">{showDropdown ? '▲' : '▼'}</span>
    </button>

    {#if showDropdown}
      <div class="select-dropdown">
        <div class="options-list">
          {#if $profileList && $profileList.length > 0}
            {#each $profileList as profile}
              <div class="option-item" class:active={$selectedProfile === profile}>
                <button class="option-name" on:click={() => { selectedProfile.set(profile); showDropdown = false; }}>
                  {profile}
                </button>
                {#if profile !== 'Default'}
                  <button class="delete-btn" on:click|stopPropagation={() => deleteProfile(profile)}>
                    🗑️
                  </button>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="option-item">
              <span style="padding: 10px; color: #888;">No profiles found</span>
            </div>
          {/if}
        </div>
        
        <div style="border-top: 1px solid #4e555f; padding: 8px;">
          <button class="add-profile-btn" on:click={() => { 
            showDropdown = false; 
            showProfileModal = true; 
            newProfileName = ""; 
            showImportCode = false; 
            importCode = ""; 
          }}>
            + New Profile
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

        <div class="nav-label mt-20">OTHER</div>
        <button class="nav-item">Config editor</button>
        <button class="nav-item" on:click={() => showSettings = true}>Settings</button>
        <button class="nav-item">Help</button>
      </nav>
    {:else}
      <nav class="nav-menu">
        <a href="/" class="nav-item active">Games</a>
        <button class="nav-item" on:click={() => showSettings = true}>Settings</button>
      </nav>
    {/if}
  </aside>

  <main class="main-content">
    <slot />
  </main>
</div>
{#if showSettings}
  <div class="settings-overlay">
    <div class="settings-card">
      <h2 style="margin-top: 0; color: #00adb5;">
        {$selectedGame ? $selectedGame.name + " Settings" : "Global Settings"}
      </h2>
      
      <div class="setting-item">
        <label style="display: block; margin-bottom: 8px; color: #888;">Executable Path</label>
        <div style="display: flex; gap: 10px;">
          <input 
            type="text" 
            bind:value={tempPath} 
            readonly={!$selectedGame}
            style="flex: 1; background: #393E46; border: 1px solid #4e555f; color: {$selectedGame ? 'white' : '#888'}; padding: 8px; border-radius: 4px;" 
          />
          
          {#if $selectedGame}
            <button on:click={browseNewPath} style="background: #00adb5; border: none; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Browse</button>
          {/if}
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px;">
        <button on:click={() => showSettings = false} style="background: transparent; border: 1px solid #4e555f; color: white; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          {$selectedGame ? 'Cancel' : 'Close'}
        </button>
        
        {#if $selectedGame}
          <button on:click={saveSettings} style="background: #00adb5; border: none; color: white; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">Save Changes</button>
        {/if}
      </div>
    </div>
  </div>
{/if}
{#if showProfileModal}
  <div class="modal-backdrop" on:click={closeProfileModal} role="presentation">
    <div class="profile-modal" role="presentation" on:click|stopPropagation>
      <h3 style="margin: 0 0 20px 0; color: #00adb5;">Create New Profile</h3>
      
      <input 
        type="text" 
        placeholder="Profile name" 
        bind:value={newProfileName}
        class="modal-input"
        on:keypress={(e) => { if (e.key === 'Enter') createProfileFromModal(); }}
      />

      {#if showImportCode}
        <input 
          type="text" 
          placeholder="Paste Thunderstore profile code here" 
          bind:value={importCode}
          class="modal-input"
        />
      {/if}

      <button 
        class="modal-btn primary" 
        on:click={showImportCode ? importProfileFromCode : createProfileFromModal}
        disabled={showImportCode ? !importCode.trim() : (!newProfileName.trim() || newProfileName.toLowerCase() === 'default')}
      >
        {showImportCode ? 'Import Profile' : 'Create Profile'}
      </button>

      <button 
        class="modal-btn secondary" 
        on:click={() => showImportCode = !showImportCode}
      >
        {showImportCode ? 'Cancel Import' : 'Import from code'}
      </button>

      <button 
        class="modal-btn cancel" 
        on:click={closeProfileModal}
      >
        Close
      </button>
    </div>
  </div>
{/if}
{#if showImportModal && importProfileData}
  <div role="presentation" class="modal-backdrop" on:click={() => { showImportModal = false; importProfileData = null; }}>
    <div role="presentation" class="import-preview-modal" on:click|stopPropagation>
      <h3 style="margin: 0 0 10px 0; color: #00adb5;">
        Import Profile — {importProfileData.game}
      </h3>

      <p style="margin-bottom: 15px; color: #ccc;">
        This profile contains <strong>{importProfileData.mods.length}</strong> mods:
      </p>

      <div class="mod-list-preview">
        {#each importProfileData.mods as mod}
          <div class="preview-mod-row">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img 
                src={mod.icon} 
                alt="" 
                style="width: 40px; height: 40px; border-radius: 6px; background: #393E46;" 
              />
              <div style="flex: 1;">
                <strong>{mod.name}</strong><br>
                <span style="color: #00adb5; font-size: 0.9rem;">
                  by {mod.owner} — v{mod.version}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div style="display: flex; gap: 12px; margin-top: 25px;">
        <button 
          class="modal-btn primary" 
          on:click={performProfileImport}
        >
          Import All Mods
        </button>

        <button 
          class="modal-btn cancel" 
          on:click={() => { 
            showImportModal = false; 
            importProfileData = null; 
            showProfileModal = true; 
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}