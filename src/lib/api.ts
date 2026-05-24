import * as fs from '@tauri-apps/plugin-fs';

const CACHE_LIFETIME_MS = 1000 * 60 * 60; // 1 hour cache

export async function fetchModsWithCache(gameIdentifier: string, apiUrl: string, force = false): Promise<any[]> {
  const cacheFileName = `${gameIdentifier}_mods_cache.json`;

  try {
    const fileExists = await fs.exists(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });

    if (fileExists && !force) {
      try {
        const fileStat = await fs.stat(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });
        
        // Robust date handling
        const now = Date.now();
        let mtimeMs = 0;

        if (fileStat.mtime) {
            // Some environments return a Date object, others a number or string
            mtimeMs = new Date(fileStat.mtime).getTime();
        }

        if (now - mtimeMs < CACHE_LIFETIME_MS && mtimeMs !== 0) {
          console.log(`[Cache] Loading ${gameIdentifier} from local storage...`);
          const cachedData = await fs.readTextFile(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });
          return JSON.parse(cachedData);
        }
      } catch (statError) {
        console.warn("[Cache] Metadata check failed, skipping cache...", statError);
      }
    }

    console.log(`[API] Fetching fresh data for ${gameIdentifier}...`);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("API response not OK");
    
    const data = await response.json();

    try {
        await fs.writeTextFile(cacheFileName, JSON.stringify(data), { 
            baseDir: fs.BaseDirectory.AppCache 
        });
    } catch (writeErr) {
        console.error("[Cache] Failed to save cache file:", writeErr);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] for ${gameIdentifier}:`, error);
    return []; 
  }
}