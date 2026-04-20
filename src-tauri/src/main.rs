#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Serialize, Deserialize};
use std::process::Command;
use std::fs;
use tauri::Manager;
use std::path::{Path};
use reqwest;
use zip::read::ZipArchive;
use std::io::Cursor;

#[derive(Serialize)]
pub struct ProfileMod {
    pub owner: String,
    pub name: String,
    pub version: String,
    pub full_name: String,
}

#[tauri::command]
async fn resolve_legacy_profile(code: String) -> Result<Vec<ProfileMod>, String> {
    let url = format!("https://thunderstore.io/api/experimental/legacyprofile/get/{}", code);

    let client = reqwest::Client::new();
    let resp = client.get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

    let mut text = String::from_utf8_lossy(&bytes).to_string();

    if text.starts_with("#r2modman") {
        text = text.split('\n').skip(1).collect::<Vec<_>>().join("\n").trim().to_string();
    }

    // Modern base64 API (removes deprecation warning)
    use base64::{Engine, engine::general_purpose};
    let zip_bytes = general_purpose::STANDARD
        .decode(&text)
        .map_err(|e| format!("Base64 Decode Error: {}", e))?;

    let cursor = Cursor::new(zip_bytes);
    let mut archive = ZipArchive::new(cursor).map_err(|e| format!("Zip Error: {}", e))?;

    let mut export_content = String::new();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        if file.name() == "export.r2x" {
            std::io::Read::read_to_string(&mut file, &mut export_content)
                .map_err(|e| e.to_string())?;
            break;
        }
    }

    if export_content.is_empty() {
        return Err("export.r2x not found in profile".into());
    }

    let lines: Vec<&str> = export_content.lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .collect();

    let mut mods = Vec::new();

    for line in lines {
        let parts: Vec<&str> = line.split('-').collect();
        if parts.len() >= 3 {
            let name = parts.last().unwrap().to_string();
            let owner = parts[1..parts.len()-1].join("-").replace(" name: ", "");
            let version = parts[0].to_string();
            
            mods.push(ProfileMod {
                owner,
                name,
                version,
                full_name: line.to_string(),
            });
        }
    }

    Ok(mods)
}

#[tauri::command]
async fn install_mod(
    app_handle: tauri::AppHandle,
    download_url: String,
    project_name: String,
    game_name: String,
    profile_name: String,
    mod_name: String,
) -> Result<(), String> {
    
    use std::fs;
    use std::io::Cursor;
    use std::path::{Path, PathBuf};

    // 1. Setup Base Profile Path
    let mut profile_path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    profile_path.push(&project_name);
    profile_path.push(&game_name);
    profile_path.push("profiles");
    profile_path.push(&profile_name);

    // 2. Download ZIP
    let client = reqwest::Client::new();
    let response_bytes = client.get(download_url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .bytes()
        .await
        .map_err(|e| e.to_string())?;

    let cursor = Cursor::new(response_bytes);
    let mut archive = zip::ZipArchive::new(cursor).map_err(|e| e.to_string())?;

    // 3. Collect all paths first (avoids borrow conflicts)
let mut paths: Vec<PathBuf> = Vec::new();

for i in 0..archive.len() {
    if let Ok(file) = archive.by_index(i) {
        if let Some(path) = file.enclosed_name() {
            paths.push(path.to_path_buf());
        }
    }
}

// 4. Detect BepInEx root
let mut found_root: Option<PathBuf> = None;

for path in &paths {
    if let Some(filename) = path.file_name() {
        if filename == "doorstop_config.ini" {
            let parent = path.parent().unwrap_or(Path::new("")).to_path_buf();

            let mut has_winhttp = false;
            let mut has_bepinex_folder = false;

            for p in &paths {
                // same directory check
                if p.parent() == Some(parent.as_path()) {
                    if let Some(name) = p.file_name() {
                        if name == "winhttp.dll" {
                            has_winhttp = true;
                        }
                    }
                }

                // check for BepInEx folder
                if p.starts_with(parent.join("BepInEx")) {
                    has_bepinex_folder = true;
                }
            }

            if has_winhttp && has_bepinex_folder {
                found_root = Some(parent);
                break;
            }
        }
    }
}
    // 4. Extract
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;

        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        let target_path: PathBuf = if let Some(root) = &found_root {
            // Only extract files inside detected root
            if let Ok(stripped) = outpath.strip_prefix(root) {
                if stripped.as_os_str().is_empty() {
                    continue;
                }
                profile_path.join(stripped)
            } else {
                continue; // skip anything outside
            }
        } else {
            // Normal mod install
            let mut plugin_path = profile_path.clone();
            plugin_path.push("BepInEx");
            plugin_path.push("plugins");
            plugin_path.push(&mod_name);
            plugin_path.join(outpath)
        };

        if file.name().ends_with('/') {
            fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = target_path.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }

            let mut outfile = fs::File::create(&target_path).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
fn get_game_location(app_handle: tauri::AppHandle, slug: String) -> Result<Option<String>, String> {
    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push("RogueModManager");
    path.push("GameLocations");
    path.push(format!("{}.txt", slug));

    if path.exists() {
        let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
        return Ok(Some(content.trim().to_string()));
    }
    Ok(None)
}

#[tauri::command]
fn save_game_location(app_handle: tauri::AppHandle, slug: String, exe_path: String) -> Result<(), String> {
    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push("RogueModManager");
    path.push("GameLocations");
    
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    path.push(format!("{}.txt", slug));

    fs::write(path, exe_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn discover_game_path(slug: String) -> Result<String, String> {
    let steam_vdf = Path::new(r"C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf");
    if !steam_vdf.exists() { return Err("Steam installation not found".into()); }

    let content = fs::read_to_string(steam_vdf).map_err(|e| e.to_string())?;
    let mut library_paths = Vec::new();
    
    for line in content.lines() {
        if line.contains("\"path\"") {
            let parts: Vec<&str> = line.split('"').collect();
            if parts.len() >= 4 {
                library_paths.push(parts[3].replace("\\\\", "\\"));
            }
        }
    }

    for lib in library_paths {
        let common = Path::new(&lib).join("steamapps").join("common");
        if !common.exists() { continue; }

        if let Ok(entries) = fs::read_dir(common) {
            for entry in entries.flatten() {
                let folder_name = entry.file_name().to_string_lossy().to_lowercase();
                if folder_name == slug.to_lowercase() {
                    let game_folder = entry.path();
                    if let Ok(files) = fs::read_dir(&game_folder) {
                        for file in files.flatten() {
                            let path = file.path();
                            if path.extension().and_then(|s| s.to_str()) == Some("exe") {
                                return Ok(path.to_string_lossy().into_owned());
                            }
                        }
                    }
                }
            }
        }
    }
    Err("Game folder not found in Steam libraries".into())
}

#[tauri::command]
async fn launch_game(
    app_handle: tauri::AppHandle,
    project_name: String,
    game_name: String,
    profile_name: String,
    executable_path: String,
) -> Result<(), String> {
    // === NEW: Ensure Steam is running first ===
    ensure_steam_running().await?;

    let mut profile_path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    profile_path.push(&project_name);
    profile_path.push(&game_name);
    profile_path.push("profiles");
    profile_path.push(&profile_name);

    let mut preloader_path = profile_path.clone();
    preloader_path.push("BepInEx");
    preloader_path.push("core");
    preloader_path.push("BepInEx.Preloader.dll");

    if !preloader_path.exists() {
        return Err("BepInEx Preloader not found. Have you installed BepInEx?".into());
    }

    let exe_path = std::path::Path::new(&executable_path);
    if let Some(game_dir) = exe_path.parent() {
        // 1. Copy the proxy DLL (winhttp.dll is the standard for BepInEx)
        let mut proxy_found = false;
        for proxy_name in ["winhttp.dll", "version.dll"] {
            let proxy_src = profile_path.join(proxy_name);
            if proxy_src.exists() {
                let proxy_dest = game_dir.join("winhttp.dll");
                fs::copy(&proxy_src, &proxy_dest).map_err(|e| e.to_string())?;
                proxy_found = true;
                break;
            }
        }

        if !proxy_found {
            return Err("No proxy DLL found in profile folder.".into());
        }

        // 2. Create .doorstop_version marker
        let version_marker = game_dir.join(".doorstop_version");
        fs::write(&version_marker, "4.0.0.0").map_err(|e| e.to_string())?;

        // 3. Write doorstop_config.ini (exact format you already had)
        let config_dest = game_dir.join("doorstop_config.ini");
        let preloader_str = preloader_path.to_str().unwrap().replace("/", "\\");
        
        let config_content = format!(
            "[General]\nenabled=true\ntarget_assembly={}\nredirect_output_log=false\n",
            preloader_str
        );
        fs::write(&config_dest, config_content).map_err(|e| e.to_string())?;
    }

    // 4. Launch the game
    Command::new(&executable_path)
        .env("DOORSTOP_ENABLE", "TRUE")
        .env("DOORSTOP_INVOKE_DLL_PATH", preloader_path.to_str().unwrap())
        .spawn()
        .map_err(|e| format!("Failed to launch game: {}", e))?;

    Ok(())
}

async fn ensure_steam_running() -> Result<(), String> {
    // Check if Steam is already running
    let output = Command::new("tasklist")
        .args(["/FI", "IMAGENAME eq steam.exe", "/NH"])
        .output()
        .map_err(|e| format!("Failed to check Steam: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    if stdout.contains("steam.exe") {
        return Ok(()); // Steam is already running
    }

    // Steam is not running → start it silently
    println!("Steam not detected. Starting Steam...");

    let steam_path = r"C:\Program Files (x86)\Steam\steam.exe";
    
    let _ = Command::new(steam_path)
        .arg("-silent")
        .spawn()
        .map_err(|e| format!("Failed to start Steam: {}", e))?;

    // Wait for Steam to initialize (better than fixed delay in JS)
    tokio::time::sleep(std::time::Duration::from_secs(5)).await;

    Ok(())
}

#[tauri::command]
fn list_profiles(app_handle: tauri::AppHandle, project_name: String, game_name: String) -> Vec<String> {
    let mut path = app_handle.path().config_dir().unwrap();
    path.push(&project_name);
    path.push(&game_name);
    path.push("profiles");

    // Always ensure the profiles folder and Default profile exist
    let _ = std::fs::create_dir_all(&path);
    let default_path = path.join("Default");
    let _ = std::fs::create_dir_all(&default_path);

    let mut profiles = vec!["Default".to_string()];

    if let Ok(entries) = std::fs::read_dir(&path) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Ok(name) = entry.file_name().into_string() {
                    // Prevent duplicate "Default" (case-insensitive)
                    if name.to_lowercase() != "default" {
                        profiles.push(name);
                    }
                }
            }
        }
    }

    profiles.sort();
    profiles.dedup();

    profiles
}

#[tauri::command]
fn create_profile(app_handle: tauri::AppHandle, project_name: String, game_name: String, profile_name: String) -> Result<(), String> {
    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push(&project_name);
    path.push(&game_name);
    path.push("profiles");

    if let Ok(entries) = std::fs::read_dir(&path) {
        for entry in entries.flatten() {
            if let Ok(name) = entry.file_name().into_string() {
                if name.to_lowercase() == profile_name.to_lowercase() {
                    return Err("A profile with this name already exists.".into());
                }
            }
        }
    }

    path.push(&profile_name);
    std::fs::create_dir_all(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_profile(app_handle: tauri::AppHandle, project_name: String, game_name: String, profile_name: String) -> Result<(), String> {
    if profile_name.to_lowercase() == "default" {
        return Err("Cannot delete the Default profile.".into());
    }

    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push(project_name);
    path.push(game_name);
    path.push("profiles");
    path.push(profile_name);

    if path.exists() {
        std::fs::remove_dir_all(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModVersion {
    pub major: u32,
    pub minor: u32,
    pub patch: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct ModManifestEntry {
    pub name: String,
    pub authorName: String,
    pub versionNumber: ModVersion,
    pub enabled: bool,
    pub dependencies: Vec<String>,
	pub icon: Option<String>,
}

fn parse_version(v: &str) -> ModVersion {
    let parts: Vec<u32> = v.split('.').map(|s| s.parse().unwrap_or(0)).collect();
    ModVersion {
        major: *parts.get(0).unwrap_or(&0),
        minor: *parts.get(1).unwrap_or(&1),
        patch: *parts.get(2).unwrap_or(&0),
    }
}

#[tauri::command]
fn get_installed_mods(app_handle: tauri::AppHandle, project_name: String, game_name: String, profile_name: String) -> Result<Vec<ModManifestEntry>, String> {
    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push(&project_name);
    path.push(&game_name);
    path.push("profiles");
    path.push(&profile_name);
    path.push("mods.yml");

    if !path.exists() {
        return Ok(vec![]);
    }

    let content = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mods: Vec<ModManifestEntry> = serde_yaml::from_str(&content).map_err(|e| e.to_string())?;
    Ok(mods)
}

#[tauri::command]
fn sync_profile_loader(app_handle: tauri::AppHandle, project_name: String, game_name: String, profile_name: String, executable_path: String) -> Result<(), String> {
    let mut profile_path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    profile_path.push(&project_name);
    profile_path.push(&game_name);
    profile_path.push("profiles");
    profile_path.push(&profile_name);

    // Path to the game directory (where the exe is)
    let exe_path = std::path::Path::new(&executable_path);
    let game_dir = exe_path.parent().ok_or("Invalid executable path")?;

    // 1. Update doorstop_config.ini
    let ini_path = game_dir.join("doorstop_config.ini");
    let target_assembly = profile_path.join("BepInEx").join("core").join("BepInEx.Preloader.dll");
    
    let ini_content = format!(
        "[General]\nenabled=true\ntarget_assembly={}\nredirect_output_log=false",
        target_assembly.to_string_lossy()
    );
    std::fs::write(ini_path, ini_content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn toggle_mod_status(app_handle: tauri::AppHandle, project_name: String, game_name: String, profile_name: String, mod_id: String, enabled: bool) -> Result<(), String> {
    let mut path = app_handle.path().config_dir().map_err(|e| e.to_string())?;
    path.push(&project_name);
    path.push(&game_name);
    path.push("profiles");
    path.push(&profile_name);
    path.push("mods.yml");

    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let mut mods: Vec<ModManifestEntry> = serde_yaml::from_str(&content).map_err(|e| e.to_string())?;

    if let Some(m) = mods.iter_mut().find(|m| m.name == mod_id) {
        m.enabled = enabled;
    }

    let yaml = serde_yaml::to_string(&mods).map_err(|e| e.to_string())?;
    std::fs::write(path, yaml).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn register_mod_install(
    app_handle: tauri::AppHandle, 
    project_name: String, 
    game_name: String, 
    profile_name: String,
    mod_id: String, 
    author: String, 
    version: String, 
    deps: Vec<String>,
	icon: Option<String>
) -> Result<(), String> {
    let mut path = app_handle.path().config_dir().unwrap();
    path.push(&project_name); path.push(&game_name); path.push("profiles"); path.push(&profile_name);
    std::fs::create_dir_all(&path).ok();
    path.push("mods.yml");

    let mut mods = if path.exists() {
        let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
        serde_yaml::from_str::<Vec<ModManifestEntry>>(&content).unwrap_or_default()
    } else { vec![] };

    mods.retain(|m| m.name != mod_id); 
    mods.push(ModManifestEntry {
        name: mod_id,
        authorName: author,
        versionNumber: parse_version(&version),
        enabled: true,
        dependencies: deps,
		icon,
    });

    let yaml = serde_yaml::to_string(&mods).map_err(|e| e.to_string())?;
    std::fs::write(path, yaml).map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init()) 
		.plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            install_mod,
            get_installed_mods,
			toggle_mod_status,
			resolve_legacy_profile,
            register_mod_install,
            launch_game,
			sync_profile_loader,
			list_profiles,
			create_profile,
			delete_profile,
			get_game_location,
			save_game_location,
			discover_game_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}