import type { Request, Response } from "express";
import { getBunnyLibInfo, getBunnyLibVideos } from "./bunny/bunny.utils";

export function getCourse(req: Request, res: Response) {
  res.json({
    lib: getBunnyLibInfo(),
    videos: getBunnyLibVideos()
  });
}
