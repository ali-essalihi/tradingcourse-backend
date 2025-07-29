import type { Request, Response } from "express";
import type { CourseRes } from "./course.types";
import { getBunnyLibVideos } from "./bunny/bunny.utils";

export function getCourse(req: Request, res: Response<CourseRes>) {
  res.json({
    videos: getBunnyLibVideos().arr.map(v => ({
      id: v.guid,
      title: v.title,
      durationInSeconds: v.length
    }))
  });
}
