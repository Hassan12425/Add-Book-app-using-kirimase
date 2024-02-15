import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ReflectionId, reflectionIdSchema, reflection } from "@/lib/db/schema/reflection";
import { books } from "@/lib/db/schema/books";

export const getReflections = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ reflection: reflection, book: books }).from(reflection).leftJoin(books, eq(reflection.bookId, books.id)).where(eq(reflection.userId, session?.user.id!));
  const r = rows .map((r) => ({ ...r.reflection, book: r.book})); 
  return { reflection: r };
};

export const getReflectionById = async (id: ReflectionId) => {
  const { session } = await getUserAuth();
  const { id: reflectionId } = reflectionIdSchema.parse({ id });
  const [row] = await db.select({ reflection: reflection, book: books }).from(reflection).where(and(eq(reflection.id, reflectionId), eq(reflection.userId, session?.user.id!))).leftJoin(books, eq(reflection.bookId, books.id));
  if (row === undefined) return {};
  const r =  { ...row.reflection, book: row.book } ;
  return { reflection: r };
};


