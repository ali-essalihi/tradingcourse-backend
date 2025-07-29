import fs from "fs/promises";
import path from "path";

type CacheOptions<T> = {
  fetcher: () => Promise<T>;
  cacheFilePath: string;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
};

export async function cacheAsyncData<T>({
  fetcher,
  cacheFilePath,
  serialize = JSON.stringify,
  deserialize = JSON.parse
}: CacheOptions<T>): Promise<T> {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    try {
      const data = await fs.readFile(cacheFilePath, "utf-8");
      return deserialize(data);
    } catch {
      // File doesn’t exist or failed to parse, fallback to fetch
    }
  }

  const data = await fetcher();

  if (!isProd) {
    try {
      await fs.mkdir(path.dirname(cacheFilePath), { recursive: true });
      await fs.writeFile(cacheFilePath, serialize(data), "utf-8");
    } catch (err) {
      console.warn("Failed to write cache:", err);
    }
  }

  return data;
}
