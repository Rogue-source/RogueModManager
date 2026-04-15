<script>
  import "../styles.css";
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { activeModTab, selectedGame, globalMods, focusedMod, profileList, selectedProfile } from '$lib/store';
  import { invoke } from '@tauri-apps/api/core';

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
    if (!$selectedGame || !$selectedGame.executablePath) {
      console.error("Game executable path is not configured.");
      return;
    }
    isLaunching = true;
    try {
      await invoke('launch_game', {
        projectName: "RogueModManager", 
        gameName: $selectedGame.id,
        profileName: "default",
        executablePath: $selectedGame.executablePath
      });
    } catch (e) {
      console.error(e);
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
        <button class="nav-item">Settings</button>
        <button class="nav-item">Help</button>
      </nav>
    {:else}
      <nav class="nav-menu">
        <a href="/" class="nav-item active">Games</a>
        <div class="nav-item">Settings</div>
      </nav>
    {/if}
  </aside>

  <main class="main-content">
    <slot />
  </main>
</div>

<style>
.custom-select-container {
    position: relative;
    width: 100%;
  }

  .select-trigger {
    width: 100%;
    background: #393E46;
    border: 1px solid #4e555f;
    color: #eeeeee;
    padding: 10px;
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: bold;
  }

  .select-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    background: #222831;
    border: 1px solid #4e555f;
    border-radius: 6px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    overflow: hidden;
  }

  .options-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .option-item {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #393E46;
  }

  .option-item:hover {
    background: #393E46;
  }

  .option-name {
    flex: 1;
    background: none;
    border: none;
    color: #eeeeee;
    padding: 10px;
    text-align: left;
    cursor: pointer;
  }

  .option-item.active .option-name {
    color: #00adb5;
    font-weight: bold;
  }

  .delete-btn {
    background: none;
    border: none;
    padding: 10px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .delete-btn:hover {
    opacity: 1;
  }

  .add-profile-btn {
    width: 100%;
    background: #393E46;
    border: none;
    border-top: 1px solid #4e555f;
    color: #00adb5;
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
  }

  .add-profile-btn:hover {
    background: #4e555f;
    color: #00fffb;
  }

  .chevron {
    font-size: 0.7rem;
    opacity: 0.7;
  }
  
.launch-btn {
    width: 100%;
    margin-top: 10px;
    background: #4caf50;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.2s;
  }

  .launch-btn:hover:not(:disabled) {
    background: #45a049;
  }

  .launch-btn:disabled {
    background: #4e555f;
    cursor: not-allowed;
    opacity: 0.7;
  }

/* Sidebar styles updated for labels */
  .nav-label {
    padding: 0 30px;
    font-size: 0.7rem;
    font-weight: 800;
    color: #4e555f;
    margin-bottom: 5px;
    letter-spacing: 1px;
  }
  .mt-20 { margin-top: 20px; }
  
  .app-shell {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #393E46;
    color: #eeeeee;
  }

  .sidebar {
    width: 260px;
    background-color: #222831;
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    border-right: 1px solid #1a1a1a;
  }

  .brand {
    font-size: 1.5rem;
    font-weight: 800;
    padding: 0 30px 30px;
    letter-spacing: 2px;
    color: #00adb5;
  }

  .nav-menu {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .nav-item {
    padding: 12px 30px;
    text-decoration: none;
    color: #888;
    font-weight: 600;
    transition: 0.2s;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .nav-item:hover, .nav-item.active {
    color: #eeeeee;
    background-color: #393E46;
    border-left: 4px solid #00adb5;
  }

  .sidebar-section {
    padding: 0 20px 20px;
  }

  .btn-game-home {
    background: #393E46;
    border: 1px solid #4e555f;
    color: #eeeeee;
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    text-align: left;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn-game-home:hover {
    border-color: #00adb5;
  }

  .main-content {
    flex: 1;
    overflow: hidden;
  }
  
  .launch-btn {
    width: 100%;
    background: #4caf50; /* Green theme */
    color: white;
    border: none;
    padding: 15px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;
    margin-top: 10px; /* Space below back button */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.2s, transform 0.1s;
  }

  .launch-btn:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-1px);
  }

  .launch-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .launch-btn:disabled {
    background: #4e555f;
    cursor: not-allowed;
    opacity: 0.8;
  }

  .launch-icon {
    font-size: 1.2rem;
  }
</style>