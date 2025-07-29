import type { Request, Response } from "express";

export function getCourse(req: Request, res: Response) {
  res.sendStatus(200);
}
