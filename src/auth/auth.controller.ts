import type { Request, Response } from "express";
import {
  getGoogleAuthUrlQuerySchema,
  googleCallbackCookiesSchema,
  googleCallbackQuerySchema
} from "./auth.schemas";
import {
  decodeGoogleIdToken,
  fetchGoogleIdToken,
  generateAccessToken,
  generateGoogleAuthURL,
  generateOauthState,
  generateRefreshToken,
  verifyOauthState
} from "./auth.utils";
import {
  oauthStateExpiry,
  oauthStateCookieName,
  oatuhStateBaseCookieOptions,
  authFailureRedirectUrl,
  refreshTokenExpiry,
  sessionPayloadCookieName,
  sessionPayloadBaseCookieOptions,
  minRefreshIntervalMS
} from "./auth.config";
import ms from "ms";
import env from "../env";
import * as userModel from "../models/user.model";
import * as refreshTokenModel from "../models/refresh-token.model";
import { SessionPayload } from "./auth.types";

export function getGoogleAuthUrl(req: Request, res: Response) {
  const queryParsed = getGoogleAuthUrlQuerySchema.safeParse(req.query);
  let nextURL = "/";
  if (queryParsed.success) nextURL = queryParsed.data.next_url;

  const oauthState = generateOauthState(nextURL);

  res.cookie(oauthStateCookieName, oauthState, {
    ...oatuhStateBaseCookieOptions,
    maxAge: ms(oauthStateExpiry)
  });

  res.json({ url: generateGoogleAuthURL(oauthState) });
}

export async function handleGoogleCallback(req: Request, res: Response) {
  const parsedQuery = googleCallbackQuerySchema.safeParse(req.query);
  const parsedCookies = googleCallbackCookiesSchema.safeParse(req.cookies);

  function failureRedirect() {
    res.redirect(302, authFailureRedirectUrl);
  }

  if (!parsedQuery.success || !parsedCookies.success) {
    return failureRedirect();
  }

  if ("error" in parsedQuery.data || parsedCookies.data.oauth_state !== parsedQuery.data.state) {
    return failureRedirect();
  }

  const decodedState = verifyOauthState(parsedQuery.data.state);

  if (!decodedState) {
    return failureRedirect();
  }

  const idToken = await fetchGoogleIdToken(parsedQuery.data.code);
  const idTokenDecoded = decodeGoogleIdToken(idToken);

  const user = userModel.findByGoogleId(idTokenDecoded.sub);
  const userId =
    (user && user.id) ||
    userModel.create({ google_id: idTokenDecoded.sub, email: idTokenDecoded.email });

  const refreshTokenDurationMS = ms(refreshTokenExpiry);
  const refreshTokenExpires = new Date(Date.now() + refreshTokenDurationMS);
  const refreshTokenValue = generateRefreshToken();

  refreshTokenModel.create({
    token: refreshTokenValue,
    expires: refreshTokenExpires.toISOString(),
    user_id: userId as number
  });

  const sessionPayload: SessionPayload = {
    refreshToken: refreshTokenValue,
    userData: {
      googleId: idTokenDecoded.sub,
      email: idTokenDecoded.email,
      name: idTokenDecoded.name ?? null,
      picture: idTokenDecoded.picture ?? null
    }
  };

  res.cookie(sessionPayloadCookieName, sessionPayload, {
    ...sessionPayloadBaseCookieOptions,
    maxAge: refreshTokenDurationMS
  });

  res.redirect(302, new URL(decodedState.next_url, env.CLIENT_ORIGIN).toString());
}

export function handleTokenRefresh(req: Request, res: Response) {
  const sessionPayload = req.signedCookies[sessionPayloadCookieName] as SessionPayload | undefined;

  function unauthorized() {
    res.status(401).json({ message: "Unauthorized" });
  }

  if (!sessionPayload) {
    return unauthorized();
  }

  const refreshToken = refreshTokenModel.find(sessionPayload.refreshToken);

  if (!refreshToken) {
    return unauthorized();
  }

  if (Date.now() >= new Date(refreshToken.expires).getTime()) {
    refreshTokenModel.remove(refreshToken.token);
    return unauthorized();
  }

  if (Date.now() - new Date(refreshToken.rotated_at).getTime() >= minRefreshIntervalMS) {
    const newToken = generateRefreshToken();
    sessionPayload.refreshToken = newToken;
    refreshTokenModel.rotate(refreshToken.id, newToken);
    res.cookie(sessionPayloadCookieName, sessionPayload, {
      ...sessionPayloadBaseCookieOptions,
      maxAge: Math.max(0, new Date(refreshToken.expires).getTime() - Date.now())
    });
  }

  const accessToken = generateAccessToken(sessionPayload.userData);

  res.json({ accessToken });
}

export function getAuthenticatedUser(req: Request, res: Response) {
  res.json({
    email: req.user.email,
    picture: req.user.picture,
    name: req.user.name
  });
}

export function logout(req: Request, res: Response) {
  const sessionPayload = req.signedCookies[sessionPayloadCookieName] as SessionPayload | undefined;
  if (sessionPayload) {
    refreshTokenModel.remove(sessionPayload.refreshToken);
  }
  res.clearCookie(sessionPayloadCookieName, { ...sessionPayloadBaseCookieOptions, signed: false });
  res.json({ message: "Logout successful." });
}
