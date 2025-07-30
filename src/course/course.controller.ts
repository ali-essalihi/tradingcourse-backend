import type { Request, Response } from "express";
import type { CourseRes } from "./course.types";
import { generateVideoEmbedUrl, getBunnyLibVideos } from "./bunny/bunny.utils";

export function getCourse(req: Request, res: Response<CourseRes>) {
  res.json({
    videos: getBunnyLibVideos().arr.map(v => ({
      id: v.guid,
      title: v.title,
      durationInSeconds: v.length
    }))
  });
}

export function getVideoEmbedUrl(req: Request, res: Response) {
  const videosMap = getBunnyLibVideos().map;
  const videoId = req.params.videoId;

  if (!videosMap.has(videoId)) {
    return res.status(404).json({ message: "Video not found." });
  }

  res.json({
    url: generateVideoEmbedUrl(videoId)
  });
}
