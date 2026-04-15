import * as fs from '@tauri-apps/plugin-fs';

const CACHE_LIFETIME_MS = 1000 * 60 * 60;

export async function fetchModsWithCache(gameIdentifier: string, apiUrl: string, force = false): Promise<any[]> {
  const cacheFileName = `${gameIdentifier}_mods_cache.json`;

  try {
    const fileExists = await fs.exists(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });

    if (fileExists && !force) {
      const fileStat = await fs.stat(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });
      const now = new Date().getTime();
      const lastModified = fileStat.mtime?.getTime() || 0;

      if (now - lastModified < CACHE_LIFETIME_MS) {
        console.log(`[Cache] Loading ${gameIdentifier} from local storage...`);
        const cachedData = await fs.readTextFile(cacheFileName, { baseDir: fs.BaseDirectory.AppCache });
        return JSON.parse(cachedData);
      }
    }

    console.log(`[API] Fetching fresh data for ${gameIdentifier}...`);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("API response not OK");
    
    const data = await response.json();

    await fs.writeTextFile(cacheFileName, JSON.stringify(data), { 
      baseDir: fs.BaseDirectory.AppCache 
    });
    
    return data;

  } catch (err) {
    console.error("Caching system error, falling back to network:", err);
    const response = await fetch(apiUrl);
    return await response.json();
  }
}