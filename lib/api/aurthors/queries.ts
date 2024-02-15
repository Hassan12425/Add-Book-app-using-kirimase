import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type AurthorId, aurthorIdSchema, aurthors } from "@/lib/db/schema/aurthors";
import { books, type CompleteBook } from "@/lib/db/schema/books";

export const getAurthors = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select().from(aurthors).where(eq(aurthors.userId, session?.user.id!));
  const a = rows
  return { aurthors: a };
};

export const getAurthorById = async (id: AurthorId) => {
  const { session } = await getUserAuth();
  const { id: aurthorId } = aurthorIdSchema.parse({ id });
  const [row] = await db.select().from(aurthors).where(and(eq(aurthors.id, aurthorId), eq(aurthors.userId, session?.user.id!)));
  if (row === undefined) return {};
  const a = row;
  return { aurthor: a };
};

export const getAurthorByIdWithBooks = async (id: AurthorId) => {
  const { session } = await getUserAuth();
  const { id: aurthorId } = aurthorIdSchema.parse({ id });
  const rows = await db.select({ aurthor: aurthors, book: books }).from(aurthors).where(and(eq(aurthors.id, aurthorId), eq(aurthors.userId, session?.user.id!))).leftJoin(books, eq(aurthors.id, books.aurthorId));
  if (rows.length === 0) return {};
  const a = rows[0].aurthor;
  const ab = rows.filter((r) => r.book !== null).map((b) => b.book) as CompleteBook[];

  return { aurthor: a, books: ab };
};

