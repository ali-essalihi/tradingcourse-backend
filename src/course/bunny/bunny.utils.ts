import type { BunnyLibInfo, BunnyLibVideo } from "./bunny.types";
import fetch from "node-fetch";
import env from "../../env";
import path from "path";
import { cacheAsyncData } from "../../utils/misc";
import { createHash } from "crypto";
import { videoTokenExpirationSeconds } from "../course.config";

const cacheDir = path.resolve(".cache");

let bunnyLibInfo: BunnyLibInfo;
let bunnyLibVideosArr: BunnyLibVideo[];
let bunnyLibVideosMap: Map<string, BunnyLibVideo>;

export async function loadBunnyLibInfo() {
  const data = await cacheAsyncData<BunnyLibInfo>({
    fetcher: async () => {
      const url = `https://api.bunny.net/videolibrary/${env.BUNNY_LIB_ID}`;
      const res = await fetch(url, {
        headers: {
          AccessKey: env.BUNNY_API_KEY,
          Accept: "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load Bunny Library Info: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    cacheFilePath: path.resolve(cacheDir, "bunny-lib-info.json")
  });

  bunnyLibInfo = data;
}

export function getBunnyLibInfo() {
  if (!bunnyLibInfo) {
    throw new Error("Bunny Library info has not been loaded yet.");
  }
  return bunnyLibInfo;
}

export async function loadBunnyLibVideos() {
  const data = await cacheAsyncData<{ items: BunnyLibVideo[] }>({
    fetcher: async () => {
      const libInfo = getBunnyLibInfo();
      const url = `https://video.bunnycdn.com/library/${env.BUNNY_LIB_ID}/videos`;
      const res = await fetch(url, {
        headers: {
          AccessKey: libInfo.ApiKey,
          Accept: "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load Bunny Library Videos: ${res.status} ${res.statusText}`);
      }
      return res.json();
    },
    cacheFilePath: path.resolve(cacheDir, "bunny-lib-videos.json")
  });

  const { items } = data;
  bunnyLibVideosMap = new Map();
  bunnyLibVideosArr = [];

  for (const item of items) {
    bunnyLibVideosMap.set(item.guid, item);
    bunnyLibVideosArr.push(item);
  }
}

export function getBunnyLibVideos() {
  if (!bunnyLibVideosArr || !bunnyLibVideosMap) {
    throw new Error("Bunny videos have not been loaded yet.");
  }

  return {
    map: bunnyLibVideosMap,
    arr: bunnyLibVideosArr
  };
}

export function generateVideoAccessToken(videoId: string, expires: string) {
  return createHash("sha256")
    .update(env.BUNNY_LIB_SECRET + videoId + expires)
    .digest("hex");
}

export function generateVideoEmbedUrl(videoId: string) {
  const url = new URL(`https://iframe.mediadelivery.net/embed/${env.BUNNY_LIB_ID}/${videoId}`);
  const expires = (Math.floor(Date.now() / 1000) + videoTokenExpirationSeconds).toString();
  const params = new URLSearchParams({
    token: generateVideoAccessToken(videoId, expires),
    expires
  });
  url.search = params.toString();
  return url.toString();
}

export async function initBunny() {
  await loadBunnyLibInfo();
  await loadBunnyLibVideos();
}
