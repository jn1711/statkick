import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

type InsertUserData = {
  unionId: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: "user" | "admin";
  lastSignInAt?: Date;
};

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUserData) {
  const values = { ...data } as Record<string, unknown>;
  const updateSet: Record<string, unknown> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values as schema.User)
    .onDuplicateKeyUpdate({ set: updateSet });
}
