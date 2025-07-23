import type { SessionPayload } from "../auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user: SessionPayload["userData"];
    }
  }
}
