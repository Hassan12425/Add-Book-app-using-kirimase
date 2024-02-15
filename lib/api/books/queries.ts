import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type BookId, bookIdSchema, books } from "@/lib/db/schema/books";
import { aurthors } from "@/lib/db/schema/aurthors";
import { quotes, type CompleteQuote } from "@/lib/db/schema/quotes";
import {
  reflection,
  type CompleteReflection,
} from "@/lib/db/schema/reflection";
import { CompleteReview, reviews } from "@/lib/db/schema/reviews";
export const getBooks = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select({ book: books, aurthor: aurthors })
    .from(books)
    .leftJoin(aurthors, eq(books.aurthorId, aurthors.id))
    .where(eq(books.userId, session?.user.id!));
  const b = rows.map((r) => ({ ...r.book, aurthor: r.aurthor }));
  return { books: b };
};

export const getBookById = async (id: BookId) => {
  const { session } = await getUserAuth();
  const { id: bookId } = bookIdSchema.parse({ id });
  const [row] = await db
    .select({ book: books, aurthor: aurthors })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, session?.user.id!)))
    .leftJoin(aurthors, eq(books.aurthorId, aurthors.id))
    

  if (row === undefined) return {};
  const b = { ...row.book, aurthor: row.aurthor};
  return { book: b };
};

export const getBookByIdWithQuotesAndReflection = async (id: BookId) => {
  const { session } = await getUserAuth();
  const { id: bookId } = bookIdSchema.parse({ id });
  const rows = await db
    .select({ book: books, quote: quotes, reflection: reflection,review:reviews })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, session?.user.id!)))
    .leftJoin(quotes, eq(books.id, quotes.bookId))
    .leftJoin(reflection, eq(books.id, reflection.bookId))
    .leftJoin(reviews, eq(books.id, reviews.bookId));

  if (rows.length === 0) return {};
  const b = rows[0].book;
  const bq = rows
    .filter((r) => r.quote !== null)
    .map((q) => q.quote) as CompleteQuote[];
  const br = rows
    .filter((r) => r.reflection !== null)
    .map((r) => r.reflection) as CompleteReflection[];
    const bre = rows
    .filter((r) => r.review !== null)
    .map((r) => r.review) as CompleteReview[];

  return { book: b, quotes: bq, reflection: br,reviews:bre };
};
