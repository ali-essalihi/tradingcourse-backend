import db from "../db";
import type { UserRow } from "../types/db.types";

const findByGoogleIdStmt = db.prepare("SELECT * FROM users WHERE google_id = ?");

export function findByGoogleId(googleId: string) {
  return findByGoogleIdStmt.get(googleId) as UserRow | undefined;
}

const createStmt = db.prepare("INSERT INTO users(google_id, email) VALUES (@google_id, @email)");

type CreatePayload = Pick<UserRow, "google_id" | "email">;

export function create(payload: CreatePayload) {
  const { changes, lastInsertRowid } = createStmt.run(payload);
  if (changes !== 1) throw new Error("Failed to insert user");
  return lastInsertRowid;
}
