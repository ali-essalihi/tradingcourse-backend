export interface OauthStateJWTPayload {
  next_url: string;
}

export interface GoogleIdTokenDecoded {
  sub: string;
  email: string;
  picture?: string;
  name?: string;
}

export interface SessionPayload {
  refreshToken: string;
  userData: {
    googleId: string;
    email: string;
    picture: string | null;
    name: string | null;
  };
}

export type AccessTokenJWTPayload = SessionPayload["userData"];
