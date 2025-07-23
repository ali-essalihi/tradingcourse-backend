import { z } from "zod";
import { oauthStateCookieName } from "./auth.config";

const nextURLSchema = z
  .string()
  .startsWith("/")
  .refine(nextURL => !nextURL.startsWith("//"));

export const getGoogleAuthUrlQuerySchema = z.object({
  next_url: nextURLSchema
});

const stateSchema = z.jwt();

export const googleCallbackQuerySchema = z.union([
  z.object({ state: stateSchema, code: z.string().nonempty() }),
  z.object({ state: stateSchema, error: z.string().nonempty() })
]);

export const googleCallbackCookiesSchema = z.object({
  [oauthStateCookieName]: stateSchema
});

export const authHeaderSchema = z
  .string()
  .refine(header => {
    const [scheme, token] = header.split(" ");
    return scheme === "Bearer" && !!token;
  })
  .transform(header => header.split(" ")[1]);
