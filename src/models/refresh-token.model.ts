import db from "../db";
import type { RefreshTokenRow } from "../types/db.types";

const createStmt = db.prepare(
  "INSERT INTO refresh_tokens(user_id, token, expires, rotated_at) " +
    "VALUES (@user_id, @token, @expires, @rotated_at)"
);

type CreatePayload = Pick<RefreshTokenRow, "user_id" | "token" | "expires">;

export function create(payload: CreatePayload) {
  const { changes, lastInsertRowid } = createStmt.run({
    ...payload,
    rotated_at: new Date().toISOString()
  });
  if (changes !== 1) throw new Error("Failed to insert refresh token");
  return lastInsertRowid;
}

const findStmt = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?");

export function find(token: string) {
  return findStmt.get(token) as RefreshTokenRow | undefined;
}

const rotateStmt = db.prepare("UPDATE refresh_tokens SET token = ?, rotated_at = ? WHERE id = ?");

export function rotate(id: number, newToken: string) {
  rotateStmt.run([newToken, new Date().toISOString(), id]);
}

const removeStmt = db.prepare("DELETE FROM refresh_tokens WHERE token = ?");

export function remove(token: string) {
  removeStmt.run(token);
}
