<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { activeModTab, selectedGame, globalMods, focusedMod, profileList, selectedProfile } from '$lib/store';
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-dialog';
  import "$lib/PageStyles/LayoutPage.css";

  function returnToMenu() {
    globalMods.set([]);
    selectedGame.set(null);
	focusedMod.set(null);
    goto('/');
  }
  
let isLaunching = false;
$: if ($selectedGame) {
    refreshProfiles();
}

$: if (showSettings) {
    if ($selectedGame) {
      // If we have a game but no path, try to find it silently while settings is open
      if (!$selectedGame.executablePath) {
        tempPath = "Not located. Click browse or launch the game to find it.";
      } else {
        tempPath = $selectedGame.executablePath;
      }
    } else {
      tempPath = "Select a game first";
    }
  }
  
async function refreshProfiles() {
    if (!$selectedGame) return;
    try {
      const list = await invoke('list_profiles', { 
        projectName: "RogueModManager", 
        gameName: $selectedGame.id 
      });
      profileList.set(list);
    } catch (e) {
      console.error("Failed to list profiles:", e);
    }
  }

  let showSettings = false;
  let tempPath = "";

  // Reactive: Update path display when modal opens or game changes
  $: if (showSettings) {
    if ($selectedGame) {
      tempPath = $selectedGame.executablePath;
    } else {
      tempPath = "Please select a game first";
    }
  }

  async function browseNewPath() {
    const selected = await open({
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
      // Update the global store so the "Launch" button uses the new path
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
  
  let showDropdown = false;
  
    // Close dropdown when clicking outside
  function closeDropdown(e) {
    if (showDropdown && !e.target.closest('.custom-select-container')) {
      showDropdown = false;
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
      alert(e);
    }
  }
  
  async function launchModdedGame() {
    if (!$selectedGame) return;

    let currentPath = $selectedGame.executablePath;

    // 1. If path is missing, try Auto-Discovery first
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

    // 2. If STILL missing, prompt the user manually
    if (!currentPath) {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        title: `Locate ${$selectedGame.name} Executable to Launch`
      });

      if (selected) {
        currentPath = selected;
        await invoke('save_game_location', { slug: $selectedGame.slug, exePath: currentPath });
        selectedGame.update(g => ({ ...g, executablePath: currentPath }));
      } else {
        return; // User cancelled, don't launch
      }
    }

    // 3. Final Check & Launch
    isLaunching = true;
    try {
		await open("steam://open/main");
        await new Promise(resolve => setTimeout(resolve, 3000));
		
      await invoke('launch_game', {
        projectName: "RogueModManager", 
        gameName: $selectedGame.id,
        profileName: $selectedProfile || "default",
        executablePath: currentPath
      });
    } catch (e) {
      alert("Launch failed: " + e);
    } finally {
      isLaunching = false;
    }
  }
</script>
<svelte:window on:click={closeDropdown} />
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
      {$selectedProfile}
      <span class="chevron">{showDropdown ? '▲' : '▼'}</span>
    </button>

    {#if showDropdown}
      <div class="select-dropdown">
        <div class="options-list">
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
        </div>
        
        <button class="add-profile-btn" on:click={addNewProfile}>
          + New Profile
        </button>
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
