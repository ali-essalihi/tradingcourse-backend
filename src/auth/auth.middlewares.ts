import type { Request, Response, NextFunction } from "express";
import { authHeaderSchema } from "./auth.schemas";
import { verifyAccessToken } from "./auth.utils";

export function ensureAuthenticated() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeaderParsed = authHeaderSchema.safeParse(req.headers.authorization);

    function unauthorized() {
      res.status(401).json({ message: "Unauthorized" });
    }

    if (!authHeaderParsed.success) {
      return unauthorized();
    }

    const accessToken = verifyAccessToken(authHeaderParsed.data);

    if (!accessToken) {
      return unauthorized();
    }

    req.user = {
      googleId: accessToken.googleId,
      email: accessToken.email,
      name: accessToken.name,
      picture: accessToken.picture
    };

    next();
  };
}
