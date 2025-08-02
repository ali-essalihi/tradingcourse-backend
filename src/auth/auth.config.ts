import type { CookieOptions } from "express";
import env from "../env";

export const oauthStateExpiry = "10m";
export const oauthStateCookieName = "oauth_state";
export const oatuhStateBaseCookieOptions: CookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "none"
};
export const authFailureRedirectUrl = new URL("/error/auth_failed", env.CLIENT_ORIGIN).toString();

export const refreshTokenSize = 16;
export const refreshTokenExpiry = "7d";
export const minRefreshIntervalMS = 1000 * 60 * 60; // 1 hour
export const accessTokenExpiry = "15m";

export const sessionPayloadCookieName = "session_payload";
export const sessionPayloadBaseCookieOptions: CookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "none",
  signed: true
};
